import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [globalSearch, setGlobalSearch] = useState("");
  const navigate = useNavigate();

  function handleGlobalSearch(e) {
    e.preventDefault();

    const cleanQuery = globalSearch.trim();

    if (cleanQuery === "") {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
    setGlobalSearch("");
  }

  return (
    <header className="navbar">
      <form className="top-search" onSubmit={handleGlobalSearch}>
        <Search size={18} />
        <input
          placeholder="Search for stocks, ETFs, topics..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </form>

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