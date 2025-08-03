import React, {useContext, useState} from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/image.png";
import "./Navbar.css";
import AppDataContext from "../contexts/AppDataContext";
import { handleGoogleLogout } from "../../controllers/AuthController";

const Navbar = () => {

  const { currUserId, setCurrUserId } = useContext(AppDataContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const performLogout = async () => {
    try{
      handleGoogleLogout();
      setCurrUserId(null);
    }
    catch(error){
      console.error(error);
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <div className="navbar-wrapper" style={{ backgroundColor: "#786C6C" }}>
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-between p-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
          <button
            onClick={toggleMenu}
            className="text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-20"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      {/* Desktop Logo */}
      <div className="hidden md:block">
        <Link to="/">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className={`navbar-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
        <ul className="navbar-buttons">
          <li>
            <Link to="/home" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/upload-files" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Upload Files
            </Link>
          </li>
          <li>
            <Link to="/run-data" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Run Data
            </Link>
          </li>
          <li>
            <Link to="/drivers" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Drivers
            </Link>
          </li>
          <li>
            <Link to="/issues" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Issues
            </Link>
          </li>
          <li>
            <Link to="/my-account" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              My Account
            </Link>
          </li>
        </ul>
        {currUserId && 
        <div className="px-4 py-2 md:absolute md:bottom-4 md:left-0 md:right-0">
          <button
            className="w-full md:w-auto mt-2 md:mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={performLogout}
          >
            Logout
          </button>
        </div>     
        }
      </div>
    </div>
    </>
  );
};

export default Navbar;
