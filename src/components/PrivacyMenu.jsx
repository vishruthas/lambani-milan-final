import { useNavigate } from "react-router-dom";
import "./PrivacyMenu.css";

export default function PrivacyMenu({
  setActiveTab,
  EyeIcon,
  BlockIcon,
}) {

  const navigate = useNavigate();

  return (
    <>
      <div className="pm-top">

      </div>

      <div className="pm-wrapper">

        <div
          className="pm-item"
          onClick={() => setActiveTab("visibility")}
        >
          <div className="pm-left">
            <EyeIcon />
            <span>Profile Visibility</span>
          </div>

          <span className="pm-arrow">›</span>
        </div>

        <div
          className="pm-item"
          onClick={() => setActiveTab("blocked")}
        >
          <div className="pm-left">
            <BlockIcon />
            <span>Blocked Users</span>
          </div>

          <span className="pm-arrow">›</span>
        </div>

      </div>
    </>
  );
}