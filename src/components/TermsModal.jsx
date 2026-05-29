import "./TermsModal.css";
 
export default function TermsModal({ onClose }) {
  return (
    <div className="tm-overlay">
      <div className="tm-card">

        {/* HEADER */}
        <div className="tm-header">
          <h3>Terms & Conditions</h3>
          <span className="tm-close" onClick={onClose}>×</span>
        </div>

        {/* CONTENT */}
        <div className="tm-content">
          <ol>
              <li><strong>Acceptance of Terms</strong><br />
              <span>By using this platform, you agree to comply with these Terms & Conditions.</span>
              </li>
            <li><strong>Platform Purpose</strong><br />
              <span>The platform only facilitates communication between users seeking matrimonial alliances and does not guarantee marriage outcomes.</span>
              </li>
            <li><strong>Eligibility</strong><br />
            <span>Users must be legally eligible for marriage under applicable laws and must provide accurate information.</span>
              </li>
            <li><strong>Account Responsibility</strong><br />
            <span>Users are responsible for maintaining the confidentiality of their login credentials and all activities under their account.</span>
              </li>
            <li><strong>Profile Information</strong><br />
            <span>Users must provide truthful and accurate profile details and keep their information updated.</span>
              </li>
            <li><strong>Acceptable Use</strong><br />
            <span>Users must use the platform respectfully and only for genuine matrimonial purposes.</span>
              </li>
            <li><strong>Prohibited Activities</strong><br />
            <span>Users must not create fake profiles, impersonate others, upload offensive content, or engage in fraud or harassment.</span>
              </li>
            <li><strong> Photo and Content Upload</strong><br />
            <span>Users must upload only their own photos and lawful content and grant the platform permission to display them for matchmaking purposes.</span>
              </li>
            <li><strong>Account Suspension</strong><br />
            <span>The platform may suspend or terminate accounts that violate these terms or misuse the service.</span>
              </li>
            <li><strong>Safety Disclaimer</strong><br />
            <span>Users should independently verify information before proceeding with marriage discussions. The platform is not responsible for user conduct.</span>  
              </li>
            <li><strong>Payments and Subscriptions</strong><br />
            <span>Certain features may require payment. All payment terms and refund policies will be clearly communicated.</span>
              </li>
            <li><strong>Intellectual Property</strong><br />
            <span>All website content, design, and software belong to the platform and may not be copied without permission.</span>
              </li>
            <li><strong>Limitation of Liability</strong><br />
            <span>The platform is not liable for disputes, damages, or losses arising from interactions between users.</span></li>
            <li><strong>Governing Law</strong><br />
            <span>These terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from the use of this platform shall fall under the jurisdiction of the courts located in Bangalore, Karnataka.</span></li>
            <li><strong>Updates to Terms</strong><br />
            <span>The platform may update these terms from time to time. Continued use means acceptance of updated terms.</span>
            </li>
            <li><strong>User Verification</strong><br />
            <span>The platform does not conduct background checks on all users. Users are responsible for independently verifying the authenticity of information provided by other users before proceeding with matrimonial discussions.</span>
            </li>
            <li><strong>Fraud Safety</strong><br />
            <span>Users are advised not to send money or share financial information with other users on the platform. The platform is not responsible for any financial loss resulting from interactions between users.</span>
            </li>
          </ol>

        </div>

      </div>
    </div>
  );
}