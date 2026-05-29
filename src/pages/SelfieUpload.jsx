import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSelfieUploadUrl, verifySelfie } from "../services/api";
import "./SelfieUpload.css";
import BackgroundSlider from "../components/BackgroundSlider";

export default function SelfieUpload() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [photoBlob, setPhotoBlob] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    const prevBodyMargin = body.style.margin;
    const prevBodyPadding = body.style.padding;

    html.style.height = "100%";
    body.style.height = "100%";
    body.style.margin = "0";
    body.style.padding = "0";

    startCamera();
    return () => {
      stopCamera();
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
      body.style.margin = prevBodyMargin;
      body.style.padding = prevBodyPadding;
    };
  }, []);

  async function startCamera() {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error(err);
      setError("Camera permission denied");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function capture() {
    if (!cameraReady) {
      setError("Camera not ready. Please wait.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob || blob.size === 0) {
        setError("Failed to capture selfie. Please try again.");
        return;
      }
      setPhotoBlob(blob);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg", 0.95);
  }

  function retake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPhotoBlob(null);
    setError("");
    setCameraReady(false);
    startCamera();
  }

  async function upload() {
    try {
      if (!photoBlob) {
        setError("No selfie captured");
        return;
      }

      setLoading(true);
      setError("");

      const { uploadUrl, selfieKey } = await getSelfieUploadUrl("image/jpeg");
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: photoBlob
      });

      if (!res.ok) throw new Error("Selfie upload failed");

      await verifySelfie(selfieKey);
      navigate("/photo-upload");
    } catch (err) {
      console.error(err);
      setError("Selfie verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="page-content"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          margin: 0,
          boxSizing: "border-box"
        }}
      >
        <div className="selfie-card1" role="main" aria-label="Selfie verification card">
          <h2 className="selfie-title">Selfie Verification</h2>

          {!preview ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="selfie-video"
            />
          ) : (
            <img src={preview} alt="preview" className="selfie-video" />
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {error && <p className="selfie-error">{error}</p>}

          {!preview ? (
            <button onClick={capture} className="btn-primary" disabled={!cameraReady}>
              Click
            </button>
          ) : (
            <div className="selfie-actions">
              <button onClick={retake} className="btn-secondary">Retake</button>
              <button onClick={upload} className="btn-primary" disabled={loading}>
                {loading ? "Uploading..." : "Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
