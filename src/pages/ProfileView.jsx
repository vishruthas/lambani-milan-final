import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getUserProfile,
  sendInterest,
  respondToInterest,
  getUserInterests,
  blockUser,
  reportUser
} from "../services/api";
import "./ProfileView.css";
import logo from "../assets/logo2.webp";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";

function normalizePhoto(src) {
  if (!src) return "/default-user.png";
  if (src.startsWith("http")) return src;
  return S3_BUCKET + src;
}

export default function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [photosLocked, setPhotosLocked] = useState(false);
  const fromInterest = location.state?.from === "interest";
  const interestType = location.state?.type;
  const [showMenu, setShowMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [interestStatus, setInterestStatus] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [interestId, setInterestId] = useState(null);
  const [interestDirection, setInterestDirection] = useState(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");


  const VerifiedBadgeIcon = ({ size = 34, color = "currentColor", strokeWidth = 1.8, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    <path d="M12 2.5 L13.8 4 L16.2 3.6 L17 5.9 L19.2 6.8 L18.8 9.2 L20.4 11 L18.8 12.8 L19.2 15.2 L17 16.1 L16.2 18.4 L13.8 18 L12 19.5 L10.2 18 L7.8 18.4 L7 16.1 L4.8 15.2 L5.2 12.8 L3.6 11 L5.2 9.2 L4.8 6.8 L7 5.9 L7.8 3.6 L10.2 4 Z" />
    <polyline points="8.5 11.5 11 14 15.5 9" />
  </svg>
);

  useEffect(() => {
    getUserProfile(userId).then(res => {
      const p = res.profile;
      setProfile(p);
      setPhotosLocked(p.canViewProfilePhotos === false);
     const list = [];
     if (Array.isArray(p.profilePhotos)) {
      p.profilePhotos.forEach(ph => {
        list.push(normalizePhoto(ph));
     });
    }
    if (list.length === 0) {
      list.push("/default-user.png");
    }
    setPhotos(list);
      setActive(0);
    }).catch(() => {
      setProfile(null);
    });
  }, [userId]);

  useEffect(() => {
    if (photosLocked) {
      setActive(0)
    }
  }, [photosLocked]);

 /* BLOCK */

  useEffect(() => {
  function handleClickOutside(e) {
    if (!e.target.closest(".menu-container")) {
      setShowMenu(false);
    }
  }

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

async function handleBlock() {
  try {
    await blockUser(profile.userId);
    setShowBlockConfirm(false);
    setSuccessMsg("User blocked successfully");
    setTimeout(() => {
      setSuccessMsg("");
    navigate("/home");
    }, 3000);
  } catch (err) {
    alert(err.message || "Failed to block user");
  }
}

/* UNSEND INTEREST */

async function handleUnsendInterest() {
  try {
    setProcessing(true);

    await sendInterest(userId, "unsend");  

    setInterestStatus(null);
    setInterestDirection(null);
    setInterestId(null);
    setConversationId(null);

  } catch (err) {
    alert(err.message || "Failed to unsend interest");
  } finally {
    setProcessing(false);
  }
}

/* REPORT USER */

async function handleReport() {
  if (!reportReason) {
    alert("Please select a reason");
    return;
  }
  let finalReason = reportReason;
  if (reportReason === "Others") {
    if (!customReason.trim()) {
    alert("Please enter a reason");
    return;
    }
    finalReason = customReason;
    }

  try {
    // report
    await reportUser({
      reportedUserId: profile.userId, 
      reason: finalReason
    });
    setShowReportPopup(false);
    setReportReason("");
    setCustomReason("");

    setSuccessMsg(`User reported successfully`);

    // auto block
    await blockUser(profile.userId);

    setTimeout(() => {
      setSuccessMsg("");
      navigate("/home");
    }, 1000);

  } catch (e) {
    alert(e.message || "Failed to report user");
  }
}

 /* GET INTEREST */

  useEffect(() => {
    async function resolveInterest() {
      try {
        const res = await getUserInterests();
        const match = res.results.find(i => i.userId === userId);

        if (match) {
          setInterestStatus(match.status?.toLowerCase());
          setInterestId(match.interestId);
          setConversationId(match.conversationId || null);
          setInterestDirection(match.direction);   // no fallback — use exact value from API
        } else {
          setInterestStatus(null);
          setInterestId(null);
          setConversationId(null);
          setInterestDirection(null);
        }
      } catch (err) {
        console.error("Failed to resolve interest");
      }
    }

    resolveInterest();
  }, [userId]);

  /* SEND INTEREST */

  async function handleSendInterest() {
    try {
      setProcessing(true);
      await sendInterest(profile.userId);

      const res = await getUserInterests();
      const match = res.results.find(i => i.userId === userId);
      if (match) {
        setInterestStatus(match.status?.toLowerCase());
        setInterestDirection(match.direction);  
        setInterestId(match.interestId);
        setConversationId(match.conversationId || null);
      }
    } finally {
      setProcessing(false);
    }
  }
 /* RESPOND TO INTEREST */

  async function handleRespond(action) {
    try {
      setProcessing(true);
      await respondToInterest({ interestId, action });

      const res = await getUserInterests();
      const match = res.results.find(i => i.userId === userId);

      if (match) {
        setInterestStatus(match.status?.toLowerCase());
        setConversationId(match.conversationId || null);
        setInterestDirection(match.direction);     // use exact API value
      }
      if (!match?.conversationId) {
        setTimeout(async () => {
          try {
            const retry = await getUserInterests();
            const retryMatch = retry.results.find(i => i.userId === userId);
            setConversationId(retryMatch?.conversationId || null);
          } catch (e) {
            
          }
        }, 500);
      }
    } finally {
      setProcessing(false);
    }
  }

  function getDistrict(location) {
    if (!location) return "";
    if (location.includes("-")) {
      return location.split("-")[1].trim();
    }
    return location;
  }
 /* SEND MESSAGE */

  async function handleSendMessage() {
    let convId = conversationId;

    if (!convId) {
      try {
        const res = await getUserInterests();
        const match = res.results.find(i => i.userId === userId);
        convId = match?.conversationId;
      } catch (e) {
        console.log("Reload failed");
      }
    }

    if (!convId) {
      alert("Please wait a moment and try again");
      return;
    }

    navigate(`/messages/${convId}`, {
      state: {
        user: {
          userId: userId,
          name: profile?.name || "User",
          photo: profile?.displayPhoto || ""
        }
      }
    });
  }

  function handlePrev() {
    setActive(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function handleNext() {
    setActive(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  if (!profile) return <div className="center">Loading…</div>;

  function inlineDetails(...parts) {
    const filtered = parts.filter(Boolean);
    return filtered.join(" \u00B7 ");
  }

  return (
    <div
  className={`profile-page ${
    showBlockConfirm || showReportPopup ? "popup-open" : ""
  }`}
>
      <div className="headerprofview">
      
              <div className="header-centerprofview">
                <img src={logo} alt="logo" className="logo" />
                <div className="title">Lambani Milan</div>
              </div>
              </div>
              
      <div className="photo-wrap">

  {/* MAIN IMAGE */}
  
  <img
    src={photos[active]}
    className={`main-photo ${photosLocked ? "blurred" : ""}`}
    alt="profile"
  />

  {/* OVERLAY */}
  {photosLocked && (
    <div className="overlay">
      <div className="overlay-content">
        Photos Locked
        <div className="overlay-sub">
          Only visible to members with accepted interest
        </div>
      </div>
    </div>
  )}


  {/* COUNT (hide when locked) */}
  {!photosLocked && (
    <div className="image-count">
      {active + 1}/{photos.length}
    </div>
  )}

  {/* NAVIGATION (HIDDEN WHEN LOCKED) */}
  {photos.length > 1 && !photosLocked && (
    <>
      <button className="nav-btn left" onClick={handlePrev}>‹</button>
      <button className="nav-btn right" onClick={handleNext}>›</button>

      <div className="photo-dots">
        {photos.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === active ? "active" : ""}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </>
  )}
</div>

      <div className="profile-card1">
        
        <div className="name-with-badge">
          <img
          src={profile.displayPhoto || "/default-user.png"}
          className="profile-dp-inline"
          alt="dp"
          onError={e => (e.target.src = "/default-user.png")}
          />
        <h2 className="profile-name">{profile.name}</h2>
        {profile.verified && (
  <span className="verified-badge">
    <VerifiedBadgeIcon />
  </span>
)}
</div>
        
        <div className="profile-header">
          <div className="menu-container">
    <button
      className="menu-btn"
      onClick={() => setShowMenu(prev => !prev)}
    >
      ⋮
    </button>

    {showMenu && (
      <div className="menu-dropdown">
        
        {/* BLOCK */}
        <div
          className="menu-item"
          onClick={() => {
            setShowMenu(false);
            setShowBlockConfirm(true);
          }}
        >
          ⦸ Block
        </div>

        {/* REPORT */}
        <div
          className="menu-item"
          onClick={() => {
            console.log("report");
            setShowMenu(false);
            setShowReportPopup(true);
          }}
        >
          ⚐ Report
        </div>

      </div>
    )}
  </div>
  </div>

        <div className="profile-summary-line">
          {inlineDetails(
            profile.age ? `${profile.age} yrs` : null,
            profile.location
          )}
        </div>

        <hr className="divider" />

        <h3 className="section-title">Personal Info</h3>

        <div className="personal-info1">
          
          <div className="info-row1">
            <span className="info-label">Marital Status :</span>
            <span className="info-value">{profile.maritalStatus ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">Height :</span>
            <span className="info-value">{profile.height ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">Kul :</span>
            <span className="info-value">{profile.kul ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">Gothra :</span>
            <span className="info-value">{profile.gothra ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">Education :</span>
            <span className="info-value">{profile.education ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">Occupation :</span>
            <span className="info-value">{profile.occupation ?? "-"}</span>
          </div>
          <div className="info-row1">
            <span className="info-label">State :</span>
            <span className="info-value">{profile.state ?? profile.location ?? "-"}</span>
          </div>
        </div>

        {profile.aboutMe ? (
          <div className="about-section">
            <span className="info-label">About:</span>
            <p className="about-text">{profile.aboutMe}</p>
          </div>
        ) : null}
      </div>

      <div className="fixed-actions fixed-actions-right">
        {!interestStatus && (
          <button
            className="btn-send fixed-btn"
            disabled={processing}
            onClick={handleSendInterest}
          >
            Send Interest
          </button>
        )}
        
        {interestStatus === "pending" && interestDirection === "sent" && (
          <button
            className="btn-unsend fixed-btn"
            disabled={processing}
            onClick={handleUnsendInterest}
            //aria-disabled="true"
          >
            Unsend Interest
          </button>
        )}
        {interestStatus === "pending" && interestDirection === "received" && (
          <div className="fixed-action-group">
            <button
              className="fixed-small btn-accept"
              disabled={processing}
              onClick={() => handleRespond("ACCEPT")}
            >
              Accept
            </button>
            <button
              className="fixed-small btn-reject"
              disabled={processing}
              onClick={() => handleRespond("REJECT")}
            >
              Decline
            </button>
          </div>
        )}
        {interestStatus === "accepted" && (
          <>
            <button
              className="btn-message fixed-btn"
              onClick={handleSendMessage}
            >
              Send Message
            </button>
          </>
        )}
        {interestStatus === "rejected" && interestDirection === "sent" && (
          <div className="rejected-inline">Interest Declined</div>
        )}
        {interestStatus === "rejected" && interestDirection === "received" && (
          <div className="rejected-inline">You Declined the Interest</div>
        )}
      </div>

      {showBlockConfirm && (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3>Block User?</h3>
      <p>
        Are you sure you want to block this user?
      </p>

      <div className="popup-actions">
        <button
          className="btn-cancel"
          onClick={() => setShowBlockConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="btn-confirm"
          onClick={handleBlock}
        >
          Confirm
        </button>
      </div>
    </div>
    {successMsg && (
  <div className="success-popUp">
    {successMsg}
    </div>
)}

  </div>
)}
{showReportPopup && (
  <div className="popup-overlay">
    <div className="popup-box">

      <h3>Report User</h3>
      <p>Select a reason:</p>

      <div className="report-options">

        {[
          "Fake profile",
          "Inappropriate behaviour",
          "Scam or financial fraud",
          "Pretending to be someone else",
          "Harassment or abusive language",
          "Others"
        ].map(reason => (
          <label key={reason} className="report-option">
            <input
              type="radio"
              name="reportReason"
              value={reason}
              checked={reportReason === reason}
              onChange={() => {
                setReportReason(reason);
                if (reason !== "Others") {
                  setCustomReason("");
                }
              }}
            />
            {reason}
          </label>
        ))}
        {reportReason === "Others" && (
          <textarea
          className="report-textarea"
          placeholder="Specify your reason"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

      </div>

      <div className="popup-actions">
        <button
          className="btn-cancel"
          onClick={() => {
            setShowReportPopup(false);
            setReportReason("");
          }}
        >
          Cancel
        </button>

        <button
          className="btn-confirm"
          onClick={handleReport}
        >
          Confirm
        </button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}