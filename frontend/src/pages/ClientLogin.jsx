import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Loader, Key } from 'lucide-react';
import api from '../services/api';
import './ClientLogin.css';

const ClientLogin = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('credentials'); // 'credentials' or 'apikey'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCredentialsLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.auth.login(username, password);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('user_role', data.role || 'CLIENTE');
                navigate('/dashboard');
            } else {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleApiKeyLogin = async (e) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Ingresa una API Key');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Test the API key by making a request
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/api/v1/config`, {
                headers: {
                    'X-API-KEY': apiKey,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (response.ok) {
                localStorage.setItem('api_key', apiKey);
                navigate('/dashboard');
            } else {
                setError('API Key inválida');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="client-login-page">


            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="logo-wrapper">
                    <div className="logo-icon">
                        <Briefcase size={32} color="white" />
                    </div>
                    <h1 className="logo-title">SentiEntorno</h1>
                    <p className="logo-subtitle">Análisis de Sentimiento Empresarial</p>
                </div>

                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'credentials' ? 'active' : ''}`}
                        onClick={() => setMode('credentials')}
                    >
                        Credenciales
                    </button>
                    <button
                        className={`mode-tab ${mode === 'apikey' ? 'active' : ''}`}
                        onClick={() => setMode('apikey')}
                    >
                        <Key size={16} /> API Key
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                {mode === 'credentials' ? (
                    <form onSubmit={handleCredentialsLogin}>
                        <div className="form-group">
                            <label className="form-label">Usuario</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tu nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader size={18} className="spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleApiKeyLogin}>
                        <div className="form-group">
                            <label className="form-label">Tu API Key</label>
                            <input
                                type="text"
                                className="form-input monospace"
                                placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxx"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader size={18} className="spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Acceder con API Key'
                            )}
                        </button>
                    </form>
                )}

                <div className="contact-link">
                    ¿No tienes cuenta? <a href="#">Contactar ventas</a>
                </div>

                <Link to="/" className="back-link">
                    <ArrowLeft size={16} />
                    Volver al Inicio
                </Link>
            </motion.div>
        </div>
    );
};

export default ClientLogin;
