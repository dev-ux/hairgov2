import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Tarifs.scss';

const Tarifs = () => {
  const pricingPlans = [
    {
      name: 'Service Unique',
      price: '1500 XOF',
      description: 'Parfait pour un besoin ponctuel',
      features: [
        'Service de coiffure à domicile',
        'Durée : 1 heure',
        'Coiffeur professionnel vérifié',
        'Produits de qualité inclus'
      ],
      popular: false
    },
    {
      name: 'Forfait Mensuel',
      price: '7500 XOF',
      description: 'Idéal pour un entretien régulier',
      features: [
        '4 services par mois',
        'Priorité de réservation',
        'Coiffeur dédié',
        'Produits premium',
        'Conseil personnalisé'
      ],
      popular: true
    },
    {
      name: 'Forfait Premium',
      price: '15000 XOF',
      description: 'Le luxe à portée de main',
      features: [
        'Services illimités',
        'Coiffeur VIP dédié',
        'Disponibilité 24/7',
        'Produits de luxe',
        'Service d\'urgence',
        'Conseil image personnalisé'
      ],
      popular: false
    }
  ];

  const additionalServices = [
    { name: 'Coloration', price: 'À partir de 3000 XOF' },
    { name: 'Mèches', price: 'À partir de 5000 XOF' },
    { name: 'Soins capillaires', price: 'À partir de 2000 XOF' },
    { name: 'Coiffure événementielle', price: 'À partir de 10000 XOF' }
  ];

  return (
    <div className="tarifs">
      <Header />
      <main className="tarifs-main">
        <section className="tarifs-hero">
          <div className="container">
            <motion.div 
              className="tarifs-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="tarifs-title">
                Tarifs <span className="text-primary">Scizz</span>
              </h1>
              <p className="tarifs-subtitle">
                Des formules adaptées à tous les besoins et tous les budgets en Côte d'Ivoire
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pricing-section">
          <div className="container">
            <div className="pricing-grid">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <span>Le plus populaire</span>
                    </div>
                  )}
                  <div className="pricing-header">
                    <h3 className="pricing-name">{plan.name}</h3>
                    <div className="pricing-price">
                      <span className="price">{plan.price}</span>
                    </div>
                    <p className="pricing-description">{plan.description}</p>
                  </div>
                  <div className="pricing-features">
                    <ul>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>
                          <i className="fas fa-check"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pricing-action">
                    <Link to="/inscription-coiffeur" className="btn btn-primary">
                      {plan.popular ? 'Commencer maintenant' : 'Choisir cette formule'}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="additional-services">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                Services <span className="text-primary">supplémentaires</span>
              </h2>
              <p className="section-subtitle">
                Complétez votre expérience avec nos services additionnels
              </p>
            </motion.div>
            <div className="services-grid">
              {additionalServices.map((service, index) => (
                <motion.div
                  key={index}
                  className="service-item"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h4 className="service-name">{service.name}</h4>
                  <p className="service-price">{service.price}</p>
                </motion.div>
              ))}
            </div>
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
                Prêt à réserver votre service ?
              </h2>
              <p className="cta-description">
                Rejoignez des milliers de clients satisfaits à Abidjan, Bouaké, Yamoussoukro et partout en Côte d'Ivoire
              </p>
              <div className="cta-buttons">
                <Link to="/inscription-coiffeur" className="btn btn-primary">
                  <i className="fas fa-scissors"></i>
                  Réserver maintenant
                </Link>
                <a href="#how-it-works" className="btn btn-outline">
                  <i className="fas fa-info-circle"></i>
                  Comment ça marche
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

export default Tarifs;
