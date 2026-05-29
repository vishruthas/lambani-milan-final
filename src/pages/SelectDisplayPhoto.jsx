import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, setDisplayPhoto } from "../services/api";
import "./SelectDisplayPhoto.css";
import BackgroundSlider from "../components/BackgroundSlider"; 

export default function SelectDisplayPhoto() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPhotos() {
      try {
        const data = await getUserProfile();
        setPhotos(data.profilePhotos || []);
      } catch {
        setError("Failed to load photos");
      }
    }
    loadPhotos();
  }, []);

  const submit = async () => {
    if (!selected) {
      setError("Select a display photo");
      return;
    }

    try {
      setLoading(true);
      await setDisplayPhoto(selected);
      navigate("/preferences");
    } catch (e) {
      setError(e.message || "Failed to set display photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="select-photo-page">
        <div
          className="select-photo-card"
          role="region"
          aria-labelledby="select-photo-heading"
        >
          <div className="select-photo-header">
            <h2 id="select-photo-heading" className="select-photo-title">
              Select Display Photo
            </h2>
            <p className="select-photo-sub">
              Choose one of your uploaded photos to use as your public profile
              image.
            </p>
          </div>

          <div className="photo-grid" role="list">
              {photos.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="listitem"
                  className={`photo-item ${selected === p ? "photo-selected" : ""}`}
                  onClick={() => {
                    setSelected(p);
                    setError("");
                  }}
                  aria-pressed={selected === p}
                >
                  <img
                    src={`https://lm-profile-photos.s3.ap-south-1.amazonaws.com/${p}`}
                    alt="profile option"
                    className="photo-img"
                    draggable="false"
                  />
                </button>
              ))
            }
          </div>

          {error && (
            <p className="select-photo-error" role="alert">
              {error}
            </p>
          )}

          <div className="select-photo-actions">
            <button
              onClick={submit}
              disabled={loading}
              className="btn-primary two-tone"
              aria-disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
