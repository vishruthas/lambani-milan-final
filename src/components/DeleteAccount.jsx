import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../services/api";
import "./DeleteAccount.css";

export default function DeleteAccount({ goToDeactivate }) {
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canSubmit = confirmed && password.trim().length > 0;
  
  const navigate = useNavigate();

  useEffect(() => {
  if (reason === "Need a break (You can deactivate account instead)") {
    goToDeactivate();   
  }
}, [reason]);


  const reasons = [
    "Found a match",
    "Not finding suitable matches",
    "Privacy concerns",
    "Not satisfied with features",
    "Need a break (You can deactivate account instead)",
    "Other"
  ];

  const items = [
  { emoji: "📸", text: "All your profile photos, bio, and personal details" },
  { emoji: "❤️", text: "Sent and received interests, accepted matches" },
  { emoji: "💬", text: "Every conversation and message history" },
  { emoji: "📊", text: "Profile analytics — views, visitors, and activity log" },
];

  const EyeIcon = ({ open = false }) => (
    <svg
      className="eye-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!open ? (
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      )}
      {!open && (
        <path
          className="eye-closed"
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );


  const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b83030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);


 
  const handleDeleteClick = async () => {
  if (!canSubmit) return;

  try {
    await deleteAccount({
      password,
      reason: reason === "Other" ? otherText : reason,
      validateOnly: true,
    });

    setError("");
    setShowPopup(true);
  } catch (err) {
    const msg = err?.message || "";

    if (
      msg.toLowerCase().includes("password") ||
      msg.toLowerCase().includes("auth") ||
      msg.toLowerCase().includes("not authorized")
    ) {
      setError("Incorrect password");
    } else {
      setError("Failed to validate password");
    }
  }
};

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount({
        password,
        reason: reason === "Other" ? otherText : reason
      });

      localStorage.clear();
      window.dispatchEvent(new Event("logout"));
      navigate("/");
    } catch (err) {
  const msg = err?.message || "";

  if (
    msg.toLowerCase().includes("password") ||
    msg.toLowerCase().includes("auth") ||
    msg.toLowerCase().includes("not authorized")
  ) {
    setError("Incorrect password");
  } else {
    setError("Failed to delete account");
  }

  setShowPopup(false);
}
  };

  return (
    <div className="da-wrapper">
      {/* HEADER */}
      <div className="da-title">
        <div className="da-title-row">
          <TrashIcon />
          <h3>Delete Account</h3>
        </div>

        <p>
          Deleting your account will permanently remove your profile, matches, and conversations.
    This action cannot be undone.
        </p>
      </div>
      
      <div className="da-box">
        {/* Warning banner */}
    <div className="warning-banner">
      <span className="warning-icon">⚠️</span>
      <div>
        <div className="warning-title">This is a permanent action</div>
        <div className="warning-text">
          Once deleted, all your data — including photos, preferences, matches,
          conversations, and interests — will be permanently erased.
        </div>
      </div>
    </div>

    {/* What you'll lose */}
    <div className="de-card">
      <h3>Here's what you'll lose</h3>

      {items.map((item, i) => (
        <div key={i} className="list-item">
          <span>{item.emoji}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div> 

    {/* Feedback */}
    <div className="de-card">
      <h3> Help us understand why you're leaving.</h3>
      <div className="radio-group">
        {reasons.map(opt => (
          <label
            key={opt}
            className={`radio-item ${reason === opt ? "active" : ""}`}
          >
            <input
              type="radio"
              checked={reason === opt}
              onChange={() => setReason(opt)}
            />
            {opt}
          </label>
          
        ))}
      </div>
      {reason === "Other" && (
          <textarea
            placeholder="Tell us more..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="da-textarea"
          />
        )}
    </div>


      <label className="da-label">Enter Password</label>
      <div className="password-box">
        <input
          placeholder="Enter Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
        type="button"
        className="toggle-password"
        onClick={() => setShowPassword((p) => !p)}
      >
        <EyeIcon open={showPassword} />
      </button>
      </div>
        

      <label className="checkbox">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
      />
      <span>I understand this action is permanent</span>
    </label>


        {error && <p className="da-error">{error}</p>}
      

      <div className="button-group">
        
        <button
          className="btn-deactivate"
          onClick={goToDeactivate}
        >
          Deactivate Instead
        </button>

        <button
          className="btn-delete"
          disabled={!canSubmit}
          onClick={handleDeleteClick}
        >
        Permanently Delete Account
        </button>
      </div>
    </div>


      {showPopup && (
        <div className="da-overlay">
          <div className="da-popup">
            <p className="da-popupText">
  <strong>This action is permanent and cannot be undone.</strong>
</p>

<ul className="da-popupList">
  <li>Your profile will be removed immediately and you will not be able to log in again.</li>
  <li>For safety and compliance purposes, your data will be retained for upto 60 days.</li>
</ul>
            <div className="de-actionRow">
              <button className="de-okBtn" onClick={handleConfirmDelete}>
                OK
              </button>

              <button
                className="de-cancelBtn"
                onClick={() => {
                  setShowPopup(false);
                  setConfirmed(false);
                  setPassword("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

