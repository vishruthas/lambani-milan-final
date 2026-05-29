import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditEmail from "../components/EditEmail";
import ChangePassword from "../components/ChangePassword";
import DeactivateAccount from "../components/DeactivateAccount";
import DeleteAccount from "../components/DeleteAccount";
import "./AccountSettings.css";
import AccountMenu from "../components/AccountMenu";
import logo from "../assets/logo2.webp";

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("email");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(true);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };
  const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a7d6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0792a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b83030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
  <div className="as-page9">

    <div className="headeraccset">
              
          <div className="header-centeraccset">
            <img src={logo} alt="logo" className="logo" />
                <div className="title">Lambani Milan</div>
          </div>
        </div>

    <div className="as-header">

  <button
  className="as-back-btn7"
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

      <div className="as-title-wrap">

        <h2 className="as-heading">
          Account Settings
        </h2>

        <p className="as-desc">
          Manage your account credentials and security preferences.
        </p>

      </div>

    </div>

    {/* MOBILE OVERLAY */}
    {!isMobile && sidebarOpen && (
      <div
        className="as-overlay"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <div className="as-container">

      {/* MOBILE MENU */}
      {isMobile ? (

        mobileMenu ? (

          <AccountMenu
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileMenu(false);
            }}
            MailIcon={MailIcon}
            LockIcon={LockIcon}
            PauseIcon={PauseIcon}
            TrashIcon={TrashIcon}
          />

        ) : (

          <div className="as-content">

            {activeTab === "email" && <EditEmail />}

            {activeTab === "password" && (
              <ChangePassword />
            )}

            {activeTab === "deactivate" && (
              <DeactivateAccount />
            )}

            {activeTab === "delete" && (
              <DeleteAccount
                goToDeactivate={() =>
                  setActiveTab("deactivate")
                }
              />
            )}

          </div>

        )

      ) : (

        <>
          {/* LEFT SIDEBAR */}
          <div
            className={`as-sidebar ${
              sidebarOpen ? "as-sidebar--open" : ""
            }`}
          >

            <SidebarItem
              icon={<MailIcon />}
              label=" Edit E-Mail / Number"
              active={activeTab === "email"}
              onClick={() => handleTabChange("email")}
            />

            <SidebarItem
              icon={<LockIcon />}
              label=" Change Password"
              active={activeTab === "password"}
              onClick={() => handleTabChange("password")}
            />

            <SidebarItem
              icon={<PauseIcon />}
              label=" Deactivate Profile"
              active={activeTab === "deactivate"}
              onClick={() => handleTabChange("deactivate")}
            />

            <SidebarItem
              icon={<TrashIcon />}
              label=" Delete Profile"
              active={activeTab === "delete"}
              onClick={() => handleTabChange("delete")}
            />

          </div>

          {/* RIGHT CONTENT */}
          <div className="as-content">

            {activeTab === "email" && <EditEmail />}

            {activeTab === "password" && (
              <ChangePassword />
            )}

            {activeTab === "deactivate" && (
              <DeactivateAccount />
            )}

            {activeTab === "delete" && (
              <DeleteAccount
                goToDeactivate={() =>
                  setActiveTab("deactivate")
                }
              />
            )}

          </div>
        </>

      )}

    </div>

  </div>
);
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`as-sidebarItem ${active ? "as-activeItem" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <span className="as-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}