// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Models from "./pages/Models";
import Visualizer from "./pages/Visualizer";
import About from "./pages/About";

// This "Layout" component wraps your pages
// to keep the Navbar and Footer on every screen.
const PageLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow">
      {/* Outlet renders the current route's component (Home, Models, etc.) */}
      <Outlet />
    </main>
    <Footer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cosmic-dark text-white">
        <Routes>
          {/* All your pages are nested inside the PageLayout */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<Home />} />
            <Route path="models" element={<Models />} />
            <Route path="visualizer" element={<Visualizer />} />
            <Route path="about" element={<About />} />
            {/* You can add a 404 page here if you like */}
            <Route path="*" element={<Home />} /> 
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}