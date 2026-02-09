import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <img src="/assets/logo.png" alt="Scizz" className="logo-img" />
        </Link>

        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                Accueil
              </Link>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link" onClick={closeMobileMenu}>
                Fonctionnalités
              </a>
            </li>
            <li className="nav-item">
              <a href="#how-it-works" className="nav-link" onClick={closeMobileMenu}>
                Comment ça marche
              </a>
            </li>
            <li className="nav-item">
              <a href="#testimonials" className="nav-link" onClick={closeMobileMenu}>
                Témoignages
              </a>
            </li>
            <li className="nav-item">
              <Link to="/inscription-coiffeur" className="nav-link nav-link-cta" onClick={closeMobileMenu}>
                Devenir coiffeur
              </Link>
            </li>
          </ul>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
