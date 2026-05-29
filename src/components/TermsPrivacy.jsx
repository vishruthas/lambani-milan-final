import { useState } from "react";
import "./TermsPrivacy.css";

export default function TermsPrivacy({ onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div className="tm-overlay">
      <div className="tm-card">

        {/* HEADER */}
        <div className="tm-header">
          <h3>Terms & Privacy</h3>
          <span className="tm-close" onClick={onClose}>×</span>
        </div>

        {/* TABS */}
        <div className="tm-tabs">
          <button
            className={activeTab === "terms" ? "active" : ""}
            onClick={() => setActiveTab("terms")}
          >
            Terms & Conditions
          </button>

          <button
            className={activeTab === "privacy" ? "active" : ""}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy Policy
          </button>
        </div>

        {/* CONTENT */}
        <div className="tm-content">

          {activeTab === "terms" && (
            <ol>
              <li><strong>Acceptance of Terms</strong> – By using this platform, you agree to comply with these Terms & Conditions.</li>
              <li><strong>Platform Purpose</strong> – The platform facilitates communication between users seeking matrimonial alliances.</li>
              <li><strong>Eligibility</strong> – Users must be legally eligible for marriage under applicable laws.</li>
              <li><strong>Account Responsibility</strong> – Users are responsible for maintaining account confidentiality.</li>
              <li><strong>Profile Information</strong> – All information must be truthful and updated.</li>
              <li><strong>Acceptable Use</strong> – Platform must be used respectfully.</li>
              <li><strong>Prohibited Activities</strong> – No fake profiles, fraud, or harassment.</li>
              <li><strong>Content Upload</strong> – Only lawful and personal content allowed.</li>
              <li><strong>Account Suspension</strong> – Violations may lead to suspension.</li>
              <li><strong>Safety Disclaimer</strong> – Users must verify information independently.</li>
              <li><strong>Payments</strong> – Paid features will be clearly defined.</li>
              <li><strong>Intellectual Property</strong> – Platform content is protected.</li>
              <li><strong>Liability</strong> – Platform not responsible for user interactions.</li>
              <li><strong>Governing Law</strong> – Indian laws (Bangalore jurisdiction).</li>
              <li><strong>Updates</strong> – Continued use means acceptance of changes.</li>
              <li><strong>User Verification</strong> – Background checks not guaranteed.</li>
              <li><strong>Fraud Safety</strong> – Do not share money or financial info.</li>
            </ol>
          )}

          {activeTab === "privacy" && (
            <ol>
              <li><strong>Information Collected</strong> – Name, contact details, photos.</li>
              <li><strong>Usage Data</strong> – Device info, IP, usage patterns.</li>
              <li><strong>Purpose</strong> – Profile creation and matchmaking.</li>
              <li><strong>Data Sharing</strong> – Only with service providers.</li>
              <li><strong>Security</strong> – Reasonable protection measures applied.</li>
              <li><strong>User Control</strong> – Users can update/delete data.</li>
              <li><strong>Retention</strong> – Stored as required.</li>
              <li><strong>Cookies</strong> – Used to improve experience.</li>
              <li><strong>Third-party Links</strong> – External sites not controlled.</li>
              <li><strong>Updates</strong> – Continued usage = acceptance.</li>
              <li><strong>Contact</strong> – Reach us via provided details.</li>
              <li><strong>Compliance</strong> – As per Indian laws.</li>
            </ol>
          )}

        </div>

        {/* FOOTER */}
        <div className="tm-footer">
          <label className="tm-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I agree to the Terms & Conditions and Privacy Policy
          </label>

          <button
            className={`tm-btn ${accepted ? "active" : ""}`}
            disabled={!accepted}
            onClick={onAccept}
          >
            Accept & Continue
          </button>
        </div>

      </div>
    </div>
  );
}