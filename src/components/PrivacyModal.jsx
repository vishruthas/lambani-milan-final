import "./PrivacyModal.css";

export default function PrivacyModal({ onClose }) {
  return (
    <div className="pm-overlay">
      <div className="pm-card">

        {/* HEADER */}
        <div className="pm-header">
          <h3>Privacy Policy</h3>
          <span className="pm-close" onClick={onClose}>×</span>
        </div>

        {/* CONTENT */}
        <div className="pm-content">

          <ol>
            <li><strong>Information We Collect</strong><br />
            <span>We collect personal information such as name, gender, date of birth, contact details, profile details, Occupation, Caste and photos.</span>
              </li>
            <li><strong>Usage Data</strong><br />
            <span>We may collect device information, IP address, and usage data to improve our services.</span>
              </li>
            <li><strong>Purpose</strong><br />
            <span>Information is collected to create user profiles, provide matchmaking services, improve the platform, and communicate with users.</span>
              </li>
            <li><strong>Data Sharing</strong><br />
            <span>We may share data with service providers such as payment processors, or analytics providers. We do not sell personal data..</span>
              </li>
            <li><strong>Data Security</strong><br />
            <span>We implement reasonable security measures to protect user data from unauthorized access.</span>
              </li>
            <li><strong>User Control</strong><br />
            <span>Users can update profile information, modify account settings, or request account deletion.</span>
              </li>
            <li><strong>Data Retention</strong><br />
            <span>User information may be retained while the account is active or as required by law.. Once user deletes account then information will be retained for 60 days.</span>
              </li>
            <li><strong>Cookies</strong><br />
            <span>We may use cookies and similar technologies to improve user experience and website performance.</span>
              </li>
            <li><strong>Policy Updates</strong><br />
            <span>This privacy policy may be updated periodically. Continued use of the platform indicates acceptance of the updated policy.</span>
              </li>
            <li><strong>Contact</strong><br />
            <span>Users may contact us for privacy-related concerns using the contact details provided on the website.</span>
              </li>
            <li><strong>Legal Compliance</strong><br />
            <span>We process personal data in accordance with applicable data protection and information technology laws in India.</span>
              </li>
          </ol>

        </div>

      </div>
    </div>
  );
}