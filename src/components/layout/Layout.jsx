import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-arcane-dark flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 lg:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
