import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Simulation d'envoi de formulaire
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: 'fas fa-phone',
      title: 'Téléphone',
      info: '+225 07 00 00 00 00',
      description: 'Disponible 24/7'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email',
      info: 'contact@scizz.ci',
      description: 'Réponse sous 24h'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Adresse',
      info: 'Abidjan, Cocody',
      description: 'Siège social'
    }
  ];

  const faqItems = [
    {
      question: 'Comment fonctionne Scizz ?',
      answer: 'Scizz vous connecte avec des coiffeurs professionnels qui se déplacent à domicile. Réservez en quelques clics et recevez votre coiffeur à l\'heure convenue.'
    },
    {
      question: 'Les coiffeurs sont-ils vérifiés ?',
      answer: 'Oui, tous nos coiffeurs passent par une vérification rigoureuse de leurs compétences, diplômes et expérience.'
    },
    {
      question: 'Quelles sont les zones de service ?',
      answer: 'Nous opérons principalement à Abidjan, Bouaké, Yamoussoukro et nous étendons progressivement nos services dans toute la Côte d\'voire.'
    },
    {
      question: 'Puis-je choisir mon coiffeur ?',
      answer: 'Absolument ! Vous pouvez consulter les profils des coiffeurs, voir leurs avis et choisir celui qui correspond le mieux à vos besoins.'
    }
  ];

  return (
    <div className="contact">
      <Header />
      <main className="contact-main">
        <section className="contact-hero">
          <div className="container">
            <motion.div 
              className="contact-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="contact-title">
                Contactez <span className="text-primary">Scizz</span>
              </h1>
              <p className="contact-subtitle">
                Une question ? Un besoin ? Notre équipe est là pour vous aider
              </p>
            </motion.div>
          </div>
        </section>

        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              <motion.div 
                className="contact-info-section"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="section-title">
                  Nos <span className="text-primary">coordonnées</span>
                </h2>
                <div className="contact-info-grid">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="contact-info-item">
                      <div className="contact-icon">
                        <i className={info.icon}></i>
                      </div>
                      <div className="contact-details">
                        <h3 className="contact-info-title">{info.title}</h3>
                        <p className="contact-info">{info.info}</p>
                        <span className="contact-description">{info.description}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="social-section">
                  <h3 className="social-title">Suivez-nous</h3>
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
                    <a href="https://wa.me/2250700000000" target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-whatsapp"></i>
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="contact-form-section"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="section-title">
                  Envoyez-nous un <span className="text-primary">message</span>
                </h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nom complet *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Téléphone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Sujet *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Choisissez un sujet</option>
                        <option value="devenir-coiffeur">Devenir coiffeur partenaire</option>
                        <option value="service-client">Service client</option>
                        <option value="technique">Problème technique</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      placeholder="Votre message..."
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Envoyer le message
                      </>
                    )}
                  </button>
                  {submitStatus === 'success' && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                Questions <span className="text-primary">fréquentes</span>
              </h2>
              <p className="section-subtitle">
                Les réponses aux questions que vous nous posez le plus souvent
              </p>
            </motion.div>
            <div className="faq-grid">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="faq-item"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <h3>{item.question}</h3>
                  </div>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
