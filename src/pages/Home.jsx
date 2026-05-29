import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo2.webp";
import { getHomeData } from "../services/api";
import TermsModal from "../components/TermsModal";
import HelpModal from "../components/HelpModal";
import PrivacyModal from "../components/PrivacyModal";
import "./Home.css";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";
const FALLBACK_IMAGE = "/default-user.png";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showTerms, setShowTerms] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [data, setData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    getHomeData()
      .then((res) => setData(res))
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/");
      });
  }, [navigate]);

  const handleEditProfile = () => {
    setShowMenu(false);
    navigate("/edit-basic");
  };

  const handleAccountSettings = () => {
    setShowMenu(false);
    navigate("/account-settings");
  };

  const handlePrivacy = () => {
    setShowMenu(false);
    navigate("/privacy-settings");
  };

  const handleHelp = () => {
    setShowMenu(false);
    setShowHelp(true);
  };

  if (!data) {
    return <div className="loading">Loading...</div>;
  }

  const { currentUser, recentlyJoined, matches } = data;
  const isActive = (path) => currentPath === path;

  return (
    <div className="page2">
      {/* HEADER */}
      <div className="header1">
        <div className="header-left">
          <img
            src={
              currentUser.displayPhoto
                ? S3_BUCKET + currentUser.displayPhoto
                : FALLBACK_IMAGE
            }
            className="profile-pic"
            alt={currentUser.name || "User"}
            onError={(e) => (e.target.src = FALLBACK_IMAGE)}
          />
          <div>
            <p className="profile-pic-name">{currentUser.name}</p>
          </div>
        </div>

        <div className="header-centerhome">
          <img src={logo} alt="logo" className="logo" />
          <div className="title">Lambani Milan</div>
        </div>

        <div className="header-right">
          <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
            ☰
          </div>

          {showMenu && (
            <div className="dropdown">
              <div className="menu-item2" onClick={handleEditProfile}>
                Edit Profile
              </div>
              <div className="menu-item" onClick={handleAccountSettings}>
                Account Settings
              </div>
              <div className="menu-item" onClick={handlePrivacy}>
                Privacy and Security
              </div>
              <div
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  setShowTerms(true);
                }}
              >
                Terms and Conditions
              </div>
              <div className="menu-item" onClick={handleHelp}>
                Help
              </div>
              <div
                className="menu-item logout "
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("id_token");
                  window.dispatchEvent(new Event("logout"));
                  setTimeout(() => navigate("/"), 100);
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECENTLY JOINED */}
      <section className="section">
        <h3>Recently Joined</h3>
        <div className="card-row">
          {recentlyJoined.slice(0, 8).map((u) => (
            <ProfileView key={u.userId} user={u} />
          ))}
        </div>
        <div
          className="seeall-below"
          role="button"
          tabIndex={0}
          aria-label="See all recently joined"
          onClick={() => navigate("/profiles/recent")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/profiles/recent");
            }
          }}
        >
          See all →
        </div>
      </section>

      {/* MATCHES */}
      <section className="section">
        <h3>Your Matches</h3>
        <div className="card-row">
          {matches.slice(0, 8).map((u) => (
            <ProfileView key={u.userId} user={u} />
          ))}
        </div>
        <div
          className="seeall-below"
          role="button"
          tabIndex={0}
          aria-label="See all matches"
          onClick={() => navigate("/profiles/matches")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/profiles/matches");
            }
          }}
        >
          See all →
        </div>
      </section>

      {/* FOOTER */}

      <footer className="lp-footer5">
        <div className="lp-footer-inner5">
          <div className="footer-brand5">
            <div className="lp-logo">
              <img src={logo} alt="logo small" />
            </div>
            <div className="footer-text5">
              <div className="lp-name5">Lambani Milan</div>
            </div>
          </div>

          <div className="contact5">
            <p className="contact5-heading">
              <strong>Contact</strong>
            </p>
            <p className="contact5-email-row">
              Email :{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=lambanimilan2026@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-email"
              >
                lambanimilan2026@gmail.com
              </a>
            </p>
          </div>

          <div className="lp-footer-right5">
            <div className="footer-links5">
              <div className="legal5">
                <p><strong>Legal</strong></p>
                <a
                  href="#privacy"
                  onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
                >
                  Privacy Policy
                </a>
                <br />
                <a
                  href="#terms"
                  onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                >
                  Terms &amp; Conditions
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="copy_right5 copy_right5-notice">
          This website is strictly for matrimonial purpose only and not a dating website.
        </p>
        <p className="copy_right5 copy_right5-year">
          ©. {new Date().getFullYear()} Lambani Milan
        </p>
      </footer>

      {/* MODALS */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
} 

function getDistrict(location) {
  if (!location) return "";

  if (location.includes("-")) {
    return location.split("-")[1].trim();
  }

  return location;
}
/* PROFILE CARD */
function ProfileView({ user }) {
  const navigate = useNavigate();
  //const district = getDistrict(user.location);
  return (
    <div
      className="card"
      onClick={() => navigate(`/profile/${user.userId}`)}
    >
      <img
        src={user.displayPhoto ? S3_BUCKET + user.displayPhoto : FALLBACK_IMAGE}
        className="card-img"
        alt={user.name || "User"}
        onError={(e) => (e.target.src = FALLBACK_IMAGE)}
      />
      <div className="card-name">{user.name}</div>
      <small className="card-detail">
        {user.age} yrs • {getDistrict(user.location)}
      </small>
    </div>
  );
}

/* FOOTER ITEM */
function FooterItem({ label, icon, active, onClick }) {
  return (
    <div
      className={`footer-item ${active ? "active-footer" : ""}`}
      onClick={onClick}
    >
      <span className="footer-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}