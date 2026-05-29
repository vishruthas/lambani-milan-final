import { useState, useRef, useEffect } from "react";
import {
  forgotPassword,
  confirmNewPassword,
  globalSignOut
  
} from "../services/auth";
import "./ForgotPassword.css";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState("enter");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const otpRefs = useRef([]); 
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);

const isOtpComplete = otp.join("").length === 6;
  const ForgotPasswordIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
  >
    <rect x="40" y="80" width="120" height="80" rx="20" fill="#F5A623" />
    <path
      d="M70 80 V60 A30 30 0 0 1 130 60 V80"
      stroke="#1FB6D5"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <circle cx="100" cy="115" r="10" fill="#0B5C6B" />
    <rect x="95" y="115" width="10" height="20" fill="#0B5C6B" />
    <circle cx="140" cy="140" r="25" fill="#1FB6D5" />
    <text
      x="140"
      y="150"
      textAnchor="middle"
      fontSize="30"
      fill="white"
      dy="-5"
    >
      ?
    </text>
  </svg>
);

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

  const InfoIcon = ({ onClick }) => (
    <div className="info-icon-wrap" onClick={onClick} style={{ cursor: "pointer" }}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="info-icon-svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 8h.01M12 11v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
  /* COOL DOWN */

  useEffect(() => {
  if (cooldown === 0) {
    setIsBlocked(false); // re-enable
    return;
  }

  const timer = setInterval(() => {
    setCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [cooldown]);

 /* HANDLE OTP */

    const handleOtpChange = (index, raw) => {
    const value = raw.replace(/\D/g, "");
    const newOtp = [...otp];
    if (!value) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6 - index);
      for (let i = 0; i < digits.length; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + value.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtp(newOtp);
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length > 0) {
      const newOtp = Array(6).fill("");
      pasteData.split("").forEach((d, i) => (newOtp[i] = d));
      setOtp(newOtp);
      otpRefs.current[Math.min(pasteData.length - 1, 5)]?.focus();
    }
    e.preventDefault();
  };

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

const maskIdentifier = (value) => {
    if (!value) return "";
    if (value.includes("@")) {
      const [name, domain] = value.split("@");
      return "****" + name.slice(-4) + "@" + domain;
    }
    return "******" + value.slice(-4);
  };

  /* SEND OTP */
const handleSendOtp = async () => {
  try {
    setError("");
    setInfo("");
    setIsBlocked(false);

    const loggedInUser = localStorage.getItem("username")?.trim();

    console.log("Logged In User:", loggedInUser);
    console.log("Entered Identifier:", identifier);

    if (
      loggedInUser &&
      identifier.trim().toLowerCase() !==
        loggedInUser.toLowerCase()
    ) {
      return setError(
        "Please enter the email used for login"
      );
    }
    const response = await forgotPassword(identifier.trim());
    setStep("otp");
    setInfo("OTP sent successfully. Please check Spam folder if not found in Inbox.");
    setOtp(Array(6).fill(""));

  } catch (err) {

    console.log("FORGOT PASSWORD ERROR:", err);
    console.log("ERROR CODE:", err?.code);
    console.log("ERROR MESSAGE:", err?.message);

    if (
      err?.code === "LimitExceededException" ||
      err?.code === "TooManyRequestsException"
    ) {

      setError(
        "Too many OTP requests. Please try again after some time."
      );

      setIsBlocked(true);
      setCooldown(180);

    } else if (err?.code === "UserNotFoundException") {

      setError("Account does not exist");

    } else if (err?.code === "InvalidParameterException") {

      setError("Email or phone number is not verified");

    } else {

      setError(err?.message || "Failed to send OTP");
    }
  }
};

  /* RESET PASSWORD */
const handleResetPassword = async () => {
  if (!password || password !== confirmPassword) {
    return setError("Passwords do not match");
  }

  try {
    await confirmNewPassword(identifier, otp.join(""), password);
    await globalSignOut();

      localStorage.removeItem("access_token");
      localStorage.removeItem("id_token");
      localStorage.removeItem("username");

      window.dispatchEvent(new Event("logout"));
    setInfo("Password changed successfully");
    setStep("success");
    setShowPopup(true);
  } catch (err) {
  console.log(err);

  if (err?.code === "CodeMismatchException") {
    setError("Enter correct OTP");
  } else if (err?.code === "ExpiredCodeException") {
    setError("OTP expired");
  } else {
    setError(err.message || "Password reset failed");
  }
}
};

useEffect(() => {
  if (step === "otp") {
    setTimeout(() => {
      otpRefs.current[0]?.focus();
      }, 100);
      }
      }, [step]);


  return (
  <div className="fg-box">

    {/* HEADER */}
    <div className="fg-title">
      <div className="fg-title-row">
        <ForgotPasswordIcon size={30} />
        <h3>Forgot Password</h3>
      </div>
      <p>Reset your password using OTP verification</p>
    </div>

    {/* STEP 1 → ENTER */}
    {step === "enter" && (
      <>
      <div style={{ marginTop: "12px" }}>
        <input
          className="fg-input"
          placeholder="Enter email / phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        </div>
        <div className="fg-actions">
        <button 
              className="fg-btn" 
              onClick={handleSendOtp}
              disabled={!identifier.trim() || isBlocked}
              >
                {isBlocked ? `Try again in ${cooldown}s` : "Send OTP"}
            </button>
            <button className="fg-btn secondary" onClick={onBack}>
          Back
        </button>
        </div>
            
          </>
        )}


    {/* STEP 2 → OTP */}
    {step === "otp" && (
      <>
        <div className="fg-card">
        <div className="fg-card-inner">
        <div className="otp-container">
        <div className="otp-row" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              className="otp-box"
              value={digit}
              maxLength={1}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(e, i)}
              aria-label={`Reset OTP digit ${i + 1}`}
            />
          ))}
        </div>
        <p className="fg-info">OTP sent successfully to {maskIdentifier(identifier)}</p>
      <div className="fg-label-row">
      <label className="fg-label">New Password</label>
    </div>


    {/* NEW PASSWORD */}
    <div className="fg-input-wrap">
      <input
        type={showPassword ? "text" : "password"}
        className="fg-input"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <span
        className="info-icon-inside"
        onClick={() => setShowInfo(!showInfo)}
        >
        <InfoIcon />
        </span>

    {/* INFO TOOLTIP */}
    {showInfo && (
      <div className="fg-tooltip">
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

      <button
        type="button"
        className="toggle-passwordfgnew"
        onClick={() => setShowPassword((p) => !p)}
      >
        <EyeIcon open={showPassword} />
      </button>
    </div>

    {/* CONFIRM PASSWORD */}
    
      <label className="fg-label">Confirm Password</label>
      <div className="fg-input-wrap">
      <input
        type={showPassword ? "text" : "password"}
        className="fg-input"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="button"
        className="toggle-passwordfg"
        onClick={() => setShowPassword((p) => !p)}
      >
        <EyeIcon open={showPassword} />
      </button>
    </div>

    <button className="fg-btn1" onClick={handleResetPassword}>
      Change Password
    </button>        
        </div>
        </div>
    </div>
      </>
    )}
    

    {/* ERROR */}
    {error && <p className="fg-error">{error}</p>}

    {/* SUCCESS POPUP */}
    {showPopup && (
      <div className="fg-overlay">
        <div className="fg-popup">
          <p>Password updated successfully</p>
          <button
            className="fg-okBtn"
            onClick={() => {
              setShowPopup(false);
              onBack(); 
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </div>
);
}