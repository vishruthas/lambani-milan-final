import { useState, useEffect } from "react";
import { deactivateAccount } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./DeactivateAccount.css";

export default function DeactivateAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const canSubmit = confirmed && password.length > 0;
  const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0792a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </svg>
);
  
const EyeIcon = ({ open = false }) => (
    <svg className="eye-icon" width="20" height="20" viewBox="0 0 24 24"
      fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {!open ? (
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      )}
      {!open && (
        <path className="eye-closed" d="M3 3l18 18"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
  const handleDeactivate = async () => {
    try {
      if (!password) return setMessage("Please enter password");

      await deactivateAccount(password);

      setShowPopup(true);
      setMessage("");
    } catch (err) {
  const errorMsg = err?.message?.toLowerCase() || "";

  if (
    errorMsg.includes("auth") ||
    errorMsg.includes("password") ||
    errorMsg.includes("not authorized") ||
    errorMsg.includes("accessdenied")
  ) {
    setMessage("Incorrect password");
  } else {
    setMessage("Failed to deactivate account");
  }
}
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        logoutUser();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("username");

    window.dispatchEvent(new Event("logout"));
    navigate("/");
  };

  return (
    <div className="da-wrapper">
      <div className="da-title">
        <div className="da-title-row">
        <PauseIcon />
        <h3>Deactivate Profile</h3>
      </div>
      <p>
          Need a break from matchmaking? Hide your profile temporarily and come back anytime.
        </p>
      </div>
     

      {/* What happens */}
      <div className="da-card">
        <h3>What happens when you deactivate?</h3>

        <div className="da-item">
          <span>🙈</span>
          <div>
            <strong>Your profile becomes invisible</strong>
            <p>Other members won't be able to find or view your profile in search results, recommendations, or anywhere on the platform</p>
          </div>
        </div>

        <div className="da-item">
          <span>💬</span>
          <div>
            <strong>Conversations are paused</strong>
            <p>Your existing chats are preserved, but no new messages can be sent or received while your account is deactivated.</p>
          </div>
        </div>

        <div className="da-item">
          <span>❤️</span>
          <div>
            <strong>Your interests & matches are saved</strong>
            <p>All your sent interests, received interests, and accepted matches remain exactly as they are.</p>
          </div>
        </div>

        <div className="da-item">
          <span>🔄</span>
          <div>
            <strong>Reactivate anytime</strong>
            <p>Login again to restore your profile instantly.</p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="da-card">
        <h3>Help us improve (optional)</h3>

        {[
          "Found a match",
          "Need a break",
          "Not getting matches",
          "Privacy concerns",
          "Other"
        ].map((opt) => (
          <label key={opt} className={`da-radio ${reason === opt ? "active" : ""}`}>
            <input
              type="radio"
              name="reason"
              checked={reason === opt}
              onChange={() => setReason(opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      
      <div className="da-box">
        <p className="da-label">
          Enter password
        </p>      
        <div className="da-password-field">
          <input
            className="da-input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

        <button
          type="button"
          className={`toggle-password ${showPassword ? "open" : "closed"}`}
          onClick={() => setShowPassword((p) => !p)}
        >
        <EyeIcon open={showPassword} />
        </button>
    </div>
              

        <label className="da-checkbox">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I understand my profile will be hidden
        </label>

        
        <button 
          className="da-btn" 
          onClick={handleDeactivate}
          disabled={!canSubmit}
          >
          Deactivate Account
        </button>

        {message && <p className="da-error">{message}</p>}
      </div>

      {showPopup && (
        <div className="da-overlay">
          <div className="da-popup">
            <p>
              Your account is successfully deactivated.
              <br />
              You can reactivate anytime by logging in.
            </p>

            <button className="da-okBtn" onClick={logoutUser}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
