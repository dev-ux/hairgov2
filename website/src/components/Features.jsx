import React from 'react';
import { motion } from 'framer-motion';
import './Features.scss';

const Features = ({ id }) => {
  const features = [
    {
      icon: 'fas fa-mobile-alt',
      title: 'Application intuitive',
      description: 'Interface simple et moderne pour réserver vos services de coiffure en quelques clics.'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Service à domicile',
      description: 'Les coiffeurs se déplacent chez vous pour un service personnalisé et confortable.'
    },
    {
      icon: 'fas fa-user-check',
      title: 'Coiffeurs vérifiés',
      description: 'Tous nos coiffeurs sont professionnels et vérifiés pour garantir la qualité.'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Réservation flexible',
      description: 'Choisissez vos créneaux horaires selon votre emploi du temps.'
    },
    {
      icon: 'fas fa-star',
      title: 'Système d\'avis',
      description: 'Lisez les avis des autres clients et partagez votre expérience.'
    },
    {
      icon: 'fas fa-credit-card',
      title: 'Paiement sécurisé',
      description: 'Paiement en ligne simple et sécurisé via l\'application.'
    }
  ];

  return (
    <section className="features section" id={id}>
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Pourquoi choisir <span className="text-primary">Scizz</span> ?
          </h2>
          <p className="section-subtitle">
            La solution moderne pour la coiffure à domicile, pensée pour les coiffeurs et clients ivoiriens
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
