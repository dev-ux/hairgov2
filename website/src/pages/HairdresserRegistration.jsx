import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { authService } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './HairdresserRegistration.scss';

const HairdresserRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    mode: 'onChange'
  });

  const watchedFields = watch();

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['firstName', 'lastName', 'email', 'phone', 'password']
      : currentStep === 2 
      ? ['address', 'city', 'postalCode', 'experience']
      : ['specialties', 'description'];

    // Pour l'étape 3, vérifier spécifiquement les spécialités cochées
    if (currentStep === 3) {
      const selectedSpecialties = document.querySelectorAll('input[name="specialties"]:checked');
      if (selectedSpecialties.length === 0) {
        toast.error('Veuillez sélectionner au moins une spécialité');
        return;
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Extraire les spécialités cochées
      const selectedSpecialties = [];
      const checkboxes = document.querySelectorAll('input[name="specialties"]:checked');
      checkboxes.forEach(checkbox => {
        selectedSpecialties.push(checkbox.value);
      });

      if (selectedSpecialties.length === 0) {
        toast.error('Veuillez sélectionner au moins une spécialité');
        setIsLoading(false);
        return;
      }

      // Préparer les données pour l'API backend Scizz
      const registrationData = {
        full_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        profession: 'Coiffeur professionnel',
        residential_address: data.address.trim(),
        date_of_birth: '1990-01-01', // Valeur par défaut pour le moment
        id_card_number: 'ID-' + Date.now(), // Valeur temporaire
        has_salon: false, // Par défaut, travaille à domicile
        education_level: data.diploma?.trim() || 'CAP Coiffure',
        hairstyle_ids: selectedSpecialties.map((specialty, index) => index + 1) // IDs temporaires
        
        // Champs supplémentaires selon votre schéma
        // id_card_photo: null, // À ajouter quand vous aurez l'upload
        // profile_photo: null,  // À ajouter quand vous aurez l'upload
        // latitude: null,      // À ajouter avec géolocalisation
        // longitude: null,     // À ajouter avec géolocalisation
      };

      console.log('📤 Envoi des données au backend:', registrationData);

      // Appel API pour l'inscription
      const response = await authService.registerHairdresser(registrationData);
      
      // Succès - stocker les tokens et rediriger
      if (response.token) {
        localStorage.setItem('scizz_token', response.token);
      }
      if (response.user) {
        localStorage.setItem('scizz_user', JSON.stringify(response.user));
      }
      
      toast.success('Inscription réussie ! Bienvenue dans la communauté Scizz');
      
      // Rediriger vers la page de connexion ou le dashboard
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      // Gestion améliorée des erreurs
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.response) {
        // Erreur du serveur
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          // Erreur de validation
          if (data.errors && Array.isArray(data.errors)) {
            // Erreurs de validation spécifiques
            const firstError = data.errors[0];
            errorMessage = firstError.message || firstError.msg || 'Données invalides';
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          }
        } else if (status === 409) {
          // Email déjà utilisé
          errorMessage = 'Cette adresse email est déjà utilisée. Veuillez en choisir une autre.';
        } else if (status === 422) {
          // Erreur de validation
          errorMessage = data.message || 'Les données fournies ne sont pas valides';
        } else if (status === 500) {
          // Erreur serveur interne
          errorMessage = 'Une erreur technique est survenue. Veuillez réessayer plus tard.';
        }
      } else if (error.request) {
        // Erreur réseau
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else if (error.message) {
        // Autre erreur
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const specialties = [
    'Coupe homme', 'Coupe femme', 'Coloration', 'Mèches', 'Balayage',
    'Brushing', 'Coiffure soirée', 'Barbe', 'Soins capillaires', 'Lissage'
  ];

  return (
    <div className="hairdresser-registration">
      <Header />
      <main className="registration-main">
        <div className="container">
          <motion.div 
            className="registration-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="registration-title">
              Devenez coiffeur <span className="text-primary">partenaire</span>
            </h1>
            <p className="registration-subtitle">
              Rejoignez notre réseau de coiffeurs professionnels et développez votre activité
            </p>
          </motion.div>

          <div className="progress-bar">
            <div className="progress-steps">
              {[...Array(totalSteps)].map((_, index) => (
                <div 
                  key={index} 
                  className={`progress-step ${index + 1 <= currentStep ? 'active' : ''}`}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-label">
                    {index === 0 ? 'Informations' : index === 1 ? 'Profil' : 'Services'}
                  </div>
                </div>
              ))}
            </div>
            <div 
              className="progress-line" 
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          <motion.form 
            className="registration-form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="form-step">
                <h2 className="step-title">Informations personnelles</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom *</label>
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName', { required: 'Ce champ est requis' })}
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Nom *</label>
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName', { required: 'Ce champ est requis' })}
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email professionnel *</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'Ce champ est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide'
                      }
                    })}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Téléphone *</label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone', { 
                        required: 'Ce champ est requis',
                        pattern: {
                          value: /^(\+225)?0?[1-9]\d{8}$/,
                          message: 'Format invalide. Ex: +22507XXXXXXXX ou 07XXXXXXXX'
                        }
                      })}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="+22507XXXXXXXX ou 07XXXXXXXX"
                    />
                    {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                    <small className="form-hint">Format ivoirien : +22507XXXXXXXX ou 07XXXXXXXX</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mot de passe *</label>
                    <input
                      id="password"
                      type="password"
                      {...register('password', { 
                        required: 'Ce champ est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
                        }
                      })}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Min. 8 caractères avec majuscule, chiffre et caractère spécial"
                    />
                    {errors.password && <span className="error-message">{errors.password.message}</span>}
                    <small className="form-hint">Ex: Password123!</small>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Profil professionnel */}
            {currentStep === 2 && (
              <div className="form-step">
                <h2 className="step-title">Profil professionnel</h2>
                
                <div className="form-group">
                  <label htmlFor="address">Adresse *</label>
                  <input
                    id="address"
                    type="text"
                    {...register('address', { required: 'Ce champ est requis' })}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                  />
                  {errors.address && <span className="error-message">{errors.address.message}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Ville *</label>
                    <input
                      id="city"
                      type="text"
                      {...register('city', { required: 'Ce champ est requis' })}
                      className={`form-input ${errors.city ? 'error' : ''}`}
                    />
                    {errors.city && <span className="error-message">{errors.city.message}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">Code postal *</label>
                    <input
                      id="postalCode"
                      type="text"
                      {...register('postalCode', { 
                        required: 'Ce champ est requis',
                        pattern: {
                          value: /^\d{2,4}$/,
                          message: 'Format invalide. Ex: 01, 02, 10, etc.'
                        }
                      })}
                      className={`form-input ${errors.postalCode ? 'error' : ''}`}
                      placeholder="Ex: 01, 02, 10, etc."
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode.message}</span>}
                    <small className="form-hint">Code postal à 4 chiffres pour la Côte d'Ivoire</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Années d'expérience *</label>
                  <select
                    id="experience"
                    {...register('experience', { required: 'Ce champ est requis' })}
                    className={`form-input ${errors.experience ? 'error' : ''}`}
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="0-2">Moins de 2 ans</option>
                    <option value="2-5">2-5 ans</option>
                    <option value="5-10">5-10 ans</option>
                    <option value="10+">Plus de 10 ans</option>
                  </select>
                  {errors.experience && <span className="error-message">{errors.experience.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="diploma">Diplôme(s)</label>
                  <input
                    id="diploma"
                    type="text"
                    {...register('diploma')}
                    className="form-input"
                    placeholder="CAP Coiffure, BP Coiffure, etc."
                  />
                </div>
              </div>
            )}

            {/* Étape 3: Services et description */}
            {currentStep === 3 && (
              <div className="form-step">
                <h2 className="step-title">Services et description</h2>
                
                <div className="form-group">
                  <label>Spécialités *</label>
                  <div className="specialties-grid">
                    {specialties.map(specialty => (
                      <label key={specialty} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={specialty}
                          {...register('specialties', { required: 'Sélectionnez au moins une spécialité' })}
                        />
                        <span className="checkmark"></span>
                        {specialty}
                      </label>
                    ))}
                  </div>
                  {errors.specialties && <span className="error-message">{errors.specialties.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description de votre activité *</label>
                  <textarea
                    id="description"
                    rows="5"
                    {...register('description', { 
                      required: 'Ce champ est requis',
                      minLength: {
                        value: 50,
                        message: 'La description doit contenir au moins 50 caractères'
                      }
                    })}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Décrivez votre expertise, votre style, ce qui vous différencie..."
                  />
                  {errors.description && <span className="error-message">{errors.description.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="travelRadius">Rayon de déplacement (km)</label>
                  <input
                    id="travelRadius"
                    type="number"
                    min="1"
                    max="50"
                    {...register('travelRadius')}
                    className="form-input"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
            )}

            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-outline">
                  <i className="fas fa-arrow-left"></i>
                  Précédent
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Suivant
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Terminer l'inscription
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.form>

          <div className="form-info">
            <p>
              <i className="fas fa-info-circle"></i>
              En vous inscrivant, vous acceptez nos 
              <Link to="/cgu"> conditions d'utilisation</Link> et notre 
              <Link to="/politique-de-confidentialite"> politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default HairdresserRegistration;
