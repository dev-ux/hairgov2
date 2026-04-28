import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CGU = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection vers la page CGU de KobinaTech
    window.location.href = 'https://kobinatech.com/cgu';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Redirection en cours...</h1>
      <p>Vous allez être redirigé vers nos Conditions Générales d'Utilisation.</p>
      <p>
        Si la redirection ne fonctionne pas, 
        <a 
          href="https://kobinatech.com/cgu" 
          style={{ color: '#007bff', textDecoration: 'underline' }}
        >
          cliquez ici
        </a>
      </p>
    </div>
  );
};

export default CGU;
