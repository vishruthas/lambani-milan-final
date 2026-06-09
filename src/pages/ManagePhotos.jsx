import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getMyProfile,
  getPhotoUploadUrls,
  updateUserProfile,
  setDisplayPhoto,
  deleteProfilePhoto
} from "../services/api";
import "./ManagePhotos.css";
import logo from "../assets/logo2.webp";
import { heicTo } from "heic-to";

export default function ManagePhotos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");

  const [photos, setPhotos] = useState([]);
  const [photoKeys, setPhotoKeys] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    loadPhotos();
    return () => {
    };
  }, []);

  async function loadPhotos() {
    try {
      const res = await getMyProfile();
      const profile = res.profile;

      const displayUrl = profile.displayPhoto;
      const otherUrls = profile.photos || [];

      const extractKey = (url) =>
        url.split(".amazonaws.com/")[1].split("?")[0];

      const displayKey = displayUrl ? extractKey(displayUrl) : null;
      const otherKeys = otherUrls.map(extractKey);

      const combinedKeys = [
        ...(displayKey ? [displayKey] : []),
        ...otherKeys.filter((k) => k !== displayKey),
      ];

      const combinedUrls = [
        ...(displayUrl ? [displayUrl] : []),
        ...otherUrls.filter((u) => u !== displayUrl),
      ];

      setPhotoKeys(combinedKeys);
      setPhotos(combinedUrls);

      if (mode === "display" && displayUrl) {
        setSelected(displayUrl);
      }
    } catch (err) {
      console.error("Failed to load photos", err);
    }
  }

  function extractKey(url) {
    return url.split(".amazonaws.com/")[1].split("?")[0];
  }

  /* UPLOAD SAVE  */
  async function handleSavePhotos() {
    try {
      const existingCount = photoKeys.length;
      const newCount = newFiles.length;
      const totalCount = existingCount + newCount;

      if (totalCount < 2) {
        alert("Minimum 2 photos required.");
        return;
      }

      setLoading(true);

      if (newCount === 0) {
        navigate("/profile");
        return;
      }

      const types = newFiles.map((file) => file.type);

      if (types.length === 1) {
        types.push(types[0]);
      }

      const res = await getPhotoUploadUrls({
        contentTypes: types,
        fileTypes: types,
      });

      const uploadData = res.urls;
      const newKeys = [];

      for (let i = 0; i < newFiles.length; i++) {
        await fetch(uploadData[i].uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": newFiles[i].type,
          },
          body: newFiles[i],
        });

        newKeys.push(uploadData[i].key);
      }

      const updatedList = [...photoKeys, ...newKeys];

      await updateUserProfile({
        profilePhotos: updatedList,
      });

      navigate("/profile");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  /* SET DISPLAY PHOTO*/
  async function handleSetDisplay() {
    if (!selected) return;

    try {
      setLoading(true);

      const key = extractKey(selected);
      await setDisplayPhoto(key);

      navigate("/profile");
    } catch (err) {
      console.error("Failed to set display photo", err);
      alert("Failed to set display photo");
    } finally {
      setLoading(false);
    }
  }

  /* HANDLE FILE SELECT */
    async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);
    setWarning("");
    const processedFiles = [];
    const previews = [];

    try {
      for (let file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        console.log("Processing File:", file.name, "Type:", file.type);

        const isHeic = ext === "heic" || ext === "heif" || file.type === "image/heic";

        if (isHeic) {
          try {
            const convertedBlob = await heicTo({
              blob: file,
              type: "image/jpeg",
              quality: 0.9,
            });

            console.log("HEIC CONV RESULT:", convertedBlob);

            const newFileName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
            const convertedFile = new File([convertedBlob], newFileName, {
              type: "image/jpeg",
            });

            processedFiles.push(convertedFile);
            previews.push(URL.createObjectURL(convertedFile));
          } catch (err) {
            console.warn(`HEIC processing bypassed for ${file.name}:`, err?.message);

            if (err?.message?.includes("ftyp") || err?.message?.includes("readable")) {
              console.log("File structural check bypassed. Appending original file stream.");
              processedFiles.push(file);
              previews.push(URL.createObjectURL(file));
            } else {
              console.error("Critical conversion error:", err);
              setWarning(`Skipped unreadable file: ${file.name}`);
            }
          }
        } else {
          // Standard web extensions (JPG, JPEG, PNG, WEBP)
          processedFiles.push(file);
          previews.push(URL.createObjectURL(file));
        }
      }

      setNewFiles((prev) => [...prev, ...processedFiles]);
      setPhotos((prev) => [...prev, ...previews]);
    } catch (globalErr) {
      console.error("Global file processing failed:", globalErr);
      setWarning("Failed to process one or more images.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }


  /* DELETE */


  async function handleDelete(photoUrl) {
    if (photoUrl === photos[0]) {
      setWarning("Cannot delete display photo. Change your display photo first.");
      return;
    }

    if (photoKeys.length <= 2) {
      setWarning("Cannot delete. At least 2 photos required.");
      return;
    }

    try {
      const photoKey = extractKey(photoUrl);
      console.log("Deleting photoKey:", photoKey);

      await deleteProfilePhoto(photoKey);

      setPhotos((prev) => prev.filter((p) => p !== photoUrl));
      setPhotoKeys((prev) => prev.filter((k) => k !== photoKey));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete photo");
    }
  }

  return (
    <div className="manage-photos-page">
      <div className="headermanagephoto">
                  
          <div className="header-centermanagephoto">
            <img src={logo} alt="logo" className="logo" />
                <div className="title">Lambani Milan</div>
          </div>
      </div>
      <div className="photo-header">
      
         <button className="photo-back-btn1" onClick={() => navigate("/profile")} aria-label="Go back to profile">
          &#8592;
        </button>
      
            <div className="photo-title-wrap">
      
              <h2 className="photo-heading">
                 {mode === "display"
                 ? "Select Display Photo"
                 : "Manage Photos"}
              </h2>
      
              <p className="photo-desc">
                 {mode === "display"
                 ? "Choose a photo to set as your display picture."
                 : "Upload, organize, or remove your photos."}
              </p>
      
            </div>
      
          </div>

        <div className="mp-grid">
          {[...Array(6)].map((_, index) => {
            const photo = photos[index];
            const isSelected = selected === photo;
            const boxClass = `mp-box ${photo ? "filled" : ""} ${isSelected ? "selected" : ""}`;

            return (
              <div
                key={index}
                className={boxClass}
                onClick={() => mode === "display" && photo && setSelected(photo)}
              >
                {photo ? (
                  <div className="mp-photoWrapper">
                    <img src={photo} alt="profile" className="mp-image" />

                    {mode === "manage" && (
                      <button
                        className="mp-deleteBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo);
                        }}
                        aria-label="Delete photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ) : (
                  mode === "manage" && (
                    <label className="mp-uploadBox">
                      +
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="mp-buttonRow">
          {mode === "display" && (
            <button
              disabled={!selected || loading}
              className="mp-primaryBtn"
              onClick={handleSetDisplay}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}

          {mode === "manage" && (
            <button
              disabled={loading}
              className="mp-primaryBtn"
              onClick={handleSavePhotos}
            >
              {loading ? "Uploading..." : "Save"}
            </button>
          )}

          <button
            className="mp-cancelBtn"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        </div>

        {warning && (
          <div className="mp-overlay">
            <div className="mp-popup">
              <p>{warning}</p>
              <button
                className="mp-okBtn"
                onClick={() => setWarning("")}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
   
  );
}