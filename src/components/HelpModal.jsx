import { useEffect, useState } from "react";
import { getMyProfile } from "../services/api";
import "./HelpModal.css";

export default function HelpModal({ onClose }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data.profile);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  fetchProfile();
}, []);

const username = localStorage.getItem("username") || "";

const subject = encodeURIComponent("Help Request");

const body = encodeURIComponent(
  `Name: ${profile?.name || ""}
   Contact: ${username}`
);

const mailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=lambanimilan2026@gmail.com&su=${subject}&body=${body}`;

  return (
    <div className="hm-overlay">
      <div className="hm-card">

        <div className="hm-header">
          <h3>Help & Support</h3>
          <span className="hm-close" onClick={onClose}>×</span>
        </div>

        <div className="hm-content">
          <p>Have any queries or need help?</p>
          <p>
            Write to us at{" "}
            <a
              href={mailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hm-email"
            >
              lambanimilan2026@gmail.com
              </a>
          </p>
        </div>

      </div>
    </div>
  );
}