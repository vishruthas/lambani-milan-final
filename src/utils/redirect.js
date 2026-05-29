import { checkUserExists } from "../services/api";


export async function redirectUser(navigate) {
  const result = await checkUserExists();

  // If profile not created at all
  if (!result.profileExists) {
    navigate("/profile-create", { replace: true });
    return;
  }

  // Resume onboarding based on backend step
  switch (result.profileStep) {
    case 1:
      navigate("/selfie-upload", { replace: true });
      break;
    case 2:
      navigate("/photo-upload", { replace: true });
      break;
    case 3:
      navigate("/preferences", { replace: true });
      break;
    case 4:
      navigate("/home", { replace: true });
      break;
    default:
      navigate("/profile-create", { replace: true });
  }
}
