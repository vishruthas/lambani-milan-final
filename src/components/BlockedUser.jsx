import { useEffect, useState } from "react";
import { getBlockedUsers, unblockUser,  } from "../services/api";
import "./BlockedUser.css";

const S3_BUCKET = "https://lm-profile-photos.s3.ap-south-1.amazonaws.com/";
const FALLBACK = "/default-user.png";

function photoUrl(photo) {
  if (!photo) return FALLBACK;
  if (photo.startsWith("http")) return photo;
  return S3_BUCKET + photo;
}


const BlockIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8b0000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="5" y1="19" x2="19" y2="5" />
  </svg>
);

export default function BlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  /* FETCH BLOCKED USERS */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await getBlockedUsers();
      console.log("BLOCKED USERS:", data);

      setUsers(data?.results || []);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  /* UNBLOCK USER 
  const handleUnblock = async (user) => {
  try {
    await unblockUser(user.userId);
    setUsers(prev => prev.filter(u => u.userId !== user.userId));
   
    setToast(`${user.name || "User"} unblocked`);

    setTimeout(() => {
      setToast(null);
    }, 1000);

  } catch {
    setToast("Failed to unblock");

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }
}; */
const handleUnblock = (user) => {
  setConfirmUser(user);
};

const confirmUnblockUser = async () => {
  if (!confirmUser) return;

  try {
    await unblockUser(confirmUser.userId);

    setUsers(prev =>
      prev.filter(u => u.userId !== confirmUser.userId)
    );

  } catch {
    setToast("Failed to unblock");

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  setConfirmUser(null);
};

  

  return (

    <>
    {confirmUser && (
  <div className="bu-popup-overlay">
    <div className="bu-popup">

      <h3>Unblock User</h3>

      <p>
        Are you sure you want to unblock{" "}
        <strong>{confirmUser.name || "this user"}</strong>?
      </p>

      <div className="bu-popup-actions">

        <button
          className="bu-popup-cancel"
          onClick={() => setConfirmUser(null)}
        >
          Cancel
        </button>

        <button
          className="bu-popup-confirm"
          onClick={confirmUnblockUser}
        >
          Unblock
        </button>

      </div>
    </div>
  </div>
)}
  <div className="bu-wrapper">

    {toast && <div className="toast-popup">{toast}</div>}

    {/* TITLE */}
    
    <div className="bu-title">
      <div className="bu-title-row">
      <BlockIcon />
      <h3>Blocked Users</h3>
      </div>
      <p className="bu-desc">
        Manage users you have blocked. Blocked users cannot view your profile or contact you.
      </p>
    </div>

    <div className="bu-divider" />

    {/* CARD */}
    <div className="bu-card">
      <h4 className="bu-card-title">
  Users you have blocked
      </h4>

<p className="bu-card-sub">
  Unblock users to allow them to view your profile and contact you again.
</p>

      {loading && <p className="bu-msg">Loading...</p>}

      {!loading && users.length === 0 && (
        <div className="bu-empty-box">
          <p>No blocked users</p>
          <span>You haven’t blocked anyone</span>
        </div>
      )}

      {!loading &&
        users.map((user) => (
          <div key={user.blockedUserId} className="bu-item">

            <div className="bu-left">
              <img
                src={photoUrl(user.displayPhoto)}
                alt="profile"
                className="bu-img"
                onError={(e) => (e.target.src = FALLBACK)}
              />
              <div className="bu-name">{user.name || "User"}</div>
            </div>

            <button
              className="bu-btn"
              onClick={() => handleUnblock(user)}
            >
              Unblock
            </button>

          </div>
        ))}

      {msg && <p className="bu-msg">{msg}</p>}
    </div>
  </div>
  </>
);
}