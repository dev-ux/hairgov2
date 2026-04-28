import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Download.scss';

const Download = () => {
  const features = [
    {
      icon: 'fas fa-mobile-alt',
      title: 'Application mobile',
      description: 'Disponible sur iOS et Android'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Rapide et fluide',
      description: 'Performance optimisée pour tous les appareils'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Sécurisée',
      description: 'Vos données sont protégées'
    },
    {
      icon: 'fas fa-sync',
      title: 'Mises à jour régulières',
      description: 'Nouvelles fonctionnalités chaque mois'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Téléchargez l\'application',
      description: 'Scannez le QR code ou cliquez sur les liens ci-dessous',
      icon: 'fas fa-download'
    },
    {
      number: '2',
      title: 'Installez et créez votre compte',
      description: 'Inscrivez-vous en quelques minutes seulement',
      icon: 'fas fa-user-plus'
    },
    {
      number: '3',
      title: 'Réservez votre service',
      description: 'Choisissez votre coiffeur et votre créneau horaire',
      icon: 'fas fa-calendar-check'
    }
  ];

  return (
    <div className="download">
      <Header />
      <main className="download-main">
        <section className="download-hero">
          <div className="container">
            <motion.div 
              className="download-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="download-title">
                Téléchargez <span className="text-primary">Scizz</span>
              </h1>
              <p className="download-subtitle">
                La coiffure à domicile en Côte d'Ivoire, directement dans votre poche
              </p>
              <div className="app-badges">
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="app-badge"
                >
                  <img src="/images/app-store-badge.png" alt="Télécharger sur App Store" />
                </a>
                <a 
                  href="https://play.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="app-badge"
                >
                  <img src="/images/google-play-badge.png" alt="Télécharger sur Google Play" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="app-preview">
          <div className="container">
            <div className="preview-content">
              <motion.div 
                className="preview-text"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="section-title">
                  L'application mobile <span className="text-primary">Scizz</span>
                </h2>
                <p className="section-subtitle">
                  Toutes les fonctionnalités de Scizz dans une application mobile conçue pour vous
                </p>
                <div className="features-list">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <div className="feature-icon">
                        <i className={feature.icon}></i>
                      </div>
                      <div className="feature-content">
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                className="preview-visual"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="phone-mockup">
                  <div className="phone-frame">
                    <div className="phone-screen">
                      <img 
                        src="/images/app-screenshot-2.jpg" 
                        alt="Application Scizz mobile" 
                        className="screenshot"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="download-steps">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                Comment <span className="text-primary">télécharger</span> ?
              </h2>
              <p className="section-subtitle">
                Trois étapes simples pour commencer à utiliser Scizz
              </p>
            </motion.div>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="step-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">
                    <i className={step.icon}></i>
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="qr-section">
          <div className="container">
            <motion.div 
              className="qr-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                Scannez pour <span className="text-primary">télécharger</span>
              </h2>
              <p className="section-subtitle">
                Utilisez votre smartphone pour scanner le QR code et télécharger directement l'application
              </p>
              <div className="qr-grid">
                <div className="qr-card">
                  <div className="qr-code">
                    <img src="/images/qr-ios.png" alt="QR Code iOS" />
                  </div>
                  <h3>App Store</h3>
                  <p>Pour iPhone et iPad</p>
                </div>
                <div className="qr-card">
                  <div className="qr-code">
                    <img src="/images/qr-android.png" alt="QR Code Android" />
                  </div>
                  <h3>Google Play</h3>
                  <p>Pour Android</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <motion.div 
              className="cta-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="cta-title">
                Prêt à réserver votre premier service ?
              </h2>
              <p className="cta-description">
                Téléchargez Scizz maintenant et découvrez la coiffure à domicile moderne en Côte d'Ivoire
              </p>
              <div className="cta-buttons">
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                >
                  <i className="fab fa-apple"></i>
                  Télécharger pour iOS
                </a>
                <a 
                  href="https://play.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline"
                >
                  <i className="fab fa-google-play"></i>
                  Télécharger pour Android
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Download;
