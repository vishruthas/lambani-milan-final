import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getConversations } from "../services/api";
import { useWebSocket } from "../context/WebSocketContext";
import "./Messages.css";
import logo from "../assets/logo2.webp";

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


function formatTime(ts) {
  const d = parseTimestamp(ts);
  if (!d || isNaN(d)) return "";

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diff = (today - msgDay) / (1000 * 60 * 60 * 24);

  // TODAY
  if (diff === 0) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // YESTERDAY
  if (diff === 1) {
    return "Yesterday";
  }

  // WITHIN WEEK
  if (diff < 7) {
    return d.toLocaleDateString([], {
      weekday: "short"
    });
  }

  // OLDER
  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
}


function getFinalStatus(oldStatus, newStatus) {
  const priority = { sent: 1, delivered: 2, read: 3 };

  if (!oldStatus) return newStatus;

  return priority[newStatus] > priority[oldStatus]
    ? newStatus
    : oldStatus;
}

export default function Messages() {

  const navigate = useNavigate();
  const ws = useWebSocket();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("id_token");
  const myUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  useEffect(() => {
    getConversations();
  }, []);

  /* LOAD CONVERSATIONS */
  useEffect(() => {
    getConversations()
      .then(res => {
        const results = (res.results || []).map(c => {

          let status = "sent";

          if (c.lastMessageSenderId === myUserId) {
            if (c.lastMessageStatus === "read") status = "read";
            else if (c.lastMessageStatus === "delivered") status = "delivered";
          }

          return {
            ...c,
            lastMessageStatus: status,
            unreadCount: c.unreadCount || 0
          };
        });

        setItems(results);
      })
      .finally(() => setLoading(false));

  }, []);

  /* RECONNECT  */
  useEffect(() => {

    const handleReconnect = async () => {
      try {
        const res = await getConversations();

        const results = (res.results || []).map(c => {

          let status = "sent";

          if (c.lastMessageSenderId === myUserId) {
            if (c.lastMessageStatus === "read") status = "read";
            else if (c.lastMessageStatus === "delivered") status = "delivered";
          }

          return {
            ...c,
            lastMessageStatus: status,
            unreadCount: c.unreadCount || 0
          };
        });

        setItems(prev =>
          results.map(newItem => {
            const oldItem = prev.find(p => p.conversationId === newItem.conversationId);

            if (!oldItem) return newItem;

            return {
              ...newItem,
              lastMessageStatus: getFinalStatus(
                oldItem.lastMessageStatus,
                newItem.lastMessageStatus
              )
            };
          })
        );

      } catch (e) {
        console.error("Reconnect fetch failed");
      }
    };

    window.addEventListener("ws-connected", handleReconnect);

    return () => {
      window.removeEventListener("ws-connected", handleReconnect);
    };

  }, []);

  /* WEBSOCKET EVENTS */
  useEffect(() => {

    if (!ws) return;

    const handleMessage = (event) => {

      const data = event.detail;

      /* NEW MESSAGE */
      if (data.event === "message:new") {

        const msg = data.message;

        if (msg.senderId !== myUserId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            action: "delivered",
            conversationId: msg.conversationId,
            createdAt: msg.createdAt,
            messageId: msg.messageId
          }));
        }

        setItems(prev => {
          const updated = prev.map(c => {

            if (c.conversationId !== msg.conversationId) return c;

            const incomingStatus = msg.status || "sent";

            return {
              ...c,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              lastMessageStatus: getFinalStatus(
                c.lastMessageStatus,
                incomingStatus
              ),
              lastMessageSenderId: msg.senderId,
              unreadCount:
                msg.senderId === myUserId
                  ? c.unreadCount
                  : (c.unreadCount || 0) + 1
            };
          });

          updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          return updated;
        });
      }

      /* DELIVERED */
      if (data.event === "message:delivered") {
        setItems(prev =>
          prev.map(c => {
            if (c.conversationId !== data.conversationId) return c;
            if (c.lastMessageSenderId !== myUserId) return c;

            return {
              ...c,
              lastMessageStatus: getFinalStatus(c.lastMessageStatus, "delivered")
            };
          })
        );
      }

      /* READ */
      if (data.event === "message:readUpTo") {
        setItems(prev =>
          prev.map(c => {
            if (c.conversationId !== data.conversationId) return c;
            if (c.lastMessageSenderId !== myUserId) return c;

            return {
              ...c,
              lastMessageStatus: getFinalStatus(c.lastMessageStatus, "read"),
              unreadCount: 0
            };
          })
        );
      }

      /* TYPING */
      if (data.event === "typing") {
        setItems(prev =>
          prev.map(c =>
            c.conversationId === data.conversationId
              ? { ...c, isTyping: data.isTyping }
              : c
          )
        );
      }

    };

    window.addEventListener("ws-event", handleMessage);
    return () => window.removeEventListener("ws-event", handleMessage);

  }, [ws]);

  /* CHAT OPEN → UNREAD */
  useEffect(() => {
    const handleConversationRead = (e) => {
      const { conversationId } = e.detail;

      setItems(prev =>
        prev.map(c =>
          c.conversationId === conversationId
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    };

    window.addEventListener("conversation-read", handleConversationRead);
    return () => window.removeEventListener("conversation-read", handleConversationRead);

  }, []);


  
  /* UI */

  if (loading) {
  return <div className="messages-center">Loading conversations…</div>;
}

return (
  <div className="messages-page2" >

    <div className="headermsg">

        <div className="header-centermsg">
          <img src={logo} alt="logo" className="logo" />
          <div className="title">Lambani Milan</div>
        </div>
        </div>

    <div className="messages-header">
      <h2 className="messages-heading">MESSAGES</h2>
    </div>

    {items.length === 0 ? (
      <div className="messages-center">No conversations yet</div>
    ) : (
      items.map(c => {

        return (
          <div
            key={c.conversationId}
            className="messages-card"
            onClick={() => {
              if (!c.conversationId) {
                console.error("no conv");
                return;
              }
              navigate(`/messages/${c.conversationId}`, {
                state: {
                  user: {
                    userId: c.userId,
                    name: c.name,
                    photo: c.displayPhoto
                  }
                }
              });
            }}
          >

            <img src={photoUrl(c.displayPhoto)} className="messages-img" />

            <div className="messages-middle">

              {/* TOP */}
              <div className="messages-topRow">
                <strong className="messages-name">
                  {c.name || "User"}
                </strong>

                <div className="messages-topRight">
                  {c.unreadCount > 0 && (
                    <div className="messages-badge"> 
                      {c.unreadCount}
                    </div>
                  )}
                </div>
              </div>

              {/* LAST MESSAGE */}
              <div className="messages-last">
                <div className="messages-last-left">
                  {c.lastMessageSenderId === myUserId && (
                    <span
                      className={`messages-tick 
                        ${c.lastMessageStatus === "delivered" ? "tickDelivered" : ""}
                        ${c.lastMessageStatus === "read" ? "tickRead" : ""}
                      `}
                    >
                      {c.lastMessageStatus === "sent" && "✓"}
                      {(c.lastMessageStatus === "delivered" || c.lastMessageStatus === "read") && "✓✓"}
                    </span>
                  )}
                  <span className="messages-last-text">
                    {c.isTyping ? "typing..." : c.lastMessage}
                  </span>
                </div>
                <span className="messages-time-bottom">
                  {formatTime(c.lastMessageAt)}
                </span>

              </div>

            </div>

          </div>
        );
      })
    )}

    <Footer active="messages" />
  </div>
);
}