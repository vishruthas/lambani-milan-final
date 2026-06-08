import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPhotoUploadUrls,
  verifyProfilePhotos,
  setDisplayPhoto
} from "../services/api";
import "./PhotoUpload.css";
import BackgroundSlider from "../components/BackgroundSlider";
import { heicTo } from "heic-to";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [photoKeys, setPhotoKeys] = useState([]);
  const [verified, setVerified] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX = 6;
  const MIN = 2;

  useEffect(() => {
    return () => {
      previews.forEach(url => {
        try { URL.revokeObjectURL(url); } catch {}
      });
    };
  }, [previews]);

  /* const addFiles = e => {
  const selected = Array.from(e.target.files || []).map(file => {

    if (!file.type) {
      const ext = file.name.split(".").pop()?.toLowerCase();

      const mimeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        heic: "image/heic",
        heif: "image/heif",
      };

      const mimeType = mimeMap[ext];

      if (mimeType) {
        return new File(
          [file],
          file.name,
          {
            type: mimeType,
            lastModified: file.lastModified,
          }
        );
      }
    }

    return file;
  });
    if (!selected.length) return;

    const allowed = selected.slice(0, MAX - files.length);
    const newPreviews = allowed.map(f => URL.createObjectURL(f));

    setFiles(prev => [...prev, ...allowed]);
    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  }; */
  

    const addFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setError(""); 
    const processedFiles = [];

    for (const file of selected) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      console.log("Processing File:", file.name, "Type:", file.type);

      const isHeic = ext === "heic" || ext === "heif";

      if (isHeic) {
        try {
          const convertedBlob = await heicTo({
            blob: file,
            type: "image/jpeg",
            quality: 0.9,
          });

          const jpegFile = new File(
            [convertedBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
            {
              type: "image/jpeg",
              lastModified: file.lastModified,
            }
          );

          processedFiles.push(jpegFile);
        } catch (err) {
          console.warn(`HEIC processing bypassed for ${file.name}:`, err?.message);

          if (err?.message?.includes("ftyp") || err?.message?.includes("readable")) {
            console.log("File structural check bypassed. Appending original file stream.");
            processedFiles.push(file);
          } else {
            console.error("Critical conversion error:", err);
            setError(`Skipped unreadable file: ${file.name}`);
          }
        }
      } else {
        // Standard extensions (JPG, JPEG, PNG, WEBP)
        processedFiles.push(file);
      }
    }
    const allowed = processedFiles.slice(0, MAX - files.length);
    const newPreviews = allowed.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...allowed]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };



/* REMOVE PHOTO */

  const removePhoto = index => {
    const url = previews[index];
    if (url) {
      try { URL.revokeObjectURL(url); } catch {}
    }

    setFiles(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });

    setPreviews(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });

    setPhotoKeys(prev => {
      if (!prev || prev.length === 0) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
     });

    setSelectedIndex(prev => {
      if (prev === null) return null;
      if (index === prev) return null;
      if (index < prev) return prev - 1;
      return prev;
    });
  };
  
  /* UPLOAD & VERIFY */

  const uploadAndVerify = async () => {
    setError("");

    if (files.length < MIN) {
      setError("Upload at least 2 photos");
      return;
    }

    try {
      setLoading(true);
      console.log("Files being uploaded:");

      files.forEach(f => {
      console.log(f.name, f.type);
    });

 const contentTypes = files.map((f) => {
  if (f.type) return f.type;

  const ext = f.name.split(".").pop()?.toLowerCase();

  const mimeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };

  return mimeMap[ext] || "application/octet-stream";
});

const res = await getPhotoUploadUrls({
  contentTypes,
  fileTypes: contentTypes,
});


      if (!res || !Array.isArray(res.urls)) {
        throw new Error("Invalid response from server when requesting upload URLs");
      }
      const { urls } = res;

      if (urls.length !== files.length) {
        throw new Error("Server returned a different number of upload URLs than files");
      }

      await Promise.all(
        urls.map(async (u, i) => {
          const resp = await fetch(u.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": files[i].type || "application/octet-stream" },
            body: files[i]
          });

          if (!resp.ok) {
            let bodyText = "";
            try {
              bodyText = await resp.text();
            } catch (readErr) {
              bodyText = resp.statusText || `status ${resp.status}`;
            }
            throw new Error(`Upload failed for file ${i + 1}: ${resp.status} ${bodyText}`);
          }
        })
      );

      const keys = urls.map(u => u.key);
      setPhotoKeys(keys);
      
      const verifyRes = await verifyProfilePhotos(keys);
      if (verifyRes && typeof verifyRes === "object") {
        if (verifyRes.error) {
          throw new Error(verifyRes.error || "Verification failed");
        }
      }

      setVerified(true);

      if (keys.length > 0) setSelectedIndex(0);
    } catch (e) {
      const message = e && e.message ? e.message : "Upload failed";
      console.error("uploadAndVerify error:", e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const continueNext = async () => {
    if (selectedIndex === null) {
      setError("Select a display photo");
      return;
    }

    const photoKey = photoKeys[selectedIndex];
    if (!photoKey) {
      setError("Invalid photo selected");
      return;
    }

    try {
      setLoading(true);
      await setDisplayPhoto(photoKey);
      navigate("/preferences");
    } catch (e) {
      setError(e.message || "Failed to set display photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page1">
        <div
          className="photo-card photo-upload-unique-1a2b3c"
          role="main"
          aria-labelledby="photo-title"
        >
          <h2 id="photo-title" className="photo-title">
            {verified ? "Select Display Photo" : "Upload Profile Photos"}
          </h2>

          <div className="photo-grid" role="list">
            {Array.from({ length: MAX }).map((_, i) => (
              <div
                key={i}
                className={`photo-box ${verified && selectedIndex === i ? "photo-selected" : ""}`}
                onClick={() => verified && previews[i] && setSelectedIndex(i)}
                role="listitem"
                tabIndex={0}
              >
                {previews[i] ? (
                  <>
                    <img src={previews[i]} className="photo-img" alt={`preview-${i}`} draggable="false" />
                    <button
                      type="button"
                      className="photo-remove"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={e => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  !verified && (
                    <button
                      type="button"
                      className="photo-plus"
                      onClick={() => inputRef.current.click()}
                      aria-label="Add photo"
                    >
                      +
                    </button>
                  )
                )}
              </div>
            ))}
          </div>

          {!verified ? (
            <div className="photo-actions">
              <button className="btn-primary two-tone" onClick={uploadAndVerify} disabled={loading}>
                {loading ? "Verifying..." : "Upload & Verify"}
              </button>
            </div>
          ) : (
            <div className="photo-actions">
              <button className="btn-primary two-tone" onClick={continueNext} disabled={loading}>
                {loading ? "Saving..." : "Continue"}
              </button>
            </div>
          )}

          {error && <p className="photo-error">{error}</p>}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={addFiles}
          />
        </div>
      </div>
    </>
  );
}