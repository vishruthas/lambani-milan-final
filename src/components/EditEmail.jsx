import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserType,
  getCurrentUserEmail,
  getCurrentUserPhone,
  updateEmail,
  updatePhoneNumber,
  verifyEmailOtp,
  verifyPhoneOtp
} from "../services/auth";
import "./EditEmail.css";

export default function EditContact() {
  const navigate = useNavigate();

  const [type, setType] = useState("email");
  const [currentValue, setCurrentValue] = useState("");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [masked, setMasked] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [cooldown, setCooldown] = useState(0);
   const [isBlocked, setIsBlocked] = useState(false);

  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a7d6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a7d6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  useEffect(() => {
    const userType = getUserType();
    setType(userType);
    if (userType === "email") {
      getCurrentUserEmail().then(setCurrentValue).catch(() => {});
    } else {
      getCurrentUserPhone().then(setCurrentValue).catch(() => {});
    }
  }, []);

  useEffect(() => {
  if (cooldown === 0) {
    setIsBlocked(false);
    return;
  }

  const timer = setInterval(() => {
    setCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [cooldown]);

  const maskValue = (val) => {
    if (!val) return "";
    if (type === "email") {
      const [name, domain] = val.split("@");
      return "****" + (name ? name.slice(-4) : "") + "@" + (domain || "");
    }
    return "******" + String(val).slice(-4);
  };

  /* const handleSendOtp = async () => {
    try {
      if (!value) return setMessage("Please enter value");
      if (value === currentValue) return setMessage("New value cannot be same as current");
      if (type === "email") {
        await updateEmail(value.trim());
      } else {
        await updatePhoneNumber(value.trim());
      }
      setOtpSent(true);
      setMasked(maskValue(value));
      setMessage("");
    } catch (err) {
      setMessage(err?.message || "Error sending OTP");
    }
  }; */

  const handleSendOtp = async () => {
  try {
 
    setMessage("");
    setOtp("");

    if (!value.trim()) {
      return setMessage(
        `Please enter ${type === "email" ? "Email" : "Phone Number"}`
      );
    }

    if (
      value.trim() ===
      currentValue.replace("+91", "").trim()
    ) {
      return setMessage(
        `New ${type === "email" ? "Email" : "Phone Number"} cannot be same as current`
      );
    }

    if (type === "email") {
      await updateEmail(value.trim());
    } else {
      await updatePhoneNumber(value.trim());
    }

    setOtpSent(true);
    setMasked(maskValue(value));
    setIsBlocked(true);
    setCooldown(60);

  } catch (err) {

    setMessage(
      err?.message || "Error sending OTP"
    );
  }
};
  const handleVerify = async () => {
    try {
      if (!otp) return setMessage("Enter OTP");
      if (type === "email") {
        await verifyEmailOtp(otp);
      } else {
        await verifyPhoneOtp(otp);
      }
      setShowPopup(true);
      setValue("");
      setOtp("");
      setOtpSent(false);
      setMasked("");
      setMessage("");
    } catch (err) {
      setMessage(err?.message || "Invalid OTP");
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => { handleLogout(); }, 60000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  };

  

  return (
    <div className="ec-wrapper">

      {/* HEADER */}
      <div className="ec-title">
        <div className="ec-title-row">
          <MailIcon />
          <h3>Edit E-Mail / Number</h3>
        </div>
        <p>
          Update the email address or phone number linked to your profile.
          This is used for login, account recovery, and important notifications.
        </p>
      </div>

      {/* CENTERED BODY */}
      <div className="ec-body">

        {/* BADGE */}
        <div className="info-badge">
          <div className="info-badge-icon"><ShieldIcon /></div>
          <div>
            <div className="info-badge-label">
              Verified {type === "email" ? "Email" : "Phone"}
            </div>
            <div className="info-badge-value"><b>{currentValue}</b></div>
          </div>
        </div>

        {/* CARD */}
        <div className="ec-card">
          <h3 className="ec-card-title">
            Update {type === "email" ? "E-Mail " : "Number"}
          </h3>
          <p className="ec-card-desc">
            A verification OTP will be sent to your new {type === "email" ? "E-Mail" : "Number"} to confirm the change.
          </p>

          <label className="ec-label">
            New {type === "email" ? "Email ID" : "Phone Number"}:
          </label>
          <input
            placeholder={type === "email" ? "Enter new email" : "Enter new phone number"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="ec-input"
          />
          <button
            className="ec-btn"
            onClick={handleSendOtp}
            disabled={!value || isBlocked}
          >
          {otpSent
            ? isBlocked
            ? `Resend OTP in ${cooldown}s`
            : "Resend OTP"
          : "Send Verification OTP"}
        </button>

          {otpSent && <p className="ec-info">OTP sent to {masked}</p>}

          {otpSent && (
            <>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="ec-input"
              />
              <button className="ec-btn" onClick={handleVerify}>
                Verify & Update
              </button>
            </>
          )}
          {message && <p className="ec-error">{message}</p>}
        </div>
      </div>

      {showPopup && (
        <div className="ec-overlay">
          <div className="ec-popup">
            <p className="ec-popupText">
              {type === "email" ? "Email" : "Phone"} updated successfully
              <br />
              Please login again
            </p>
            <button className="ec-okBtn" onClick={handleLogout}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}