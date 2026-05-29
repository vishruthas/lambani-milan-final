import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.webp";
import {
  getMyProfile,

} from "../services/api";
import districtsData from "../data/districts.json";
import { FaPen } from "react-icons/fa";
import "./MyProfile.css";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const S3_BASE =
    "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";

    const VerifiedBadgeIcon = ({ size = 34, color = "currentColor", strokeWidth = 1.8, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    <path d="M12 2.5 L13.8 4 L16.2 3.6 L17 5.9 L19.2 6.8 L18.8 9.2 L20.4 11 L18.8 12.8 L19.2 15.2 L17 16.1 L16.2 18.4 L13.8 18 L12 19.5 L10.2 18 L7.8 18.4 L7 16.1 L4.8 15.2 L5.2 12.8 L3.6 11 L5.2 9.2 L4.8 6.8 L7 5.9 L7.8 3.6 L10.2 4 Z" />
    <polyline points="8.5 11.5 11 14 15.5 9" />
  </svg>
);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await getMyProfile();
    setProfile(res.profile);
  }

  if (!profile) {
    return <div className="page_8" style={{ padding: 20 }}>Loading...</div>;
  }

  /* PHOTOS */
  const allPhotos = [
    ...(profile.displayPhoto ? [profile.displayPhoto] : []),
    ...(profile.photos || [])
  ]
    .filter(Boolean)
    .map(key =>
      key.startsWith("http") ? key : S3_BASE + key
    );

  const atFirst = active === 0;
  const atLast = active >= allPhotos.length - 1;

  return (
    <div>
      <div className="headermy">
      
              <div className="header-centermy">
                <img src={logo} alt="logo" className="logo" />
                <div className="title">Lambani Milan</div>
              </div>
              </div>

      <div className="page_8">
        {/* PHOTO VIEWER */}
        <div className="viewer_8" role="region" aria-label="Photo viewer">
          {allPhotos.length > 0 && (
            <img src={allPhotos[active]} className="viewer-image_8" alt="" />
          )}

          {allPhotos.length > 1 && (
            <>
              <button
                className={`left-arrow_8 ${atFirst ? "arrow-disabled_8" : ""}`}
                onClick={() => !atFirst && setActive(active - 1)}
                disabled={atFirst}
                aria-disabled={atFirst}
                aria-label="Previous photo"
              >
                &#10094;
              </button>

              <button
                className={`right-arrow_8 ${atLast ? "arrow-disabled_8" : ""}`}
                onClick={() => !atLast && setActive(active + 1)}
                disabled={atLast}
                aria-disabled={atLast}
                aria-label="Next photo"
              >
                &#10095;
              </button>
            </>
          )}

          {/* EDIT PHOTOS */}
          <FaPen
            className="edit-icon-top_8 edit-icon-spaced_8"
            onClick={() => navigate("/manage-photos?mode=manage")}
            role="button"
            aria-label="Manage photos"
          />
        </div>

        {/* DISPLAY PHOTO */}
        <div className="display-wrapper_8">
          {profile.displayPhoto && (
            <img
              src={
                profile.displayPhoto.startsWith("http")
                  ? profile.displayPhoto
                  : S3_BASE + profile.displayPhoto
              }
              className="display-photo_8"
              alt=""
            />
          )}

          <FaPen
            className="dp-edit_8"
            onClick={() => navigate("/manage-photos?mode=display")}
            role="button"
            aria-label="Edit display photo"
          />
        </div>
        
        
        <div className="name-with-badge1">
        <h2 className="profile-name1">{profile.name}</h2>
        {profile.verificationStatus === "verified" && (
  <span className="verified-badge">
  <VerifiedBadgeIcon />
</span>
        )}
</div>
     

        {/* BASIC INFO */}
        <div className="card_8">
          <div className="card-header_8">
            <h3>Basic Info</h3>
            <FaPen onClick={() => navigate("/edit-basic")} className="card-edit-icon_8" />
          </div>

          <Info label="Name" value={profile.name} />
          <Info label="DOB" value={profile.dob} />
          <Info label="Gender" value={profile.gender} />
          <Info label="Marital Status" value={profile.maritalStatus} />
          <Info label="Height" value={profile.height} />
          <Info label="Kul" value={profile.kul} />
          <Info label="Gothra" value={profile.gothra} />
          <Info label="Education" value={profile.education} />
          <Info label="Occupation" value={profile.occupation} />
          <Info label="State" value={profile.state} />
          <Info label="District" value={profile.district?.name} />
          <Info label="Smoking" value={profile.smoking} />
          <Info label="Drinking" value={profile.drinking} />
          <Info label="Salary" value={profile.salary} />
          <Info label="About Me" value={profile.aboutMe} />
        </div>

        {/* PREFERENCES */}
        <div className="card_8">
          <div className="card-header_8">
            <h3>Preferences</h3>
            <FaPen onClick={() => navigate("/edit-preferences")} className="card-edit-icon_8" />
          </div>

          <Info label="Min Age" value={profile.preferences?.minAge} />
          <Info label="Max Age" value={profile.preferences?.maxAge} />
          <Info
            label="Education Level"
            value={profile.preferences?.educationLevel}
          />
          <Info
            label="Marital Status"
            value={profile.preferences?.preferredMaritalStatus}
          />
          <Info label="Smoking" value={profile.preferences?.smoking} />
          <Info label="Drinking" value={profile.preferences?.drinking} />

          <div className="row_8">
            <span className="label_8">Preferred Kul & Gothra</span>

            <span className="value_8">
              {(() => {
                const list = profile.preferences?.preferredKulGothra;
                if (!Array.isArray(list) || list.length === 0) return "-";

                const normalizeKul = (k) => {
                  if (!k) return "";
                  if (typeof k === "string") return k;
                  if (typeof k === "object") return k.name || k.label || k.value || k.id || "";
                  return String(k);
                };

                const normalizeGothraArray = (g) => {
                  if (!g) return [];
                  if (typeof g === "string") return [g];
                  if (!Array.isArray(g)) return [];
                  return g
                    .map(x => {
                      if (!x) return "";
                      if (typeof x === "string") return x;
                      if (typeof x === "object") return x.name || x.label || x.value || "";
                      return String(x);
                    })
                    .filter(Boolean);
                };

                const isDoesntMatter = (s) => {
                  if (!s) return false;
                  const v = String(s).toLowerCase().replace(/\s+/g, "");
                  return v === "doesn'tmatter" || v === "doesntmatter" || v === "doesntmatter";
                };

                return list
                  .map(entry => {
                    const kulRaw = entry.kul ?? entry.kulName ?? entry.kul_name ?? entry.k;
                    const gothraRaw = entry.gothra ?? entry.gothras ?? entry.gothraList ?? entry.g;

                    const kulName = normalizeKul(kulRaw) || "Unknown Kul";
                    const gothraArr = normalizeGothraArray(gothraRaw);

                    if (isDoesntMatter(kulName)) {
                      return "All Kuls & Gothras";
                    }

                    if (!gothraArr.length || gothraArr.some(isDoesntMatter)) {
                      return `${kulName}: All Gothras`;
                    }

                    return `${kulName}: ${gothraArr.join(", ")}`;
                  })
                  .join(" | ");
              })()}
            </span>
          </div>

          {/* LOCATIONS */}
          <Info
            label="Locations"
            value={(profile.preferences?.preferredLocations || [])
              .map(loc => {
                if (
  !loc?.district ||
  loc.district.name === "ALL" ||
  loc.district.id === "ALL"
) {
  return `${loc.state}: All Districts`;
}
                return `${loc.state}: ${loc.district.name}`;
              })
              .join(" | ")
            }
          />
        </div>
      </div>
    </div>

  );
}

/* COMPONENTS */
function Info({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="row_8">
      <span className="label_8">{label}</span>
      <span className="value_8">{value}</span>
    </div>
  );
}
