import { useNavigate, useLocation } from "react-router-dom";
import { Home, Heart, Mail, User } from "lucide-react";
import { useEffect } from "react";
import { getConversations, getUserInterests } from "../services/api";
import { useWebSocket } from "../context/WebSocketContext";
import { useUnreadStore } from "../store/useUnreadStore";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const ws = useWebSocket();

  const unreadSet = useUnreadStore(s => s.unreadSet);
  const interestUnread = useUnreadStore(s => s.interestUnread);

  const setInitialUnread = useUnreadStore(s => s.setInitialUnread);
  const setInterestUnread = useUnreadStore(s => s.setInterestUnread);
  const addConversation = useUnreadStore(s => s.addConversation);
  const removeConversation = useUnreadStore(s => s.removeConversation);

  const token = localStorage.getItem("id_token");
  const myUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  /* INITIAL LOAD */
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await getConversations();

        const unreadIds = (res.results || [])
          .filter(c => (c.unreadCount || 0) > 0)
          .map(c => c.conversationId);

        setInitialUnread(unreadIds);

        const iRes = await getUserInterests({ type: "received" });
        setInterestUnread(iRes.unreadReceivedInterests || 0);
      } catch (e) {
        console.log("initial load failed");
      }
    }

    loadInitial();
  }, []);

  /* WS EVENTS */
  useEffect(() => {
    if (!ws) return;

    const handleWs = (e) => {
      const data = e.detail;
      if (!data?.event) return;

      if (data.event === "message:new") {
        if (data.message?.senderId !== myUserId) {
          addConversation(data.message.conversationId);
        }
      }
      if (data.event === "message:readUpTo") {
        if (data.conversationId) {
          removeConversation(data.conversationId);
        }
      }
    };

    window.addEventListener("ws-event", handleWs);
    return () => { window.removeEventListener("ws-event", handleWs)
    };
  }, [ws]);

  /* CHAT OPEN  */
  useEffect(() => {
    const handleRead = (e) => {
      const { conversationId } = e.detail;
      removeConversation(conversationId);
    };

    window.addEventListener("conversation-read", handleRead);
    return () => { window.removeEventListener("conversation-read", handleRead)
    };
  }, []);

  /* INTEREST READ */
  useEffect(() => {

    const handleInterestRead = async () => {
      try {
       
        useUnreadStore.getState().setInterestUnread(0);

        await getUserInterests({
          type: "received",
          markAsRead: true
        });

      } catch (e) {
        console.log("interest read sync failed");
      }
    };

    window.addEventListener("interest-read", handleInterestRead);

    return () => {
      window.removeEventListener("interest-read", handleInterestRead);
    };

  }, []);

  /* FOCUS REFRESH */
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const res = await getConversations();

        const unreadIds = (res.results || [])
          .filter(c => (c.unreadCount || 0) > 0)
          .map(c => c.conversationId);

        setInitialUnread(unreadIds);

        const iRes = await getUserInterests({ type: "received" });
        setInterestUnread(iRes.unreadReceivedInterests || 0);
      } catch (e) {
        console.log("refresh failed");
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* ACTIVE TAB */
  const isActive = (path) => {
  if (path === "/profile") {
    return location.pathname === "/profile";
  }

  return location.pathname.startsWith(path);
};
  
  return (
    <footer className="footer">
      <Item
        icon={<Home size={20} />}
        label="Home"
        active={isActive("/home")}
        onClick={() => navigate("/home")}
      />

      <Item
        icon={
          <div className="icon-with-badge">
            <Heart size={20} />
            {interestUnread > 0 && <span className="badge">{interestUnread}</span>}
          </div>
        }
        label="Interests"
        active={isActive("/interests")}
        onClick={() => navigate("/interests")}
      />

      <Item
        icon={
          <div className="icon-with-badge">
            <Mail size={20} />
            {unreadSet.size > 0 && <span className="badge">{unreadSet.size}</span>}
          </div>
        }
        label="Messages"
        active={isActive("/messages")}
        onClick={() => navigate("/messages")}
      />

      <Item
        icon={<User size={20} />}
        label="Profile"
        active={isActive("/profile")}
        onClick={() => navigate("/profile")}
      />
    </footer>
  );
}

/* ITEM */
function Item({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`footer-item ${active ? "active" : ""}`}
    >
      {icon}
      <span className="footer-text">{label}</span>
    </div>
  );
}
