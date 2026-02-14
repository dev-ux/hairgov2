import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CTA.scss';

const CTA = () => {
  return (
    <section className="cta section">
      <div className="container">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-text">
            <h2 className="cta-title">
              Prêt à rejoindre la <span className="text-primary">révolution</span> de la coiffure ?
            </h2>
            <p className="cta-description" style={{ color: 'white' }}>
              Que vous soyez coiffeur professionnel ou client à la recherche de services de qualité, 
              Scizz est la solution qu'il vous faut en Côte d'Ivoire. Rejoignez des milliers d'utilisateurs 
              qui ont déjà adopté la coiffure à domicile 2.0.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/inscription-coiffeur" className="cta-btn primary">
              <i className="fas fa-scissors"></i>
              <span>Devenir coiffeur partenaire</span>
            </Link>
            <a 
              href="#features" 
              className="cta-btn secondary"
            >
              <i className="fas fa-info-circle"></i>
              <span>En savoir plus</span>
            </a>
          </div>

          <div className="cta-benefits">
            <div className="benefit">
              <i className="fas fa-check-circle text-primary"></i>
              <span>Inscription gratuite</span>
            </div>
            <div className="benefit">
              <i className="fas fa-shield-alt text-primary"></i>
              <span>Transactions sécurisées</span>
            </div>
            <div className="benefit">
              <i className="fas fa-headset text-primary"></i>
              <span>Support 24/7</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cta-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="cta-phone">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="app-interface">
                  <div className="app-header">
                    <div className="app-logo">
                      <i className="fas fa-cut"></i>
                    </div>
                    <h4>HairGov</h4>
                  </div>
                  <div className="app-content">
                    <div className="booking-card">
                      <div className="booking-header">
                        <h5>Réservation confirmée</h5>
                        <i className="fas fa-check-circle text-success"></i>
                      </div>
                      <div className="booking-details">
                        <p><i className="fas fa-calendar"></i> Aujourd'hui, 14h00</p>
                        <p><i className="fas fa-user"></i> Marie Dubois</p>
                        <p><i className="fas fa-map-marker-alt"></i> 15 rue de la Paix</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="cta-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default CTA;
