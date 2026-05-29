import { useLocation } from "react-router-dom";
import logo from "../assets/logo2.webp";
import "./Header.css";

const STEPS = [
  { id: 1, path: "/profile-create" },
  { id: 2, path: "/selfie-upload" },
  { id: 3, path: "/photo-upload" },
  { id: 4, path: "/preferences" }
];

const ONBOARDING_PATHS = STEPS.map(s => s.path);


export default function Header({ completedStep = 0 }) {
  const location = useLocation();
  const showSteps = ONBOARDING_PATHS.includes(location.pathname);
  const currentStep =
  STEPS.find((s) => s.path === location.pathname)?.id || 0;

  return (
    <>
      <header className="app-header">
        <div className="logo-wrap">
          <img src={logo} alt="Lambani Milan" className="logo" />
          <span className="logo-text">Lambani Milan</span>
        </div>

        {showSteps && (
          <div className="steps-wrapper">
            {STEPS.map((step, index) => {
              let state = "upcoming";
              if (step.id < currentStep) state = "completed";   
              if (step.id === currentStep) state = "active";    
              return (
                <div key={step.id} className="step-group">
                  <div className={`step ${state}`}>{step.id}</div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`line ${
                        step.id < currentStep ? "line-completed" : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>
      <div style={{ height: "52px" }} />
    </>
  );
}
