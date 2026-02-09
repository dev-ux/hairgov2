import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import HairdresserRegistration from './pages/HairdresserRegistration';
import Login from './pages/Login';
import Tarifs from './pages/Tarifs';
import Contact from './pages/Contact';
import Download from './pages/Download';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import CGU from './pages/CGU';
import Cookies from './pages/Cookies';
import RGPD from './pages/RGPD';
import './styles/global.scss';

const App = () => {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscription-coiffeur" element={<HairdresserRegistration />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/telecharger" element={<Download />} />
          <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/politique-cookies" element={<Cookies />} />
          <Route path="/rgpd" element={<RGPD />} />
        </Routes>
      </motion.div>
    </Router>
  );
};

export default App;
