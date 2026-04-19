import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/image.png";
import "./Navbar.css";
import AppDataContext from "../contexts/AppDataContext";
import { handleGoogleLogout } from "../../controllers/AuthController";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { currUserId, setCurrUserId } = useContext(AppDataContext);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const performLogout = async () => {
    try {
      await handleGoogleLogout();
      setCurrUserId(null);
      setIsMenuOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { to: "/home", label: "Home" },
    { to: "/upload-files", label: "Upload Files" },
    { to: "/run-data", label: "Run Data" },
    { to: "/drivers", label: "Drivers" },
    { to: "/issues", label: "Issues" },
    { to: "/feedback", label: "Feedback" },
    { to: "/my-account", label: "My Account" },
  ];

  return (
    <div className="navbar-wrapper">
      <button
        type="button"
        className={`hamburger-button ${isMenuOpen ? "open" : ""}`}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((previous) => !previous)}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      {isMenuOpen && (
        <button
          type="button"
          className="navbar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className={`navbar-panel ${isMenuOpen ? "open" : ""}`}>
        <div className="navbar-panel-header">
          <Link to="/" className="navbar-logo-link" onClick={() => setIsMenuOpen(false)}>
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
        </div>

        <ul className="navbar-buttons">
          {navItems.map((navItem) => (
            <li key={navItem.to}>
              <Link to={navItem.to} className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                {navItem.label}
              </Link>
            </li>
          ))}
        </ul>

        {currUserId && (
          <div className="navbar-actions">
            <button type="button" className="navbar-logout" onClick={performLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
