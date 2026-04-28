import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { authService } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Préparer les données pour l'API
      const loginData = {
        email: data.email.trim().toLowerCase(),
        password: data.password
      };

      // Appel API pour la connexion
      const response = await authService.login(loginData);
      
      // Succès - stocker les tokens et rediriger
      if (response.token) {
        localStorage.setItem('scizz_token', response.token);
      }
      if (response.user) {
        localStorage.setItem('scizz_user', JSON.stringify(response.user));
      }
      
      toast.success('Connexion réussie ! Bienvenue');
      
      // Rediriger vers le dashboard ou la page d'accueil
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gestion améliorée des erreurs
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <Header />
      <main className="login-main">
        <div className="container">
          <motion.div 
            className="login-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="login-form-wrapper">
              <div className="login-header">
                <h1 className="login-title">
                  Connexion <span className="text-primary">Scizz</span>
                </h1>
                <p className="login-subtitle">
                  Accédez à votre espace coiffeur
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
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
                    placeholder="votre@email.com"
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe *</label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { 
                        required: 'Ce champ est requis'
                      })}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password.message}</span>}
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Se souvenir de moi
                  </label>
                  <Link to="/mot-de-passe-oublie" className="forgot-password">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full">
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              <div className="login-footer">
                <p>
                  Pas encore de compte ? 
                  <Link to="/inscription-coiffeur" className="register-link">
                    Devenir coiffeur partenaire
                  </Link>
                </p>
              </div>
            </div>

            <div className="login-info">
              <div className="info-card">
                <h3>Bienvenue sur Scizz</h3>
                <p>
                  Rejoignez la plateforme de coiffure à domicile 
                  n°1 en Côte d'Ivoire et développez votre activité.
                </p>
                <ul className="info-features">
                  <li>
                    <i className="fas fa-check"></i>
                    Accès à des milliers de clients
                  </li>
                  <li>
                    <i className="fas fa-check"></i>
                    Gestion simplifiée des rendez-vous
                  </li>
                  <li>
                    <i className="fas fa-check"></i>
                    Paiements sécurisés
                  </li>
                  <li>
                    <i className="fas fa-check"></i>
                    Support client dédié
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default Login;
