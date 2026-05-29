import { useState, useEffect } from "react";
import { updateProfileVisibility } from "../services/api";
import "./ProfileVisibility.css";

export default function ProfileVisibility() {
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("profileVisibility");
    if (saved === "private" || saved === "public") {
      setVisibility(saved);
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMsg("");

    try {
      await updateProfileVisibility(visibility);
      localStorage.setItem("profileVisibility", visibility);
      setMsg("Profile visibility updated successfully");
    } catch {
      setMsg("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  /* SVG ICON */
  const EyeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );


  return (
    <div className="pv-wrapper">

      {/* TITLE */}
      <div className="pv-title">
        <div className="pv-title-row">
          <EyeIcon />
          <h3>Profile Visibility</h3>
        </div>
        <p className="pv-desc">
          Choose who gets to see your profile photos. Your basic details like name, age, and community remain visible to relevant matches — only your photos are controlled by this setting.
        </p>
      </div>

      <div className="pv-divider" />
      {/* CURRENT STATUS */}
      <p className="pv-current">
      Current visibility: <strong>{visibility === "public" ? "Public" : "Private"}</strong>
      </p>

    

      {/* CARD */}
      <div className="pv-card">
        <div className="pv-card-title">
          Manage who can view your photos
        </div>
        <p className="pv-desc1">
          Select your preferred visibility level. You can change this anytime — the update takes effect immediately.
        </p>

        {/* PRIVATE */}
        <label className={`pv-option ${visibility === "private" ? "active" : ""}`}>
          <input
            type="radio"
            value="private"
            checked={visibility === "private"}
            onChange={(e) => setVisibility(e.target.value)}
          />
          <div>
            <strong>🔒 Private</strong>
            <p>Your photos will be visible only to users whose interest you accept</p>
          </div>
        </label>

        {/* PUBLIC */}
        <label className={`pv-option ${visibility === "public" ? "active" : ""}`}>
          <input
            type="radio"
            value="public"
            checked={visibility === "public"}
            onChange={(e) => setVisibility(e.target.value)}
          />
          <div>
            <strong>🌍 Public</strong>
            <p>Your photos will be visible to all registered users</p>
          </div>
        </label>

        {/* BUTTON */}
        <button
          className="pv-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {msg && <p className="pv-msg">{msg}</p>}
      </div>
    </div>
  );
}