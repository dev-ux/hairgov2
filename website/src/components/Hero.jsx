import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Hero.scss';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              La coiffure à domicile en<br />
              <span className="text-primary">Côte d'Ivoire</span>
            </h1>
            <p className="hero-description">
              Scizz connecte les coiffeurs professionnels ivoiriens avec des clients 
              qui cherchent des services de qualité à domicile. 
              Réservez en quelques clics, à Abidjan, Bouaké, Yamoussoukro et partout ailleurs.
            </p>
            <div className="hero-buttons">
              <Link to="/inscription-coiffeur" className="btn btn-primary">
                <i className="fas fa-scissors"></i>
                Devenir coiffeur partenaire
              </Link>
              <a 
                href="#how-it-works" 
                className="btn btn-outline"
              >
                <i className="fas fa-play-circle"></i>
                Comment ça marche
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">150+</span>
                <span className="stat-label">Coiffeurs partenaires</span>
              </div>
              <div className="stat">
                <span className="stat-number">3k+</span>
                <span className="stat-label">Clients satisfaits</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Note moyenne</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen">
                  <img 
                    src="/images/app-screenshot-1.jpg" 
                    alt="Application Scizz" 
                    className="screenshot"
                  />
                </div>
              </div>
            </div>
            <div className="floating-elements">
              <div className="floating-card card-1">
                <i className="fas fa-cut"></i>
                <span>Coupe professionnelle</span>
              </div>
              <div className="floating-card card-2">
                <i className="fas fa-home"></i>
                <span>Service à domicile</span>
              </div>
              <div className="floating-card card-3">
                <i className="fas fa-star"></i>
                <span>Coiffeurs vérifiés</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
