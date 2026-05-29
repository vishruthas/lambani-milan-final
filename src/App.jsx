import { Routes, Route } from "react-router-dom";
import "./awsConfig";
import ProtectedRoute from "./pages/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import AllProfiles from "./pages/AllProfiles";
import ProfileCreate from "./pages/ProfileCreate";
import SelfieUpload from "./pages/SelfieUpload";
import PhotoUpload from "./pages/PhotoUpload";
import Preferences from "./pages/Preferences";
import ProfileView from "./pages/ProfileView";
import Interests from "./pages/Interests";
import Messages from "./pages/Messages";
import MyProfile from "./pages/MyProfile";
import ManagePhotos from "./pages/ManagePhotos";
import EditBasicInfo from "./pages/EditBasicInfo";
import EditPreferences from "./pages/EditPreferences";
import { WebSocketProvider } from "./context/WebSocketContext";
import AccountSettings from "./pages/AccountSettings";
import PrivacySecurity from "./pages/PrivacySecurity";
import OnboardingGuard from "./pages/OnboardingGuard";
import AppLayout from "./layouts/AppLayout";
import OnboardingLayout from "./layouts/OnBoardingLayout";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <WebSocketProvider>
    <Routes>
      <Route path="/" element={<LandingPage />}>
      
      </Route>
      <Route path="/landing" element={<Landing />} />

      <Route element={<OnboardingLayout />}>
        <Route path="/profile-create" element={<ProfileCreate />} />
        <Route path="/selfie-upload" element={<SelfieUpload />} />
        <Route path="/photo-upload" element={<PhotoUpload />} />
        <Route path="/preferences" element={<Preferences />} />
      </Route>

      {/* header + footer */}
      <Route 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout />
            </OnboardingGuard>
          </ProtectedRoute>
                              
            }>
        <Route path="/home" element={<Home />} />
        <Route path="/profiles/:type" element={<AllProfiles />} />
        <Route path="/profile/:userId" element={<ProfileView />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Chat />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/manage-photos" element={<ManagePhotos />} />
        <Route path="/edit-basic" element={<EditBasicInfo />} />
        <Route path="/edit-preferences" element={<EditPreferences />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/privacy-settings" element={<PrivacySecurity />} />

      </Route>
     
    </Routes>
    </WebSocketProvider>
  );
}
