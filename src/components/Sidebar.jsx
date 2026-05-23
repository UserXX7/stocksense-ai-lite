import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Star,
  Bell,
  Newspaper,
  Brain,
  User,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";

function Sidebar() {
  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { path: "/search", label: "Search", icon: <Search /> },
    { path: "/watchlist", label: "Watchlist", icon: <Star /> },
    { path: "/alerts", label: "Alerts", icon: <Bell /> },
    { path: "/news", label: "News", icon: <Newspaper /> },
    { path: "/ai-insights", label: "AI Insights", icon: <Brain /> },
    { path: "/profile", label: "Profile", icon: <User /> },
    { path: "/settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <TrendingUp size={24} />
        </div>
        <div>
          <h2>StockSense</h2>
          <span>AI Lite</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} className="nav-link">
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/" className="logout-link">
        <LogOut size={18} />
        <span>Log out</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;