import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Utiliser l'email ou le numéro de téléphone comme identifiant
      const identifier = email.includes('@') ? { email } : { phone: email };
      
      const response = await login({
        ...identifier,
        password,
      });

      // Vérifier si l'utilisateur est un administrateur
      if (response.user.user_type !== 'admin') {
        throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.');
      }

      // Mettre à jour le contexte d'authentification
      authLogin(response.token, response.user);
      
      // Rediriger vers le tableau de bord ou la page précédente
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <LockOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="h1" variant="h5">
              Connexion Admin
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email ou Téléphone"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
