import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/api";

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const res = await getMyProfile();
        const profile = res.profile;

        console.log("ONBOARDING CHECK:", profile);

        if (!profile) {
          navigate("/profile-create");
          return;
        }

        if (!profile.verificationStatus) {
          navigate("/selfie-upload");
          return;
        }

        if (!profile.photos || profile.photos.length === 0) {
          navigate("/photo-upload");
          return;
        }

        if (
          !profile.preferences ||
          !profile.preferences.preferredKulGothra
        ) {
          navigate("/preferences");
          return;
        }

        setLoading(false); 

      } catch (err) {
        console.error(err);
        navigate("/profile-create");
      }
    }

    check();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return children;
}
