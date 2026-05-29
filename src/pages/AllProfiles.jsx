import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getHomeData,
  sendInterest,
  respondToInterest,
  getUserInterests
} from "../services/api";
import logo from "../assets/logo2.webp";
import "./AllProfiles.css";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";
const FALLBACK_IMAGE = "/default-user.png";



function normalizePhoto(src) {
  if (!src) return FALLBACK_IMAGE;
  if (typeof src !== "string") return FALLBACK_IMAGE;
  if (src.startsWith("http")) return src;
  return S3_BUCKET + src;
}

export default function AllProfiles() {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [interestsMap, setInterestsMap] = useState(new Map());
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadProfiles() {
      setLoadingProfiles(true);
      try {
        const res = await getHomeData();
        if (!mounted) return;
        if (type === "recent") setProfiles(res.recentlyJoined || []);
        else setProfiles(res.matches || []);
      } catch (err) {
        console.error("Failed to load profiles", err);
        if (mounted) setProfiles([]);
      } finally {
        if (mounted) setLoadingProfiles(false);
      }
    }
    loadProfiles();
    return () => {
      mounted = false;
    };
  }, [type]);

  const refreshInterests = useCallback(async () => {
    setLoadingInterests(true);
    try {
      const res = await getUserInterests();
      const map = new Map();
      (res.results || []).forEach((i) => {
        if (i.userId) map.set(i.userId, i);
      });
      setInterestsMap(map);
    } catch (err) {
      console.error("Failed to load interests", err);
      setInterestsMap(new Map());
    } finally {
      setLoadingInterests(false);
    }
  }, []);

  useEffect(() => {
    refreshInterests();
  }, [refreshInterests, type]);

  
  

  return (
    <div className="allprofiles-container">
      <div className="headerall">
                
        <div className="header-centerall">
          <img src={logo} alt="logo" className="logo" />
          <div className="title">Lambani Milan</div>
        </div>
      </div>


      <div className="allprofiles-toggle-wrapper">
        <label className="switch" aria-label="Toggle Recently / Matches">
          <input
            type="checkbox"
            checked={type === "matches"}
            onChange={() =>
              navigate(type === "matches" ? "/profiles/recent" : "/profiles/matches")
            }
          />
          <span className="slider">
            <span className="knob1" />
            <div className="labels1">
              <span className="label-left1">Recently Joined</span>
              <span className="label-right1">Matches Found</span>
            </div>
          </span>
        </label>
      </div>

      <div className="allprofiles-content">
        {loadingProfiles ? (
          <div className="center-note">Loading profiles…</div>
        ) : profiles.length === 0 ? (
          <div className="center-note">No profiles found.</div>
        ) : (
          <div className="allprofiles-card-row">
            {profiles.map((profile) => (
              <AllProfileCard
                key={profile.userId}
                user={profile}
                interestData={interestsMap.get(profile.userId) || null}
                interestsLoading={loadingInterests}
                refreshInterests={refreshInterests}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const AllProfileCard = React.memo(function AllProfileCard({
  user,
  interestData,
  interestsLoading,
  refreshInterests
}) {
  const navigate = useNavigate();
  

  const photos = useMemo(() => {
    const list = [];

    if (user?.displayPhoto) {
      const n = normalizePhoto(user.displayPhoto);
      if (n) list.push(n);
    }

    const candidates = Array.isArray(user.profilePhotos) && user.profilePhotos.length
      ? user.profilePhotos
      : Array.isArray(user.photos) && user.photos.length
      ? user.photos
      : Array.isArray(user.additionalPhotos) && user.additionalPhotos.length
      ? user.additionalPhotos
      : [];

    if (Array.isArray(candidates)) {
      candidates.forEach((p) => {
        const n = normalizePhoto(p);
        if (n && !list.includes(n)) list.push(n);
      });
    }

    if (!list.length) {
      if (user?.displayPhoto) list.push(normalizePhoto(user.displayPhoto));
      else list.push(FALLBACK_IMAGE);
    }

    return list;
  }, [user.displayPhoto, user.profilePhotos, user.photos, user.additionalPhotos]);

  const [index, setIndex] = useState(0);
  const [interestStatus, setInterestStatus] = useState(interestData?.status?.toLowerCase() || null);
  const [interestDirection, setInterestDirection] = useState(interestData?.direction || null);
  const [interestId, setInterestId] = useState(interestData?.interestId || null);
  const [conversationId, setConversationId] = useState(interestData?.conversationId || null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setInterestStatus(interestData?.status?.toLowerCase() || null);
    setInterestDirection(interestData?.direction || null);
    setInterestId(interestData?.interestId || null);
    setConversationId(interestData?.conversationId || null);
  }, [interestData]);

  useEffect(() => {
    setIndex(0);
  }, [user.userId]);

  useEffect(() => {
    setIndex((i) => {
      if (!photos.length) return 0;
      return Math.min(i, photos.length - 1);
    });
  }, [photos.length]);

  function prevPhoto(e) {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function nextPhoto(e) {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setIndex((i) => (i + 1) % photos.length);
  }

  async function handleSendInterest(e) {
    e.stopPropagation();
    if (processing) return;
    try {
      setProcessing(true);
      await sendInterest(user.userId);
      await refreshInterests();
    } catch (err) {
      console.error("Send interest failed", err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleRespond(action, e) {
    e.stopPropagation();
    if (processing) return;
    try {
      setProcessing(true);
      await respondToInterest({ interestId, action });
      await refreshInterests();
    } catch (err) {
      console.error("Respond failed", err);
    } finally {
      setProcessing(false);
    }
  }

  /* UNSEND INTEREST */
  
  async function handleUnsendInterest() {
    try {
      setProcessing(true);
  
      await sendInterest(user.userId, "unsend");  
  
      setInterestStatus(null);
      setInterestDirection(null);
      setInterestId(null);
      setConversationId(null);
  
    } catch (err) {
      alert(err.message || "Failed to unsend interest");
    } finally {
      setProcessing(false);
    }
  }

  /* function handleSendMessage(e) {
    e.stopPropagation();
    if (!conversationId) {
      alert("Conversation not ready yet");
      return;
    }
    navigate(`/messages/${conversationId}`);
  } */

    async function handleSendMessage(e) {
  e.stopPropagation();

  let convId = conversationId;

  // reload interests if conversationId not yet available
  if (!convId) {
    try {
      const res = await getUserInterests();

      const updatedItem = (res.results || []).find(
        (i) => i.userId === user.userId
      );

      convId = updatedItem?.conversationId || null;
      if (convId) {
        setConversationId(convId);
      }

    } catch (err) {
      console.log("Reload failed", err);
    }
  }

  if (!convId) {
    alert("Conversation not ready yet");
    return;
  }

  navigate(`/messages/${convId}`, {
    state: {
      user: {
        userId: user.userId,
        name: user.name || "User",
        photo: user.displayPhoto || ""
      }
    }
  });
}

  function openProfile() {
    navigate(`/profile/${user.userId}`);
  } 

 
 
  const currentRaw = photos.length ? photos[index] : null;
  const currentPhotoSrc = currentRaw || FALLBACK_IMAGE;

  function handleImgError(e) {
    const img = e.currentTarget;
    if (!img) return;
    if (img.src && img.src.includes(FALLBACK_IMAGE)) return;
    img.src = FALLBACK_IMAGE;
  }

  return (
    <div
      className="allprofile-card1"
      onClick={openProfile}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openProfile();
      }}
      role="button"
      aria-label={`Open profile for ${user.name || "user"}`}
    >
      <div className="carousel-wrapper1" >
        <img
          loading="lazy"
          src={currentPhotoSrc}
          className="carousel-image1 "
          alt={user.name ? `${user.name} profile photo` : "User profile photo"}
          onError={handleImgError}
        />

        {/* <div className="photo-count1" aria-live="polite" aria-atomic="true">
          {photos.length ? `${index + 1} / ${photos.length}` : "0 / 0"}
        </div> */}

        {/* {photos.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-arrow1 left"
              onClick={prevPhoto}
              aria-label="Previous photo"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <button
              type="button"
              className="carousel-arrow1 right"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )} */}
      </div>

      <div className="allprofile-name">{user.name}
</div>
      <small className="allprofile-detail">
        {user.age ? `${user.age} yrs` : ""}
        {user.age && user.location ? " • " : ""}
        {user.location || "—"}
      </small>
      

      <div className="allprofile-actions" onClick={(e) => e.stopPropagation()}>
        {interestsLoading ? (
          <div className="loading-note">Loading…</div>
        ) : (
          <>
            {!interestStatus && (
              <button type="button" className="btn-primary" disabled={processing} onClick={handleSendInterest}>
                Send Interest
              </button>
            )}

            {interestStatus === "pending" && interestDirection === "sent" && (
              <button type="button" className="btn-unsend" disabled={processing}
            onClick={handleUnsendInterest}>
                Unsend Interest
              </button>
            )}

            {interestStatus === "pending" && interestDirection === "received" && (
              <>
                <button type="button" className="btn-accept" disabled={processing} onClick={(e) => handleRespond("ACCEPT", e)}>
                  Accept
                </button>

                <button type="button" className="btn-reject" disabled={processing} onClick={(e) => handleRespond("REJECT", e)}>
                  Decline
                </button>
              </>
            )}

            {interestStatus === "accepted" && (
              <button type="button" className="btn-message" onClick={handleSendMessage}>
                Send Message
              </button>
            )}

            {interestStatus === "rejected" && interestDirection === "sent" && (
              <div className="status-declined">Interest Declined</div>
            )}

            {interestStatus === "rejected" && interestDirection === "received" && (
              <div className="status-declined">You Declined the Interest</div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

/* function getCity(location) {
  if (!location) return "";
  const trimmed = String(location).trim();
  if (!trimmed) return "";
  const parts = trimmed.split(",");
  return parts[0].trim();
} */