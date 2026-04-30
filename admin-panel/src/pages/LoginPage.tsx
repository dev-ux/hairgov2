import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Scissors, Mail, Lock, AlertCircle, ChevronRight, BarChart3, Users, Calendar } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, label: 'Tableau de bord',  desc: 'Statistiques en temps réel' },
  { icon: Users,     label: 'Gestion clients',  desc: 'Suivi des coiffeurs & salons' },
  { icon: Calendar,  label: 'Réservations',     desc: 'Planning centralisé' },
];

const LoginPage: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState<'email' | 'password' | null>(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const identifier = email.includes('@') ? { email } : { phone: email };
      const response   = await login({ ...identifier, password });
      if (response.user.user_type !== 'admin') {
        throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.');
      }
      authLogin(response.token, response.user);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(135deg, #4834d4 0%, #6C63FF 45%, #9B94FF 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
      }}>
        {/* Decorative circles */}
        {[
          { w: 400, h: 400, top: -140, right: -120, opacity: 0.08 },
          { w: 280, h: 280, bottom: -80, left: -80,  opacity: 0.07 },
          { w: 180, h: 180, top: '45%', right: 40,   opacity: 0.06 },
          { w: 100, h: 100, top: 120,   left: 60,    opacity: 0.09 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.w, height: c.h,
            borderRadius: '50%',
            background: 'white',
            opacity: c.opacity,
            top: c.top,
            bottom: (c as any).bottom,
            left: (c as any).left,
            right: (c as any).right,
          }} />
        ))}

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}>
              <Scissors size={24} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                HairGov
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Center text */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 20, padding: '5px 12px',
            width: 'fit-content', marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Plateforme sécurisée</span>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.5px',
          }}>
            Gérez votre<br />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>empire capillaire</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 360, marginBottom: 40 }}>
            Supervisez vos salons, coiffeurs et réservations depuis un seul espace centralisé.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer left */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          © 2025 HairGov · Tous droits réservés
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div style={{
        flex: 1,
        background: '#F8F9FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Card */}
          <div style={{
            background: 'white',
            borderRadius: 28,
            padding: '44px 40px',
            boxShadow: '0 8px 48px rgba(108,99,255,0.10), 0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(108,99,255,0.08)',
          }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(135deg, #6C63FF, #9B94FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 8px 24px rgba(108,99,255,0.35)',
              }}>
                <Lock size={22} color="white" strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Connexion
              </h2>
              <p style={{ fontSize: 14, color: '#8b8ba7', lineHeight: 1.5 }}>
                Accédez à votre espace d'administration
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#FFF1F1', border: '1px solid #FFD6D6',
                borderRadius: 12, padding: '12px 14px', marginBottom: 24,
              }}>
                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Email ou Téléphone
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color={focused === 'email' ? '#6C63FF' : '#9ca3af'}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }}
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="admin@hairgov.ci"
                    autoComplete="email"
                    required
                    style={{
                      width: '100%',
                      padding: '13px 14px 13px 42px',
                      border: `1.5px solid ${focused === 'email' ? '#6C63FF' : '#E5E7EB'}`,
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#1a1a2e',
                      background: focused === 'email' ? '#FAFAFF' : 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s, background 0.2s',
                      boxSizing: 'border-box',
                      boxShadow: focused === 'email' ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color={focused === 'password' ? '#6C63FF' : '#9ca3af'}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width: '100%',
                      padding: '13px 42px 13px 42px',
                      border: `1.5px solid ${focused === 'password' ? '#6C63FF' : '#E5E7EB'}`,
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#1a1a2e',
                      background: focused === 'password' ? '#FAFAFF' : 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s, background 0.2s',
                      boxSizing: 'border-box',
                      boxShadow: focused === 'password' ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#9ca3af', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  border: 'none',
                  background: loading || !email || !password
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #6C63FF 0%, #9B94FF 100%)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: loading || !email || !password
                    ? 'none'
                    : '0 8px 24px rgba(108,99,255,0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.1px',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }} />
                    Connexion…
                  </>
                ) : (
                  <>
                    Se connecter
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Secure badge */}
          <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={12} color="#9ca3af" />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Connexion chiffrée et sécurisée</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #c4c4d4; }
      `}</style>
    </div>
  );
};

export default LoginPage;
