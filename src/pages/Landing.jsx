import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { redirectUser } from "../utils/redirect";
import logo from "../assets/logo2.webp";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import bgImage from "../assets/login-bg2.webp";
import {
  login,
  signup,
  confirmSignup,
  forgotPassword,
  confirmNewPassword,
  isEmailVerified,
  isPhoneVerified,
  verifyEmailOtp,
  verifyPhoneOtp,
  updateEmail,
  updatePhoneNumber
} from "../services/auth";
import { Helmet } from "react-helmet";
import { checkUserExists, reactivateAccount } from "../services/api";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [mode, setMode] = useState("signup");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resetStep, setResetStep] = useState("otp");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const infoRef = useRef(null);
  const otpRefs = useRef([]);
  const passwordInfoRef = useRef(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  const formatIdentifier = (value) => {
    if (!value) return value;
    const trimmed = value.trim();
    if (/^\d{10}$/.test(trimmed)) return "+91" + trimmed;
    return trimmed;
  };

  const resetFields = () => {
    setIdentifier("");
    setPassword("");
    setConfirmPassword("");
    setOtp(Array(6).fill(""));
    setError("");
    setInfo("");
    setShowPassword(false);
    setShowPasswordInfo(false);
    setCooldown(0);
    setIsBlocked(false);
  };

  useEffect(() => {
    setShowPassword(false);
    setShowPasswordInfo(false);
  }, [mode]);

   /* COOL DOWN */

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

  useEffect(() => {
    const hash = location.hash;
    if (hash === "#login") {
      resetFields();
      setMode("login");
    } else if (hash === "#register") {
      resetFields();
      setMode("signup");
    } 
  }, [location]);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      passwordInfoRef.current &&
      !passwordInfoRef.current.contains(event.target)
    ) {
      setShowPasswordInfo(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);

/* RESEND OTP */

useEffect(() => {

  const resendPendingOtp = async () => {

    try {

      if (
        mode === "verify" &&
        pendingVerification
      ) {

        const formatted =
          formatIdentifier(identifier);

        const isPhone =
          formatted.startsWith("+91");
        if (isPhone) {

          await updatePhoneNumber(
            formatted.replace("+91", "")
          );

        } else {

          await updateEmail(formatted);
        }

        setInfo(
          `New OTP sent to ${maskIdentifier(formatted)}`
        );
      }

    } catch (err) {

      console.log(
        "OTP resend failed",
        err
      );
    }
  };

  resendPendingOtp();

}, [mode, pendingVerification]);



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

  const maskIdentifier = (value) => {
    if (!value) return "";
    if (value.includes("@")) {
      const [name, domain] = value.split("@");
      return "****" + name.slice(-4) + "@" + domain;
    }
    return "******" + value.slice(-4);
  };

  const isOtpComplete = otp.join("").length === 6;
  useEffect(() => {
    if (mode === "verify" || (mode === "reset" && resetStep === "otp")) {
      const timer = setTimeout(() => {
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
          otpRefs.current[0].select();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mode, resetStep]);

  const handleSignup = async () => {
    setError("");
    setInfo("");
    const formatted = formatIdentifier(identifier);
    console.log("acceptedterms:", acceptedTerms)
    
    if (!formatted || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept Terms & Conditions and Privacy Policy");
      return;
    }
    try {
      await signup(formatted, password);
      setMode("verify");
      setInfo(`OTP sent to ${maskIdentifier(formatted)}`);
    } catch (e) {
      if (e?.code === "UsernameExistsException") {
        setError("Account already exists.");
      } else {
        setError(e.message || "Signup failed");
      }
    }
  };

  /* const handleVerify = async () => {
    if (!isOtpComplete) return;
    const formatted = formatIdentifier(identifier);
    try {
      await confirmSignup(formatted, otp.join(""));
      await login(formatted, password);
      const isPhone = formatted.startsWith("+91");

const verified = isPhone
  ? await isPhoneVerified()
  : await isEmailVerified();

if (!verified) {

  setError(
    `Please verify your ${
      isPhone ? "mobile number" : "email"
    } using OTP before login`
  );

  return;
}
      window.dispatchEvent(new Event("login"));
      navigate("/profile-create");
    } catch {
      setError("Invalid OTP");
    }
  }; */

  const handleVerify = async () => {

  if (!isOtpComplete) return;

  const formatted = formatIdentifier(identifier);

  try {

    if (pendingVerification) {

      const isPhone = formatted.startsWith("+91");

      if (isPhone) {
        await verifyPhoneOtp(otp.join(""));
      } else {
        await verifyEmailOtp(otp.join(""));
      }

      setPendingVerification(false);

      window.dispatchEvent(new Event("login"));

      await redirectUser(navigate);

      return;
    }

    await confirmSignup(formatted, otp.join(""));

    await login(formatted, password);

    window.dispatchEvent(new Event("login"));

    navigate("/profile-create");

  } catch {

    setError("Invalid OTP");
  }
};

  /* const handleLogin = async () => {
    setError("");
    const formatted = formatIdentifier(identifier);
    try {
      await login(formatted, password);
      let data = await checkUserExists();
      console.log("check user", data);
      if (data.accountStatus === "deactivated") {
        console.log("Reactivating accont");
        await reactivateAccount();
        data = await checkUserExists();
        console.log("After Reactivate", data);
      }
      window.dispatchEvent(new Event("login"));
      await redirectUser(navigate);
    } catch (e) {
      const code = e?.code || "";
      if (code === "UserNotFoundException") {
        setError("Account does not exist.");
      } else if (code === "NotAuthorizedException") {
        setError("Incorrect password/Mail ID.");
      } else if (code === "UserNotConfirmedException") {
        setError("Please verify your account first.");
      } else {
        setError("Login failed.");
      }
      setPassword("");
    }
  }; */

  const handleLogin = async () => {

  setError("");

  const formatted = formatIdentifier(identifier);

  try {
    await login(formatted, password);
    const isPhone = formatted.startsWith("+91");

    const verified = isPhone
      ? await isPhoneVerified()
      : await isEmailVerified();

    console.log("VERIFIED STATUS:", verified);
    if (!verified) {

      setPendingVerification(true);

      setInfo(
        `Please verify your ${
          isPhone ? "mobile number" : "email"
        } using OTP`
      );

      setOtp(Array(6).fill(""));

      setMode("verify");

      return;
    }
    let data = await checkUserExists();

    console.log("check user", data);

    if (data.accountStatus === "deactivated") {

      console.log("Reactivating account");

      await reactivateAccount();

      data = await checkUserExists();

      console.log("After Reactivate", data);
    }

    window.dispatchEvent(new Event("login"));

    await redirectUser(navigate);

  } catch (e) {

    const code = e?.code || "";

    if (code === "UserNotFoundException") {

      setError("Account does not exist.");

    } else if (code === "NotAuthorizedException") {

      setError("Incorrect password/Mail ID.");

    } else if (code === "UserNotConfirmedException") {

      setError("Please verify your account first.");

    } else {

      setError("Login failed.");
    }

    setPassword("");
  }
};

  const handleSendOtp = async () => {
  setError("");
  setInfo("");

  if (!identifier.trim()) {
    setError("Please enter your email or mobile number");
    return;
  }

  const formatted = formatIdentifier(identifier);

  console.log("Forgot Password Identifier:", formatted);

  try {

    console.log("Calling forgotPassword API...");

    const response = await forgotPassword(formatted);

    console.log("Forgot Password Success:", response);

    setMode("reset");
    setResetStep("otp");

    setInfo(
      `OTP sent successfully to ${maskIdentifier(formatted)}. Please check Spam folder if not found in Inbox.`
    );

    setOtp(Array(6).fill(""));

    setIsBlocked(true);
    setCooldown(30);

  } catch (e) {

    console.log("FORGOT PASSWORD ERROR:", e);
    console.log("ERROR CODE:", e?.code);
    console.log("ERROR MESSAGE:", e?.message);

    if (
      e?.code === "LimitExceededException" ||
      e?.code === "TooManyRequestsException"
    ) {

      setError(
        "Too many OTP requests. Please try again after some time."
      );

      setIsBlocked(true);
      setCooldown(180);

    } else if (e?.code === "UserNotFoundException") {

      setError("Account does not exist");

    } else if (e?.code === "InvalidParameterException") {

      setError("Email or phone number is not verified");

    } else {

      setError(
        e?.message || "Unable to send OTP."
      );
    }
  }
};

/* RESET PASSWORD */

  const handleResetPassword = async () => {
    setError("");
    if (!password || password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await confirmNewPassword(formatIdentifier(identifier), otp.join(""), password);
      setInfo("Password reset successful. Please login.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setOtp(Array(6).fill(""));
    }  catch (err) {
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

  return (
    
<>
  <Helmet>
    <title>
      Login or Register | Lambani Milan Matrimony
    </title>

    <meta
      name="description"
      content="Login or create your Lambani Milan account to connect with verified Lambani and Banjara bride and groom profiles."
    />

    <meta
      name="keywords"
      content="Lambani login, Lambani register, Banjara matrimony registration, Lambani matrimony account"
    />

    <meta
      name="robots"
      content="noindex, follow"
    />
  </Helmet>

    <div className="landing-page">
      <div
        className="landing-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      />
      <div className="landing-card" role="main" aria-live="polite">
        <img src={logo} className="landing-logo" alt="Lambani Milan logo" />
        <h2 className="landing-title">Lambani Milan</h2>

              
        {/* SIGNUP */}
        {mode === "signup" && (
          <>
            <div className="landing-input-wrap">
              <input
                className="landing-input"
                placeholder="Email or Mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-label="Email or mobile number"
                autoFocus
              />
            </div>
            <div ref={passwordInfoRef}
              style={{
                position: "relative",
                zIndex: 10
              }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: "13px", color: "#444" }}></span>
              <InfoIcon onClick={() => setShowPasswordInfo((v) => !v)} />
            </div>
            </div>

            <div className="landing-input-wrap">
              <input
                className="landing-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                style={{ marginTop: 0 }}
              />
              <button
                type="button"
                className={`toggle-password ${showPassword ? "open" : "closed"}`}
                onClick={() => setShowPassword((p) => !p)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {password && (
              <div className="strength-wrap" aria-hidden={false}>
                <div
                  className="strength-bar"
                  style={{ width: strength.width, background: strength.color }}
                />
                <div className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </div>
              </div>
            )}

            <div className="landing-input-wrap" style={{ marginTop: 6 }}>
              <input
                className="landing-input landing-input2"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="Confirm password"
              />
            </div>

            {showPasswordInfo && (
              <div className="password-info-box">
                <strong>Password must have:</strong>
                <ul>
                  <li>At least 8 characters</li>
                  <li>An uppercase letter (A–Z)</li>
                  <li>A lowercase letter (a–z)</li>
                  <li>A number (0–9)</li>
                  <li>A special character (!@#...)</li>
                </ul>
              </div>
            )}
            <div className="tm-footer">
              <div className="tm-checkbox">
            <input
              type="checkbox"
              id="termsCheck"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              
            />
            <label htmlFor="termsCheck">
              I agree to{" "}
              
            <span
            className="terms-link"
            onClick={() => 
              setShowTermsModal(true)
              }
            >
              Terms & Conditions
              </span>
            <span>{" "}and{" "}</span>

            <span
            className="terms-link"
            onClick={() => 
              setShowPrivacyModal(true)
              }
            >
              Privacy Policy
            </span>
            </label>
          </div>
          </div>

            <button className="primary-btn"
            onClick={handleSignup}
            disabled={!acceptedTerms}
            >
              Get OTP
              
        
            </button>

            <div className="switch-row">
              <p className="switch-text">Already have an account?</p>
              <p
                className="link"
                onClick={() => { resetFields(); setMode("login"); }}
                role="button"
                tabIndex={0}
              >
                Log in
              </p>
            </div>
          </>
        )}

        {/* VERIFY SIGNUP OTP */}
        {mode === "verify" && (
          <>
            <div className="otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className="otp-box"
                  value={digit}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>
            <button
              className="primary-btn"
              style={{ opacity: isOtpComplete ? 1 : 0.5 }}
              disabled={!isOtpComplete}
              onClick={handleVerify}
            >
              Verify OTP
            </button>
          </>
        )}

        {/* LOGIN */}
        {mode === "login" && (
          <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              className="landing-input"
              placeholder="Email or Mobile number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
            />

            <div className="landing-input-wrap" style={{ marginTop: 6 }}>
              <input
                className="landing-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={`toggle-password ${showPassword ? "open" : "closed"}`}
                onClick={() => setShowPassword((p) => !p)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
              
            </div>

            <button className="primary-btn" type="submit" onClick={handleLogin}>
              Log in
            </button>
            </form>

            <div className="switch-row">
              <p className="switch-text"></p>
              <p className="link" onClick={() => setMode("forgot")} role="button" tabIndex={0}>
                Forgot password ?
              </p>
            </div>

            <div className="switch-row">
              <p className="switch-text">New here?</p>
              <p
                className="link"
                onClick={() => { resetFields(); setMode("signup"); }}
                role="button"
                tabIndex={0}
              >
                Create an account
              </p>
            </div>
          </>
        )}

        {/* FORGOT */}
        {mode === "forgot" && (
          <>
            <input
              className="landing-input"
              placeholder="Email or Mobile number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
            />
            <button 
              className="primary-btn" 
              onClick={handleSendOtp}
              disabled={!identifier.trim() || isBlocked}
              >
                {isBlocked ? `Try again in ${cooldown}s` : "Send OTP"}
            </button>
            {error && <p className="msg error">{error}</p>}
            <div className="switch-row">
              <p
                className="link"
                onClick={() => { resetFields(); setMode("login"); }}
                role="button"
                tabIndex={0}
              >
                Back to log in
              </p>
            </div>
          </>
        )}

        {/* RESET */}
        {/* RESET */}
{mode === "reset" && (
  <>

    {/* OTP */}

    <div className="otp-row" onPaste={handleOtpPaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (otpRefs.current[i] = el)}
          className="otp-box"
          value={digit}
          maxLength={1}
          inputMode="numeric"
          onChange={(e) => handleOtpChange(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(e, i)}
          aria-label={`Reset OTP digit ${i + 1}`}
        />
      ))}
    </div>

    <p className="msg info">
      OTP sent successfully to {maskIdentifier(identifier)}
    </p>

    {/* INFO ICON */}

    <div
  ref={passwordInfoRef}
  style={{
    position: "relative",
    zIndex: 10
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 2,
      marginBottom: 2
    }}
  >
    <InfoIcon
      onClick={() =>
        setShowPasswordInfo((v) => !v)
      }
    />
  </div>

  {showPasswordInfo && (
    <div className="password-info-box">
      <strong>Password must have:</strong>

      <ul>
        <li>At least 8 characters</li>
        <li>An uppercase letter (A–Z)</li>
        <li>A lowercase letter (a–z)</li>
        <li>A number (0–9)</li>
        <li>A special character (!@#...)</li>
      </ul>
    </div>
  )}
</div>
    {/* NEW PASSWORD */}

    <div
      className="landing-input-wrap"
      style={{ marginTop: 8 }}
    >
      <input
        className="landing-input"
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />

      <button
        type="button"
        className={`toggle-password ${showPassword ? "open" : "closed"}`}
        onClick={() => setShowPassword((p) => !p)}
        aria-pressed={showPassword}
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        <EyeIcon open={showPassword} />
      </button>
    </div>

    {/* PASSWORD STRENGTH */}

    {password && (
      <div className="strength-wrap">
        <div
          className="strength-bar"
          style={{
            width: strength.width,
            background: strength.color
          }}
        />

        <div
          className="strength-label"
          style={{ color: strength.color }}
        >
          {strength.label}
        </div>
      </div>
    )}

    {/* CONFIRM PASSWORD */}

    <div
      className="landing-input-wrap"
      style={{ marginTop: 6 }}
    >
      <input
        className="landing-input landing-input2"
        type={showPassword ? "text" : "password"}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
      />

      <button
        type="button"
        className={`toggle-password ${showPassword ? "open" : "closed"}`}
        onClick={() => setShowPassword((p) => !p)}
        aria-pressed={showPassword}
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        <EyeIcon open={showPassword} />
      </button>
    </div>

    

    {/* BUTTONS */}

    <div className="otp-btn-row">

      <button
        className="secondary-btn resend-btn"
        onClick={handleSendOtp}
        disabled={isBlocked}
      >
        {isBlocked
          ? `Resend OTP ${cooldown}s`
          : "Resend OTP"}
      </button>

      <button
        className="primary-btn verify-btn"
        disabled={
          !isOtpComplete ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
        onClick={handleResetPassword}
      >
        Change Password
      </button>

    </div>

    {/* SUCCESS */}

    {resetStep === "success" && (
      <>
        <p className="msg info">{info}</p>

        <div className="switch-row">
          <p
            className="link"
            onClick={() => {
              resetFields();
              setMode("login");
              setResetStep("otp");
            }}
            role="button"
            tabIndex={0}
          >
            Back to log in
          </p>
        </div>
      </>
    )}

  </>
)}

        {error && <p className="msg error" role="alert">{error}</p>}
        {info && mode !== "reset" && <p className="msg info">{info}</p>}
      </div>
      {showTermsModal && (
  <TermsModal onClose={() => setShowTermsModal(false)} />
)}

{showPrivacyModal && (
  <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
)}
    </div>
    </>
  );
}