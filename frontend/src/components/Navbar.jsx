import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-transparent">
      <div className="text-cosmic-accent font-bold text-2xl">NebulaLens</div>
      <div className="flex gap-8 text-white/80">
        {["Home", "Models", "Visualizer", "About"].map((item) => {
          const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
          const active = pathname === path;
          return (
            <Link
              key={item}
              to={path}
              className={`${
                active
                  ? "text-cosmic-accent border-b-2 border-cosmic-accent"
                  : "hover:text-cosmic-accent"
              } pb-1`}
            >
              {item}
            </Link>
          );
        })}
      </div>
      <button className="bg-cosmic-accent text-black px-5 py-2 rounded-xl font-semibold hover:shadow-glow transition">
        Try Demo
      </button>
    </nav>
  );
}
