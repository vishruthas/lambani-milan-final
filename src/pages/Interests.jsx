import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getUserInterests } from "../services/api";
import logo from "../assets/logo2.webp";
import "./Interests.css";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";
const FALLBACK_IMAGE = "/default-user.png";

function photoUrl(photo) {
  if (!photo || typeof photo !== "string") {
    return FALLBACK_IMAGE;
  }
  if (photo.startsWith("http")) {
    return photo;
  }
  return S3_BUCKET + photo;
}

function getDistrict(location) {
  if (!location) return "";
  if (location.includes("-")) {
    return location.split("-")[1].trim();
  }
  return location;
}

export default function Interests() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("received");
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef(0);

  function mapStatus(tab) {
    if (tab === "all") return null;
    return tab;
  }

  useEffect(() => {
    load();
  }, [mode, tab]);

  useEffect(() => {
    if (mode === "received") {
      window.dispatchEvent(new Event("interest-read"));
    }
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getUserInterests({
        type: mode,
        status: mapStatus(tab),
        markAsRead: mode === "received"
      });
      if (mode === "received") {
        window.dispatchEvent(new Event("interest-read"));
      }

      setItems(res.results || []);
    } catch {
      alert("Failed to load interests");
    } finally {
      setLoading(false);
    }
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) < 60) return;
    setMode(diff > 0 ? "received" : "sent");
    setTab("all");
  }

  if (loading) return <div className="center">Loading…</div>;

  return (
    <div
      className="interests-page"
      style={{ paddingBottom: 80 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="headerint">

        <div className="header-centerint">
          <img src={logo} alt="logo" className="logo" />
          <div className="title">Lambani Milan</div>
        </div>
        </div>
        

      <div className="header7">
        <h2 className="heading">INTERESTS</h2>

        <div className="toggle">
          <div className="interests-toggle">
            <label
              className="switch"
              aria-label="Toggle received or sent interests"
              role="switch"
              aria-checked={mode === "received"}
            >
              <input
                type="checkbox"
                checked={mode === "received"}
                onChange={() => {
                  const newMode = mode === "received" ? "sent" : "received";
                  setMode(newMode);
                  setTab("all");
                }}
              />
              <span className="slider" role="presentation">
                <span className="knob" />
                <span className="labels" aria-hidden>
                  <span className="label-sent">Sent</span>
                  <span className="label-received">Received</span>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="interests-section">
        <div className="tabs interests-tabs">
          <Tab label="All" active={tab === "all"} onClick={() => setTab("all")} />
          <Tab
            label="Accepted"
            active={tab === "accepted"}
            onClick={() => setTab("accepted")}
            dataLabel="accepted"
          />
          <Tab
            label="Rejected"
            active={tab === "rejected"}
            onClick={() => setTab("rejected")}
          />
        </div>

        {items.length === 0 ? (
          <div className="center">No interests </div>
        ) : (
          items.map(item => (
            <InterestCard
              key={item.interestId}
              item={item}
              onOpen={() => {
                setItems(prev =>
                  prev.map(i =>
                    i.interestId === item.interestId ? { ...i, isRead: true } : i
                  )
                );
                navigate(`/profile/${item.userId}`, {
                  state: {
                    from: "interest",
                    interestId: item.interestId,
                    type: item.direction,
                    status: item.status,
                    conversationId: item.conversationId
                  }
                });
              }}
            />
          ))
        )}
      </div>

      <Footer active="interests" />
    </div>
  );
}

function InterestCard({ item, onOpen }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(max-width: 900px)").matches);
  }, []);

  async function handleMessageClick(e) {
    e.stopPropagation();

    let convId = item.conversationId;

    if (!convId) {
      try {
        const res = await getUserInterests({
          type: "received"
        });

        const updatedItem = (res.results || []).find(
          i => i.interestId === item.interestId
        );

        convId = updatedItem?.conversationId;
      } catch (err) {
        console.log("Reload failed", err);
      }
    }

    if (!convId) {
      alert("Conversation not ready yet");
      return;
    }

    navigate(`/messages/${convId}`, {
      state: {
        user: {
          userId: item.userId,
          name: item.name || "User",
          photo: item.displayPhoto || ""
        }
      }
    });
  }

  const showMessage = item.status === "accepted" ;

  return (
    <div
      className="card4"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={photoUrl(item.displayPhoto)}
        alt=""
        className="img"
        onError={e => (e.target.src = FALLBACK_IMAGE)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <strong className="card4-name">{item.name}</strong>

        <div className="sub">
          {item.age} yrs • {getDistrict(item.location)}
        </div>

        <div className="status-row">
          <StatusPill status={item.status} />
        </div>
      </div>

      {showMessage && (
        <button
          className="msgBtn"
          onClick={handleMessageClick}
          aria-label={`Message ${item.name}`}
        >
          Message
        </button>
      )}
    </div>
  );
}

function Tab({ label, active, onClick, dataLabel }) {
  return (
    <button
      onClick={onClick}
      className={`tab ${active ? "active" : ""}`}
      data-label={dataLabel}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }) {
  const color =
    status === "accepted"
      ? "#2e7d32"
      : status === "rejected"
      ? "#c62828"
      : "#777";

  const className = `pill ${status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "pending"}`;
  return <span className={className} style={{ color }}>{status.toUpperCase()}</span>;
}