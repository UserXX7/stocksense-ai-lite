import { Bell, Search, ChevronDown } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <div className="top-search">
        <Search size={18} />
        <input placeholder="Search for stocks, ETFs, topics..." />
      </div>

      <div className="navbar-right">
        <div className="notification">
          <Bell size={20} />
          <span></span>
        </div>

        <div className="user-menu">
          <div className="avatar">A</div>
          <span>Alif</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;