import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getMessages, sendMessage, getConversations, blockUser, unblockUser } from "../services/api";
import { useWebSocket } from "../context/WebSocketContext";
import "./Chat.css";
import img from "../assets/logo2.webp";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";
const FALLBACK = "/default-user.png";

function photoUrl(photo) {
  if (!photo) return FALLBACK;
  if (photo.startsWith("http")) return photo;
  return S3_BUCKET + photo;
}

/* function parseTimestamp(ts) {
  if (!ts) return null;
  let clean = ts.split("#")[0];
  if (!clean.endsWith("Z")) {
    clean += "Z";
  }
  return new Date(clean);
} */

function formatTime(ts) {
  const d = parseTimestamp(ts);
  if (!d || isNaN(d)) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
} 

  function parseTimestamp(ts) {
  if (!ts) return null;

  let clean = ts.split("#")[0].trim();

  clean = clean.replace(" ", "T");
  if (
    !clean.endsWith("Z") &&
    !clean.match(/[+-]\d{2}:\d{2}$/)
  ) {
    clean += "Z";
  }

  return new Date(clean);
}


function getDateLabel(ts) {
  const d = parseTimestamp(ts);
  if (!d || isNaN(d)) return "";

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diff = (today - msgDay) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";

  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
 

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const ws = useWebSocket();
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showUnblockPopup, setShowUnblockPopup] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingStatusRef = useRef({});
  const [isReported, setIsReported] = useState(false);

  function getMyUserId() {
    const token = localStorage.getItem("id_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub;
  }

  const myUserId = getMyUserId();

  /* AUTO FOCUS */
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [conversationId]);

  /* LOAD OTHER USER */
  useEffect(() => {

  async function loadUser() {

    if (location.state?.user?.name) {
      setOtherUser(location.state.user);
      return;
    }

    try {
      const convRes = await getConversations();

      const conv = (convRes.results || []).find(
        c => c.conversationId === conversationId
      );

      if (conv) {
        setOtherUser({
          userId: conv.userId,
          name: conv.name || "User",
          photo: conv.displayPhoto || ""
        });
      } else {
        setOtherUser({
          name: "User",
          photo: ""
        });
      }

    } catch (e) {
      setOtherUser({
        name: "User",
        photo: ""
      });
    }
  }

  if (conversationId) loadUser();

}, [conversationId]);


  /* LOAD MESSAGES */
  useEffect(() => {
    if (!conversationId) {
      navigate("/messages");
      return;
    }

    async function init() {
  setLoading(true);

  const msgRes = await getMessages(conversationId);
  setBlockedByMe(msgRes.blockedByMe === true);
  setBlockedMe(msgRes.blockedMe === true);
  setIsReported(msgRes.isReported === true);
  const loadedMessages = (msgRes?.results || []).map(m => ({
    ...m,
    originalStatus: m.originalStatus || m.status || "sent",
    status: 
      m.originalStatus === "blockedSent"
        ? "sent"
        : (m.status || "sent")
  }));

  setMessages(loadedMessages);
  setLoading(false);


  if (ws?.readyState === WebSocket.OPEN) {
    loadedMessages.forEach(m => {
      if (m.senderId !== myUserId && m.status === "sent") {
        ws.send(JSON.stringify({
          action: "delivered",
          conversationId: m.conversationId,
          messageId: m.messageId,
          createdAt: m.createdAt
        }));
      }
    });
  }
}

    init();
  }, [conversationId]);

  /* HANDLE RECONNECT */
  useEffect(() => {

  const handleReconnect = async () => {
  try {
    const res = await getMessages(conversationId);
    setBlockedByMe(res.blockedByMe === true);
    setBlockedMe(res.blockedMe === true);

    const loaded = (res.results || []).map(m => ({
      ...m,
    originalStatus: m.originalStatus || m.status || "sent",
    status: 
      m.originalStatus === "blockedSent"
        ? "sent"
        : (m.status || "sent")
  }));

    setMessages(loaded);
    if (ws?.readyState === WebSocket.OPEN) {
      loaded.forEach(m => {
        if (m.senderId !== myUserId && m.status === "sent") {
          ws.send(JSON.stringify({
            action: "delivered",
            conversationId: m.conversationId,
            messageId: m.messageId,
            createdAt: m.createdAt
          }));
        }
      });
    }

  } catch (e) {
    console.error("Chat reload failed");
  }
};
window.addEventListener("ws-connected", handleReconnect);
return () => {
  window.removeEventListener("ws-connected", handleReconnect);
};
}, [conversationId, ws]);


/* HANDLE UNBLOCK */

async function handleUnblock() {
  try {
    await unblockUser(otherUser.userId);
    setShowUnblockPopup(true);
    setBlockedByMe(false);

    const res = await getMessages(conversationId);
    setBlockedByMe(res.blockedByMe === true);
    setBlockedMe(res.blockedMe === true);

    const loaded = (res.results || []).map(m => ({
      ...m,
    originalStatus: m.originalStatus || m.status || "sent",
    status: 
      m.originalStatus === "blockedSent"
        ? "sent"
        : (m.status || "sent")
  }));

    setMessages(loaded);
  } catch (e) {
    console.error("unblock failed");
  }
} 

  /* READ UP TO  */
const lastReadRef = useRef(null);

useEffect(() => {
  if (!ws || messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];

  
  if (lastMsg.senderId === myUserId) return;

  const ts = lastMsg.createdAt.split("#")[0];

  
  if (lastReadRef.current === ts) return;

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      action: "readUpTo",
      conversationId,
      lastReadAt: ts
    }));

    lastReadRef.current = ts;
    window.dispatchEvent(
      new CustomEvent("conversation-read", {
        detail: { conversationId }
      })
    );
  }

}, [messages, ws]);



  /* WEBSOCKET EVENTS */
useEffect(() => {

  const handleMessage = (event) => {
    const data = event.detail;

    /* NEW MESSAGE */
    if (
      data.event === "message:new" &&
      data.message?.conversationId === conversationId
    ) {
      const msg = {
        ...data.message,
        originalStatus: data.message.originalStatus || data.message.status || "sent",
        status: 
          data.message.originalStatus === "blockedSent"
            ? "sent"
            : (data.message.status || "sent")
      };

      const pendingStatus = pendingStatusRef.current[msg.messageId];
      if (pendingStatus) {
        msg.status = pendingStatus;
        delete pendingStatusRef.current[msg.messageId];
      }

      setMessages(prev => {
        if (msg.senderId === myUserId) return prev;

        const exists = prev.find(
          m => m.messageId === msg.messageId );

        if (exists) return prev;
        return [...prev, msg];
      });

      // send delivered
      if (msg.senderId !== myUserId && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: "delivered",
          conversationId: msg.conversationId,
          messageId: msg.messageId,
          createdAt: msg.createdAt
        }));
      }
    }

    /* SENT CONFIRMATION */
    if (data.event === "message:sent") {
      setMessages(prev =>
        prev.map(m =>
          m.tempId 
            ? { 
              ...m, 
              messageId: data.messageId, 
              createdAt: data.createdAt, 
              tempId: null,
              status: data.status || "sent",
              originalStatus: m.originalStatus || data.status || "sent"
            }
            : m
        )
      );
    }

    /* TYPING */
    if (
      data.event === "typing" &&
      data.conversationId === conversationId &&
      data.userId !== myUserId
    ) {
      setIsTyping(data.isTyping);
    }


      /* STATUS UPDATE */

  
/*  delivered update */
if (data.event === "message:delivered") {

  setMessages(prev =>
    prev.map(m => {
      if (m.originalStatus === "blockedSent") return m;
      if (m.senderId !== myUserId) return m;

      const isMatch =
        (data.messageId && m.messageId === data.messageId) ||
        (data.createdAt && m.createdAt === data.createdAt);

      if (isMatch) {
        if (m.status === "read") return m;
        return { ...m, status: "delivered" };
      }

      return m;
    })
  );
  window.dispatchEvent(
    new CustomEvent("conversation-status-update", {
      detail: {
        conversationId: data.conversationId,
        status: "delivered"
      }
    })
  );
}



/* readUpTo update */
if (data.event === "message:readUpTo") {

  const readTime = data.readAt || data.lastReadAt || "";

  setMessages(prev => {
    const updated = prev.map(m => {
      if (m.originalStatus === "blockedSent") return m;
      if (m.senderId !== myUserId) return m;

      const msgTime = m.createdAt.split("#")[0];

      if (msgTime <= readTime) {
        if (m.status === "read") return m;
        return { ...m, status: "read" };
      }

      return m;
    });
    console.log("after read upto:",
      updated.map(m => ({
        id: m.messageId,
        status: m.status,
        originalStatus: m.originalStatus
      }))
    );
    return updated;
  });

  window.dispatchEvent(
    new CustomEvent("conversation-status-update", {
      detail: {
        conversationId: data.conversationId,
        status: "read"
      }
    })
  );
}
  };

    window.addEventListener("ws-event", handleMessage);

    return () => {
      window.removeEventListener("ws-event", handleMessage);
    };

}, [conversationId, ws]); 
    

  /* SEND MESSAGE */
  async function handleSend() {
    if (!text.trim()) return;

    const tempId = "temp-" + Date.now();
    const tempMessage = {
      messageId: tempId,
      tempId,
      senderId: myUserId,
      text,
      createdAt: new Date().toISOString(),
      status: "sent"
    };

    setMessages(prev => [...prev, tempMessage]);
    setText("");

    try{
    await sendMessage({ conversationId, text });
  } catch (e) {
    console.error(e);
  }
}

  /* TYPING */
  function handleTyping(value) {
    setText(value);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        action: "typing",
        conversationId,
        isTyping: true
      }));
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: "typing",
          conversationId,
          isTyping: false
        }));
      }
    }, 1000);
  }

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <div className="chat-center">Loading chat…</div>;

return (
  <div className="chat-page">

    {/* HEADER */}
    <div className="chat-header">
      <button onClick={() => navigate("/messages")} className="chat-back">←</button>

      <img
        src={photoUrl(otherUser?.photo || "")}
        alt=""
        className="chat-header-img"
      />

      <div className="chat-header-meta">
        <strong
          className="chat-user-name"
          onClick={() => navigate(`/profile/${otherUser?.userId}`)}
        >
          {otherUser?.name || "User"}
        </strong>
        {isTyping && <span className="chat-typing">typing...</span>}
      </div>
    </div>

    {/* BODY */}
    <div className="chat-body">

      {messages.map((m, index) => {
        const isMine = m.senderId === myUserId;
        const status = m.status || "sent";

        const prev = messages[index - 1];

        const showDate =
          !prev ||
          getDateLabel(prev.createdAt) !== getDateLabel(m.createdAt);

        return (
          <div key={m.messageId || m.createdAt}>

            {showDate && (
              <div className="chat-date">
                {getDateLabel(m.createdAt)}
              </div>
            )}

            {/* MESSAGE */}
            <div className={`chat-message ${isMine ? "sent" : "received"}`}>
              <div className="chat-bubble">

                <div className="chat-text">{m.text || m.message}</div>

                <div className="chat-meta">
                  <span className="chat-time">
                    {formatTime(m.createdAt)}
                  </span>

                  {isMine && (
                    <span
                      className={`chat-tick ${
                        status === "read"
                          ? "tick-read"
                          : status === "delivered"
                          ? "tick-delivered"
                          : ""
                      }`}
                    >
                      {status === "sent" && "✓"}
                      {(status === "delivered" || status === "read") && "✓✓"}
                    </span>
                  )}
                </div>

              </div>
            </div>

          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>

    {/* INPUT BAR */}
    <div className="chat-input-bar">
      {isReported ? (
        <div className="blocked-ui">
          <span className="blocked-text">
            You have reported this user
          </span>
        </div>
      ) : blockedByMe ? (
        <div className="blocked-ui">
          <span className="blocked-text">You have blocked this user</span>
          <button
            className="unblock-btn"
            onClick={handleUnblock}
          >
            Unblock
          </button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            className="chat-input"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="chat-send" onClick={handleSend}>

 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
  </svg>
</button>
        </>
      )}
    </div>
  </div>
);
}