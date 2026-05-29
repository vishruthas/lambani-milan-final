import { useEffect, useState } from "react";
import PrivacyMenu from "../components/PrivacyMenu";
import { useNavigate } from "react-router-dom";
import ProfileVisibility from "../components/ProfileVisibility";
import BlockedUsers from "../components/BlockedUser";
import "./PrivacySecurity.css";
import logo from "../assets/logo2.webp";

export default function Privacy() {
  const [activeTab, setActiveTab] = useState("visibility");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(true);


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const EyeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const BlockIcon = () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8b0000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="5" y1="19" x2="19" y2="5" />
    </svg>
  );

  const [isMobile, setIsMobile] = useState(
  window.innerWidth <= 480
);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 480);
  };

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener("resize", handleResize);
}, []);


  return (
  <div className="privacy-page">

    <div className="headeraccset">
                  
              <div className="header-centeraccset">
                <img src={logo} alt="logo" className="logo" />
                    <div className="title">Lambani Milan</div>
              </div>
            </div>

    <div className="as-header">

      <button
  className="ps-back-btn7"
  onClick={() => {
    if (isMobile && !mobileMenu) {
      setMobileMenu(true);
    } else {
      navigate("/home");
    }
  }}
  aria-label="Go back to home"
>
  &#8592;
</button>

      <div className="ps-title-wrap">

        <h2 className="privacy-heading">
          Privacy & Security
        </h2>

        <p className="ps-desc">
          Control your profile visibility and manage user interactions.
        </p>

      </div>

    </div>

    {/* MOBILE OVERLAY */}
    {!isMobile && sidebarOpen && (
      <div
        className="privacy-overlay"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <div className="privacy-container">

      {/* MOBILE MENU */}
      {isMobile ? (

        mobileMenu ? (

          <PrivacyMenu
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileMenu(false);
            }}
            EyeIcon={EyeIcon}
            BlockIcon={BlockIcon}
          />

        ) : (

          <div className="privacy-content">

            {activeTab === "visibility" && (
              <ProfileVisibility />
            )}

            {activeTab === "blocked" && (
              <BlockedUsers />
            )}

          </div>

        )

      ) : (

        <>
          {/* LEFT SIDEBAR */}
          <div
            className={`privacy-sidebar ${
              sidebarOpen
                ? "privacy-sidebar--open"
                : ""
            }`}
          >

            <SidebarItem
              icon={<EyeIcon />}
              label="Profile Visibility"
              active={activeTab === "visibility"}
              onClick={() =>
                handleTabChange("visibility")
              }
            />

            <SidebarItem
              icon={<BlockIcon />}
              label="Blocked Users"
              active={activeTab === "blocked"}
              onClick={() =>
                handleTabChange("blocked")
              }
            />

          </div>

          {/* RIGHT CONTENT */}
          <div className="privacy-content">

            {activeTab === "visibility" && (
              <ProfileVisibility />
            )}

            {activeTab === "blocked" && (
              <BlockedUsers />
            )}

          </div>
        </>

      )}

    </div>

  </div>
);
}
/* SIDEBAR ITEM */
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`privacy-sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <span className="sidebar-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}