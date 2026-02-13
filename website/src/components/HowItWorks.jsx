import React from 'react';
import { motion } from 'framer-motion';
import './HowItWorks.scss';

const HowItWorks = ({ id }) => {
  const steps = [
    {
      number: '1',
      title: 'Téléchargez l\'application',
      description: 'Installez Scizz sur votre smartphone depuis l\'App Store ou Google Play.',
      icon: 'fas fa-download'
    },
    {
      number: '2',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en quelques minutes et complétez votre profil.',
      icon: 'fas fa-user-plus'
    },
    {
      number: '3',
      title: 'Choisissez votre coiffeur',
      description: 'Parcourez les profils des coiffeurs disponibles près de chez vous.',
      icon: 'fas fa-search'
    },
    {
      number: '4',
      title: 'Réservez votre créneau',
      description: 'Sélectionnez la date, l\'heure et le lieu qui vous conviennent.',
      icon: 'fas fa-calendar-alt'
    }
  ];

  const clientSteps = [
    {
      number: '1',
      title: 'Consultez les disponibilités',
      description: 'Vérifiez les créneaux disponibles des coiffeurs près de chez vous.',
      icon: 'fas fa-clock'
    },
    {
      number: '2',
      title: 'Réservez en ligne',
      description: 'Choisissez votre service et réservez instantanément.',
      icon: 'fas fa-check-circle'
    },
    {
      number: '3',
      title: 'Recevez votre coiffeur',
      description: 'Le coiffeur se déplace chez vous à l\'heure convenue.',
      icon: 'fas fa-home'
    },
    {
      number: '4',
      title: 'Notez le service',
      description: 'Partagez votre expérience pour aider la communauté.',
      icon: 'fas fa-star'
    }
  ];

  return (
    <section className="how-it-works section" id={id}>
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Comment ça <span className="text-primary">marche</span> ?
          </h2>
          <p className="section-subtitle">
            Une plateforme simple pour connecter coiffeurs professionnels et clients en Côte d'Ivoire
          </p>
        </motion.div>

        <div className="how-it-works-content">
          <div className="steps-section">
            <h3 className="steps-title">
              <i className="fas fa-scissors text-primary"></i>
              Pour les coiffeurs
            </h3>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="step-card"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">
                    <i className={step.icon}></i>
                  </div>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="steps-section">
            <h3 className="steps-title">
              <i className="fas fa-user text-secondary"></i>
              Pour les clients
            </h3>
            <div className="steps-grid">
              {clientSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="step-card client"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">
                    <i className={step.icon}></i>
                  </div>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div 
          className="app-download"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="download-content">
            <h3 className="download-title">
              Prêt à commencer ?<br />
              <span className="text-primary">Téléchargez l'application</span>
            </h3>
            <p className="download-description">
              Disponible sur iOS et Android, rejoignez des milliers d'utilisateurs 
              qui utilisent déjà HairGov pour leurs besoins en coiffure.
            </p>
            <div className="download-buttons">
              <a href="#" className="download-btn app-store">
                <i className="fab fa-apple"></i>
                <div className="btn-text">
                  <span className="btn-small">Disponible sur</span>
                  <span className="btn-large">App Store</span>
                </div>
              </a>
              <a href="#" className="download-btn google-play">
                <i className="fab fa-google-play"></i>
                <div className="btn-text">
                  <span className="btn-small">Disponible sur</span>
                  <span className="btn-large">Google Play</span>
                </div>
              </a>
            </div>
          </div>
          <div className="download-visual">
            <div className="phone-mockup-small">
              <div className="phone-frame-small">
                <div className="phone-screen-small">
                  <img 
                    src="/images/cp1.png" 
                    alt="Application HairGov" 
                    className="screenshot-small"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
