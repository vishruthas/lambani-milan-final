import { useNavigate } from "react-router-dom";
import "./AccountMenu.css";

export default function AccountMenu({
  setActiveTab,
  MailIcon,
  LockIcon,
  PauseIcon,
  TrashIcon,
}) {

  const navigate = useNavigate();

  return (
    <>
      

      <div className="mam-wrapper">

        <div
          className="mam-item"
          onClick={() => setActiveTab("email")}
        >
          <div className="mam-left">
            <MailIcon />
            <span>Edit E-Mail / Number</span>
          </div>

          <span className="mam-arrow">›</span>
        </div>

        <div
          className="mam-item"
          onClick={() => setActiveTab("password")}
        >
          <div className="mam-left">
            <LockIcon />
            <span>Change Password</span>
          </div>

          <span className="mam-arrow">›</span>
        </div>

        <div
          className="mam-item"
          onClick={() => setActiveTab("deactivate")}
        >
          <div className="mam-left">
            <PauseIcon />
            <span>Deactivate Profile</span>
          </div>

          <span className="mam-arrow">›</span>
        </div>

        <div
          className="mam-item"
          onClick={() => setActiveTab("delete")}
        >
          <div className="mam-left">
            <TrashIcon />
            <span>Delete Profile</span>
          </div>

          <span className="mam-arrow">›</span>
        </div>

      </div>
    </>
  );
}