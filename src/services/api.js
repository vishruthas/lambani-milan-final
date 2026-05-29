const API_BASE_URL =
  "https://32iw8tqmtb.execute-api.ap-south-1.amazonaws.com/stage1";

export function getAccessToken() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function apiFetch(url, options = {}) {

  const token = localStorage.getItem("access_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    }
  });


  if (res.status === 401) {

    console.log("Token expired → logout");

    // clear tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");

    // close WS
    window.dispatchEvent(new Event("logout"));

    // redirect
    window.location.href = "/";
    throw new Error("Unauthorized");

  }

  return res;
}


/* CHECK PROFILE EXISTENCE */
export async function checkUserExists() {
  const res = await apiFetch(`${API_BASE_URL}/user/exist`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to check user");
  }

  return res.json();
}

/* CREATE PROFILE */
export async function createUserProfile(payload) {
  const res = await apiFetch(`${API_BASE_URL}/user/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Profile creation failed");
  }

  return res.json();
}

/* HOME */
export async function getHomeData() {
  const res = await apiFetch(`${API_BASE_URL}/home`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load home");
  }

  return res.json();
}



/* GET SELFIE UPLOAD URL */
export async function getSelfieUploadUrl(contentType) {
  const res = await apiFetch(`${API_BASE_URL}/user/selfie/upload-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contentType })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get selfie upload URL");
  }

  return res.json();
}

/* VERIFY SELFIE */
export async function verifySelfie(selfieKey) {
  const res = await apiFetch(`${API_BASE_URL}/user/selfie/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ selfieKey })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Selfie verification failed");
  }

  return res.json();
}



/* Get presigned URLs */
export async function getPhotoUploadUrls(payload) {
  
  const res = await apiFetch(`${API_BASE_URL}/user/photos/upload-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get photo upload URLs");
  }

  return res.json();
}

/* Verify photos ONLY */
export async function verifyProfilePhotos(photoKeys) {
  if (!photoKeys || photoKeys.length < 2) {
    throw new Error("At least 2 photos required");
  }

  const res = await apiFetch(`${API_BASE_URL}/user/photos/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ photoKeys })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Photo verification failed");
  }

  return res.json();
}

/* SET DISPLAY PHOTO */
export async function setDisplayPhoto(photoKey) {
  if (!photoKey) {
    throw new Error("photoKey is required");
  }

  const res = await apiFetch(`${API_BASE_URL}/user/display-picture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      photoKey: photoKey })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to set display photo");
  }

  return res.json();
}

/* PREFERENCES */
export async function savePreferences(data) {
  const res = await apiFetch(`${API_BASE_URL}/user/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save preferences");
  }

  return res.json();
}


/* GET OTHER USER PROFILE */
export async function getUserProfile(userId) {
  const res = await apiFetch(`${API_BASE_URL}/user/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load profile");
  return data;
}

/* SEND INTEREST  */


  export async function sendInterest(toUserId, action = "send") {
  const res = await apiFetch(`${API_BASE_URL}/user/requests/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      toUserId,
      action 
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send interest");
  return data;
}
/* GET INTERESTS */

export async function getUserInterests({ type, status, markAsRead } = {}) {
  const params = new URLSearchParams();

  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (markAsRead) params.append("markAsRead", "true");

  const res = await apiFetch(
    `${API_BASE_URL}/user/interests?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load interests");
  return data;
}

/* RESPOND TO INTEREST */

export async function respondToInterest({ interestId, action }) {
  const res = await apiFetch(
    `${API_BASE_URL}/user/interests/respond`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ interestId, action })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to respond");
  return data;
}

/* CONVERSATIONS LIST */
export async function getConversations() {
  const res = await apiFetch(
    `${API_BASE_URL}/user/conversations`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load conversations");
  return data;
}

/* GET MESSAGES */
export async function getMessages(conversationId) {
  const res = await apiFetch(
    `${API_BASE_URL}/user/conversations/${conversationId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load messages");
  return data;
}

/* SEND MESSAGE */
export async function sendMessage({ conversationId, text }) {
  const res = await apiFetch(
    `${API_BASE_URL}/user/messages/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ conversationId, text })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
}


/* Unread Badge */

export async function getUnreadCounts() {
  const res = await getConversations();

  const conversations = res.results || [];
  return conversations.filter(c =>
  (c.lastMessageStatus?.unreadCount || 0) > 0).length; 
} 

  


/* My Profile*/

export async function getMyProfile() {
  const res = await apiFetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to old user data");
  }

  return res.json();
}

/* EDIT PROFILE */

export async function updateUserProfile(data) {
  const res = await apiFetch(`${API_BASE_URL}/user/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Update Failed");
  }

  return res.json();
}

/* DELETE PHOTOS */

export async function deleteProfilePhoto(photoKey) {

  const res = await apiFetch(`${API_BASE_URL}/profile/photos`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ photos: [photoKey] })
      
  });

   if (!res.ok) {
    throw new Error("Delete failed");
  }

  return res.json(); 

  /* if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
    throw new Error(`Delete failed: ${res.status} ${res.statusText} - ${errorData.message || 'Unknown server error'}`);
  }
  return res.json(); */
}

/* DEACTIVATE ACCOUNT */

export async function deactivateAccount(password) {
  const res = await apiFetch(
    `${API_BASE_URL}/profile/deactivate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ password })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to deactivate account");
  return data;
}

/* REACTIVATE ACCOUNT */

export async function reactivateAccount() {
  const res = await apiFetch(
    `${API_BASE_URL}/profile/reactivate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reactivate account");
  }

  return data;

} 

/* DELETE ACCOUNT */
export async function deleteAccount(payload) {
  const res = await apiFetch(
    `${API_BASE_URL}/profile/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to delete account");
  }

  return data;
}
 /* PROFILE VISIBILITY */

export async function updateProfileVisibility(profileVisibility) {
  const res = await apiFetch(
    `${API_BASE_URL}/user/settings/profile-visibility`,
    {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ profileVisibility })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update profile visibility");
  }

  return data;
}

/* BLOCK USERS */

export async function blockUser(targetUserId) {
  const res = await apiFetch(`${API_BASE_URL}/user/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify({
      targetUserId,
      action: "block"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to block user");
  }

  return data;
}

/* UNBLOCK USER */

export async function unblockUser(targetUserId) {
  const res = await apiFetch(`${API_BASE_URL}/user/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify({
      targetUserId,
      action: "unblock"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to unblock user");
  }

  return data;
}

/* GET BLOCKED USERS */

export async function getBlockedUsers() {
  const res = await apiFetch(`${API_BASE_URL}/user/blocked`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch blocked user");
  }

  return data;
}

/* REPORT USER */

export async function reportUser({ reportedUserId, reason }) {
  const res = await apiFetch(
    `${API_BASE_URL}/user/report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({
        reportedUserId,
        reason
       })
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to report user");
  }
  return data;
}