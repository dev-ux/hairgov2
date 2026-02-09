import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './RGPD.scss';

const RGPD = () => {
  return (
    <div className="rgpd">
      <Header />
      <main className="rgpd-main">
        <section className="rgpd-hero">
          <div className="container">
            <motion.div 
              className="rgpd-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="rgpd-title">
                Protection des <span className="text-primary">Données</span>
              </h1>
              <p className="rgpd-subtitle">
                Notre engagement pour la protection de vos données personnelles en Côte d'Ivoire
              </p>
            </motion.div>
          </div>
        </section>

        <section className="rgpd-content">
          <div className="container">
            <motion.div 
              className="content-wrapper"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="content-section">
                <h2>Introduction</h2>
                <p>
                  Scizz s'engage à protéger la vie privée et les données personnelles de ses utilisateurs. 
                  Cette politique RGPD explique comment nous collectons, utilisons, protégeons et partageons 
                  vos informations personnelles lorsque vous utilisez notre application de coiffure à domicile 
                  en Côte d'Ivoire.
                </p>
                <p>
                  Notre traitement des données personnelles est conforme au RGPD (Règlement Général 
                  sur la Protection des Données) et à la législation ivoirienne relative à la protection des données.
                </p>
              </div>

              <div className="content-section">
                <h2>Données personnelles collectées</h2>
                <p>Nous collectons les types de données personnelles suivants :</p>
                
                <div className="data-categories">
                  <div className="data-category">
                    <h3>Données d'identification</h3>
                    <ul>
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Numéro de téléphone</li>
                      <li>Adresse postale</li>
                      <li>Photo de profil</li>
                    </ul>
                  </div>

                  <div className="data-category">
                    <h3>Données professionnelles</h3>
                    <ul>
                      <li>Expérience professionnelle</li>
                      <li>Diplômes et certifications</li>
                      <li>Spécialités de coiffure</li>
                      <li>Portfolio et réalisations</li>
                      <li>Disponibilités et tarifs</li>
                    </ul>
                  </div>

                  <div className="data-category">
                    <h3>Données de connexion</h3>
                    <ul>
                      <li>Adresse IP</li>
                      <li>Type d'appareil</li>
                      <li>Navigateur utilisé</li>
                      <li>Données de localisation</li>
                      <li>Historique des réservations</li>
                    </ul>
                  </div>

                  <div className="data-category">
                    <h3>Données de paiement</h3>
                    <ul>
                      <li>Informations bancaires sécurisées</li>
                      <li>Historique des transactions</li>
                      <li>Moyens de paiement utilisés</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Finalités du traitement</h2>
                <p>Nous utilisons vos données personnelles pour les finalités suivantes :</p>
                
                <div className="purposes-list">
                  <div className="purpose-item">
                    <h3>Fourniture de services</h3>
                    <p>Traitement des réservations, coordination avec les coiffeurs, facturation</p>
                  </div>

                  <div className="purpose-item">
                    <h3>Amélioration du service</h3>
                    <p>Analyse des tendances, personnalisation de l'expérience, développement de nouvelles fonctionnalités</p>
                  </div>

                  <div className="purpose-item">
                    <h3>Sécurité</h3>
                    <p>Vérification d'identité, prévention des fraudes, protection des transactions</p>
                  </div>

                  <div className="purpose-item">
                    <h3>Communication</h3>
                    <p>Notifications de service, newsletter, support client, marketing ciblé</p>
                  </div>

                  <div className="purpose-item">
                    <h3>Conformité légale</h3>
                    <p>Respect des obligations légales et réglementaires, gestion des litiges</p>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Base légale du traitement</h2>
                <p>Nous traitons vos données personnelles sur les bases légales suivantes :</p>
                <ul>
                  <li><strong>Consentement :</strong> Vous avez consenti au traitement de vos données</li>
                  <li><strong>Exécution contractuelle :</strong> Traitement nécessaire pour fournir nos services</li>
                  <li><strong>Obligation légale :</strong> Respect des lois et réglementations applicables</li>
                  <li><strong>Intérêt légitime :</strong> Intérêts commerciaux légitimes de Scizz</li>
                </ul>
              </div>

              <div className="content-section">
                <h2>Partage des données</h2>
                <p>Nous ne partageons vos données personnelles que dans les circonstances suivantes :</p>
                
                <div className="sharing-scenarios">
                  <div className="sharing-item">
                    <h3>Avec les coiffeurs partenaires</h3>
                    <p>Nécessaire pour la coordination des services de coiffure à domicile</p>
                  </div>

                  <div className="sharing-item">
                    <h3>Avec les prestataires de services</h3>
                    <p>Paiement sécurisé, hébergement, analyse, support technique</p>
                  </div>

                  <div className="sharing-item">
                    <h3>Autorités compétentes</h3>
                    <p>En cas d'obligation légale ou de demande judiciaire</p>
                  </div>

                  <div className="sharing-item">
                    <h3>Transferts internationaux</h3>
                    <p>Lorsque nécessaire pour le fonctionnement du service, avec protection adéquate</p>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Conservation des données</h2>
                <p>Nous conservons vos données personnelles pendant les durées suivantes :</p>
                <ul>
                  <li><strong>Compte utilisateur actif :</strong> Pendant toute la durée d'utilisation du service</li>
                  <li><strong>Données de réservation :</strong> 5 ans après la dernière réservation</li>
                  <li><strong>Données financières :</strong> 10 ans pour la comptabilité et la fiscalité</li>
                  <li><strong>Données marketing :</strong> 3 ans après le dernier contact</li>
                  <li><strong>Cookies et traces :</strong> 26 mois maximum</li>
                </ul>
                <p>
                  À l'issue de ces périodes, les données sont soit supprimées, soit anonymisées 
                  conformément à nos obligations légales.
                </p>
              </div>

              <div className="content-section">
                <h2>Vos droits RGPD</h2>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                
                <div className="rights-grid">
                  <div className="right-item">
                    <h3>Droit d'accès</h3>
                    <p>Obtenir une copie de vos données personnelles</p>
                  </div>

                  <div className="right-item">
                    <h3>Droit de rectification</h3>
                    <p>Corriger les données inexactes ou incomplètes</p>
                  </div>

                  <div className="right-item">
                    <h3>Droit à l'effacement</h3>
                    <p>Demander la suppression de vos données personnelles</p>
                  </div>

                  <div className="right-item">
                    <h3>Droit à la limitation</h3>
                    <p>Limiter le traitement de vos données</p>
                  </div>

                  <div className="right-item">
                    <h3>Droit à la portabilité</h3>
                    <p>Recevoir vos données dans un format lisible</p>
                  </div>

                  <div className="right-item">
                    <h3>Droit d'opposition</h3>
                    <p>S'opposer au traitement de vos données</p>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Sécurité des données</h2>
                <p>
                  Scizz met en œuvre des mesures techniques et organisationnelles appropriées 
                  pour protéger vos données personnelles contre :
                </p>
                <ul>
                  <li>Accès non autorisé</li>
                  <li>Modification, destruction ou perte accidentelle</li>
                  <li>Divulgation non autorisée</li>
                  <li>Traitement illicite</li>
                </ul>
                <p>
                  Nos mesures de sécurité incluent le chiffrement, les pare-feu, 
                  les contrôles d'accès et la formation régulière de notre personnel.
                </p>
              </div>

              <div className="content-section">
                <h2>Cookies et suivi</h2>
                <p>
                  Nous utilisons des cookies pour améliorer votre expérience. 
                  Vous pouvez gérer vos préférences cookies via notre bandeau de cookies 
                  ou les paramètres de votre navigateur.
                </p>
                <p>
                  Pour plus d'informations, consultez notre 
                  <a href="/politique-cookies" className="link">politique cookies</a>.
                </p>
              </div>

              <div className="content-section">
                <h2>Modification de cette politique</h2>
                <p>
                  Cette politique RGPD peut être mise à jour pour refléter les changements 
                  dans nos pratiques ou pour des raisons légales et réglementaires.
                </p>
                <p>
                  Toute modification sera notifiée aux utilisateurs concernés et 
                  publiée sur notre site avec la date d'entrée en vigueur.
                </p>
              </div>

              <div className="content-section">
                <h2>Contact RGPD</h2>
                <p>
                  Pour toute question concernant cette politique RGPD ou l'exercice 
                  de vos droits, contactez notre Délégué à la Protection des Données :
                </p>
                <div className="contact-info">
                  <p><strong>Email :</strong> dpo@scizz.ci</p>
                  <p><strong>Téléphone :</strong> +225 07 00 00 00 00</p>
                  <p><strong>Adresse :</strong> Scizz, DPO, Abidjan, Cocody, Côte d'Ivoire</p>
                </div>
                <p>
                  Nous nous engageons à répondre à votre demande dans un délai 
                  maximum de 30 jours conformément aux dispositions du RGPD.
                </p>
              </div>

              <div className="content-section">
                <h2>Autorité de contrôle</h2>
                <p>
                  Si vous estimez que le traitement de vos données personnelles viole 
                  la réglementation applicable, vous avez le droit d'introduire une réclamation 
                  auprès de l'autorité de contrôle compétente :
                </p>
                <div className="authority-info">
                  <p><strong>Autorité de Protection des Données Personnelles (APDP)</strong></p>
                  <p>Côte d'Ivoire</p>
                  <p>Email : contact@apdp.ci</p>
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

export default RGPD;
