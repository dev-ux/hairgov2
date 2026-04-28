import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Cookies.scss';

const Cookies = () => {
  return (
    <div className="cookies">
      <Header />
      <main className="cookies-main">
        <section className="cookies-hero">
          <div className="container">
            <motion.div 
              className="cookies-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="cookies-title">
                Politique <span className="text-primary">Cookies</span>
              </h1>
              <p className="cookies-subtitle">
                Comment Scizz utilise les cookies pour améliorer votre expérience
              </p>
            </motion.div>
          </div>
        </section>

        <section className="cookies-content">
          <div className="container">
            <motion.div 
              className="content-wrapper"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="content-section">
                <h2>Qu'est-ce qu'un cookie ?</h2>
                <p>
                  Un cookie est un petit fichier texte déposé sur votre ordinateur ou appareil mobile lorsque vous visitez notre site web. 
                  Les cookies nous permettent de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
                </p>
              </div>

              <div className="content-section">
                <h2>Types de cookies que nous utilisons</h2>
                
                <div className="cookie-types">
                  <div className="cookie-type">
                    <h3>Cookies essentiels</h3>
                    <p>
                      Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. 
                      Ils incluent les cookies d'authentification et de sécurité.
                    </p>
                    <ul>
                      <li>Cookies de session</li>
                      <li>Cookies d'authentification</li>
                      <li>Cookies de sécurité</li>
                    </ul>
                  </div>

                  <div className="cookie-type">
                    <h3>Cookies de performance</h3>
                    <p>
                      Ces cookies nous permettent de comprendre comment les visiteurs interagissent avec notre site 
                      en collectant des informations de manière anonyme.
                    </p>
                    <ul>
                      <li>Google Analytics</li>
                      <li>Cookies de suivi des performances</li>
                    </ul>
                  </div>

                  <div className="cookie-type">
                    <h3>Cookies fonctionnels</h3>
                    <p>
                      Ces cookies permettent au site de mémoriser les choix que vous faites et de fournir des fonctionnalités améliorées.
                    </p>
                    <ul>
                      <li>Cookies de préférences</li>
                      <li>Cookies de langue</li>
                      <li>Cookies de localisation</li>
                    </ul>
                  </div>

                  <div className="cookie-type">
                    <h3>Cookies de marketing</h3>
                    <p>
                      Ces cookies sont utilisés pour vous présenter des publicités pertinentes en fonction de vos intérêts.
                    </p>
                    <ul>
                      <li>Cookies de réseaux sociaux</li>
                      <li>Cookies de ciblage publicitaire</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Gestion des cookies</h2>
                <p>
                  Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez :
                </p>
                <ul>
                  <li>Accepter ou refuser les cookies via notre bandeau de cookies</li>
                  <li>Modifier les paramètres de votre navigateur pour bloquer les cookies</li>
                  <li>Supprimer les cookies déjà stockés sur votre appareil</li>
                </ul>
                
                <div className="browser-instructions">
                  <h3>Instructions par navigateur</h3>
                  <div className="browser-list">
                    <div className="browser-item">
                      <h4>Chrome</h4>
                      <p>Paramètres → Confidentialité et sécurité → Cookies et autres données des sites</p>
                    </div>
                    <div className="browser-item">
                      <h4>Firefox</h4>
                      <p>Options → Vie privée et sécurité → Cookies et données de sites</p>
                    </div>
                    <div className="browser-item">
                      <h4>Safari</h4>
                      <p>Préférences → Confidentialité → Cookies et données de sites web</p>
                    </div>
                    <div className="browser-item">
                      <h4>Edge</h4>
                      <p>Paramètres → Confidentialité, recherche et services → Cookies et autorisations de sites</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Période de conservation des cookies</h2>
                <p>
                  Les cookies ont différentes durées de conservation :
                </p>
                <ul>
                  <li><strong>Cookies de session :</strong> Supprimés à la fin de votre session</li>
                  <li><strong>Cookies persistants :</strong> Conservés pendant 30 jours à 1 an</li>
                  <li><strong>Cookies analytiques :</strong> Conservés pendant 26 mois</li>
                  <li><strong>Cookies marketing :</strong> Conservés pendant 6 mois</li>
                </ul>
              </div>

              <div className="content-section">
                <h2>Droits des utilisateurs</h2>
                <p>
                  Conformément à la réglementation applicable en Côte d'Ivoire, vous disposez des droits suivants :
                </p>
                <ul>
                  <li>Droit d'accès aux données collectées via cookies</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit d'opposition au traitement des données</li>
                  <li>Droit de suppression des données</li>
                </ul>
              </div>

              <div className="content-section">
                <h2>Mises à jour de cette politique</h2>
                <p>
                  Cette politique cookies peut être mise à jour pour refléter les changements dans nos pratiques 
                  ou pour des raisons opérationnelles, légales ou réglementaires.
                </p>
                <p>
                  La date de la dernière mise à jour est indiquée en haut de cette page. 
                  Nous vous encourageons à consulter régulièrement cette politique pour rester informé.
                </p>
              </div>

              <div className="content-section">
                <h2>Nous contacter</h2>
                <p>
                  Si vous avez des questions concernant notre politique cookies ou l'utilisation des cookies sur Scizz, 
                  n'hésitez pas à nous contacter :
                </p>
                <div className="contact-info">
                  <p><strong>Email :</strong> contact@scizz.ci</p>
                  <p><strong>Téléphone :</strong> +225 07 00 00 00 00</p>
                  <p><strong>Adresse :</strong> Abidjan, Cocody, Côte d'Ivoire</p>
                </div>
              </div>

              <div className="last-updated">
                <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
