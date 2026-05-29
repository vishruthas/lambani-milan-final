import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function OnboardingLayout() {
  const location = useLocation();

  const STEP_MAP = {
    "/profile-create": 1,
    "/preferences": 2,
    "/photo-upload": 3,
    "/select-display-photo": 4
  };

  const completedStep = STEP_MAP[location.pathname] || 1;

  return (
    <>
      <Header showSteps completedStep={completedStep} />
      <div style={{ paddingTop: 52 }}>
        <Outlet />
      </div>
    </>
  );
}
