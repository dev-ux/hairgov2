import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Testimonials.scss';

const Testimonials = ({ id }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'Awa Koné',
      role: 'Coiffeuse professionnelle',
      avatar: '/images/avatar-1.jpg',
      rating: 5,
      content: 'Scizz a transformé ma carrière. Je peux maintenant gérer mes clients et mes rendez-vous facilement, tout en touchant une nouvelle clientèle.',
      location: 'Abidjan'
    },
    {
      name: 'Kouadio Bamba',
      role: 'Client',
      avatar: '/images/avatar-2.jpg',
      rating: 5,
      content: 'Plus besoin de perdre du temps dans les salons. Le coiffeur vient à domicile, c\'est pratique et le service est excellent.',
      location: 'Bouaké'
    },
    {
      name: 'Fatima Touré',
      role: 'Coiffeuse à domicile',
      avatar: '/images/avatar-3.jpg',
      rating: 5,
      content: 'Grâce à Scizz, j\'ai pu développer mon activité de coiffeuse à domicile. L\'application est simple et les clients sont fidèles.',
      location: 'Yamoussoukro'
    },
    {
      name: 'Yao Kouakou',
      role: 'Client régulier',
      avatar: '/images/avatar-4.jpg',
      rating: 5,
      content: 'Je recommande Scizz à tous mes amis. C\'est rapide, fiable et les coiffeurs sont de vrais professionnels.',
      location: 'San Pedro'
    }
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className="testimonials section" id={id}>
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Ce que nos utilisateurs <span className="text-primary">en disent</span>
          </h2>
          <p className="section-subtitle">
            Découvrez les témoignages de coiffeurs et clients qui utilisent HairGov
          </p>
        </motion.div>

        <div className="testimonials-slider">
          <div className="testimonial-container">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={`testimonial-card ${index === activeIndex ? 'active' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: index === activeIndex ? 1 : 0,
                  scale: index === activeIndex ? 1 : 0.9
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                    <p className="testimonial-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>

                <p className="testimonial-content">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>

          <button 
            className="testimonial-nav prev" 
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            className="testimonial-nav next" 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => goToTestimonial(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="testimonials-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Clients actifs</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-scissors"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">500+</span>
              <span className="stat-label">Coiffeurs partenaires</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">4.8/5</span>
              <span className="stat-label">Note moyenne</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
