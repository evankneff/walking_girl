import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`side-menu-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="side-menu-nav">
          <Link to="/" className="side-menu-link" onClick={onClose}>
            Dashboard
          </Link>
          <Link to="/entry" className="side-menu-link" onClick={onClose}>
            Enter Time
          </Link>
          <Link to="/history" className="side-menu-link" onClick={onClose}>
            History
          </Link>
        </nav>
      </div>
    </>
  );
};

export default SideMenu;
