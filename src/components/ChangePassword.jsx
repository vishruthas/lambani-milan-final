import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword, globalSignOut } from "../services/auth";
import "./ChangePassword.css";
import ForgotPassword from "./ForgotPassword";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isMatch = confirm && password === confirm;
  const isMismatch = confirm && password !== confirm;

  


  const Icon = ({ children, size = 18, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );

  const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shield */}
    <path
      d="M32 4
         C24 12, 14 15, 8 16
         V30
         C8 45, 18 55, 32 60
         C46 55, 56 45, 56 30
         V16
         C50 15, 40 12, 32 4Z"
      stroke="#b8860b"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Lock Body */}
    <rect
      x="22"
      y="29"
      width="20"
      height="18"
      rx="2.5"
      fill="#b8860b"
    />

    {/* Lock Shackle */}
    <path
      d="M26 29V23
         C26 18.5 28.8 16 32 16
         C35.2 16 38 18.5 38 23V29"
      stroke="#b8860b"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Keyhole */}
    <circle cx="32" cy="35" r="2.5" fill="white" />
    <rect
      x="30.8"
      y="37"
      width="2.4"
      height="6"
      rx="1.2"
      fill="white"
    />
  </svg>
);
  

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { label: "Weak", color: "#e74c3c", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "#f39c12", width: "66%" };
    return { label: "Strong", color: "#2ecc71", width: "100%" };
  };

  const strength = getStrength();

  const handleChangePassword = async () => {

  if (!oldPassword || !password || !confirm) {
    return setMessage("Please fill all fields");
  }

  if (password !== confirm) {
    return setMessage("Passwords do not match");
  }

  try {
    await changePassword(oldPassword, password);
    setShowPopup(true);
    setOldPassword("");
    setPassword("");
    setConfirm("");
    setMessage("");

  } catch (err) {

    if (err?.code === "NotAuthorisedException") {

      setMessage("Incorrect current password");

    } else {

      setMessage(
        err?.message || "Error updating password"
      );
    }
  }
};

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

  return (
    <>
      {showForgot ? (
        <ForgotPassword onBack={() => setShowForgot(false)} />
      ) : (
        <div className="cp-wrapper">

          {/* HEADER */}
          <div className="cp-title">
            <div className="cp-title-row">
              <LockIcon />
              <h3>Change Password</h3>
            </div>
            <p>Keep your account secure by using a strong, unique password.</p>
          </div>

          {/* CENTERED BODY */}
          <div className="cp-body">

            {/* BADGE */}
            <div className="cp-badge">
              <div className="cp-badge-icon"><ShieldIcon /></div>
              <div>
                <div className="cp-badge-label">Account Security</div>
                <div className="cp-badge-value">Update your password regularly to stay secure</div>
              </div>
            </div>

            {/* CARD */}
            <div className="cp-card">
              <h3 className="cp-card-title">Update Password</h3>
              <p className="cp-card-desc">
                Enter your current password and choose a new strong password.
              </p>

              {/* Current Password */}
              <label className="cp-label">Current Password</label>
              <div className="cp-inputWrap">
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="cp-input"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className={`toggle-password ${showOld ? "open" : "closed"}`}
                  onClick={() => setShowOld((p) => !p)}
                  aria-pressed={showOld}
                  aria-label={showOld ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showOld} />
                </button>
              </div>

              <div className="cp-forgot-row">
                <span className="cp-forgot" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </span>
              </div>

              {/* New Password */}
              <div className="cp-label-row">
                <label className="cp-label">New Password</label>
                <span className="cp-infoIcon" onClick={() => setShowInfo(!showInfo)}>ⓘ</span>
              </div>
              <div className="cp-inputWrap">
                <input
                  type={showNew ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cp-input"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={`toggle-password ${showNew ? "open" : "closed"}`}
                  onClick={() => setShowNew((p) => !p)}
                  aria-pressed={showNew}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>
              {password && (
              <div className="cp-strengthWrap" aria-hidden={false}>
                <div
                  className="cp-strengthBar"
                  style={{ width: strength.width, background: strength.color }}
                />
                <div className="cp-strengthLabel" style={{ color: strength.color }}>
                  {strength.label}
                </div>
              </div>
            )}

              {showInfo && (
                <div className="cp-tooltip">
                  Password must contain:
                  <ul>
                    <li>At least 8 characters</li>
                    <li>Uppercase letter</li>
                    <li>Lowercase letter</li>
                    <li>Number</li>
                    <li>Special character</li>
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <label className="cp-label">Confirm New Password</label>
              <div className="cp-inputWrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`cp-input ${isMismatch ? "cp-inputError" : ""} ${isMatch ? "cp-inputSuccess" : ""}`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className={`toggle-password ${showConfirm ? "open" : "closed"}`}
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-pressed={showConfirm}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>

              <button className="cp-btn" onClick={handleChangePassword} disabled={!isMatch}>
                Update Password
              </button>

              {message && <p className="cp-error">{message}</p>}
            </div>

          </div>

          {showPopup && (
            <div className="cp-overlay">
              <div className="cp-popup">
                <p>Password updated successfully</p>
                <button
                  className="cp-okBtn"
                  onClick={async () => {
                  setShowPopup(false);

              await globalSignOut();

              localStorage.removeItem("access_token");
              localStorage.removeItem("id_token");
              localStorage.removeItem("username");

            window.dispatchEvent(new Event("logout"));

              navigate("/landing#login");
            }}
          >
        OK
      </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}