import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function AppLayout() {
  return (
    <>
      {/* <Header /> */}

      <div style={{ paddingBottom: 70 }}>
        <Outlet />
      </div>

      <Footer />
    </>
  );
}
