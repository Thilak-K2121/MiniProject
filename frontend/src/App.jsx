import { useState, useEffect } from "react"; // 1. Import hooks
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Models from "./pages/Models";
import Visualizer from "./pages/Visualizer";
import About from "./pages/About";

// This "Layout" component wraps your pages
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
  // 2. Add isMounted state
  const [isMounted, setIsMounted] = useState(false);

  // 3. Set isMounted to true shortly after the component loads
  useEffect(() => {
    // A tiny delay ensures the initial (opacity-0) state is rendered first
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100); // 100ms delay

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []); // Empty array [] means this runs only once

  return (
    <BrowserRouter>
      {/* 4. Apply Tailwind transition classes */}
      <div 
        className={`
          min-h-screen flex flex-col bg-cosmic-dark text-white
          transition-opacity duration-1000 ease-out
          ${isMounted ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Routes>
          {/* All your pages are nested inside the PageLayout */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<Home />} />
            <Route path="models" element={<Models />} />
            <Route path="visualizer" element={<Visualizer />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Home />} /> 
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}