import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo" style={{ transform: 'scale(1.5)', filter: 'brightness(0) invert(1)', marginLeft: '70px' }}>
              <img src="/assets/logo.png" alt="Scizz" className="logo-img" />
            </div>
            <p className="footer-description">
              La plateforme de coiffure à domicile qui connecte les coiffeurs 
              professionnels avec des clients exigeants en Côte d'Ivoire.
            </p>
            <div className="social-links">
              <a href="https://facebook.com/scizzci" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com/scizzci" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com/scizzci" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://linkedin.com/company/scizzci" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Navigation</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <a href="#features">Fonctionnalités</a>
              </li>
              <li>
                <a href="#how-it-works">Comment ça marche</a>
              </li>
              <li>
                <a href="#testimonials">Témoignages</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li>
                <Link to="/inscription-coiffeur">Devenir coiffeur</Link>
              </li>
              <li>
                <Link to="/telecharger">Télécharger l'app</Link>
              </li>
              <li>
                <Link to="/tarifs">Tarifs</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Légal</h3>
            <ul className="footer-links">
              <li>
                <Link to="/politique-de-confidentialite">Politique de confidentialité</Link>
              </li>
              <li>
                <Link to="/cgu">Conditions d'utilisation</Link>
              </li>
              <li>
                <Link to="/politique-cookies">Politique cookies</Link>
              </li>
              <li>
                <Link to="/rgpd">RGPD</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Newsletter</h3>
            <p className="footer-description">
              Inscrivez-vous pour recevoir les dernières actualités et offres exclusives.
            </p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Scizz. Tous droits réservés.
            </p>
            <div className="footer-bottom-links">
              <Link to="/politique-de-confidentialite">Confidentialité</Link>
              <Link to="/cgu">Conditions</Link>
              <Link to="/politique-cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
