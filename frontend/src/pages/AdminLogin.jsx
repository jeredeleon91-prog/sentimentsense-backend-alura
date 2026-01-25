import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader } from 'lucide-react';
import api from '../services/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.auth.login(username, password);

            if (response.ok) {
                const data = await response.json();

                // Force Admin Check (backend returns 'ADMIN' without ROLE_ prefix)
                if (data.role !== 'ADMIN') {
                    setError('Acceso denegado: No es administrador');
                    setLoading(false);
                    return;
                }

                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('role', data.role);
                navigate('/admin/dashboard');
            } else {
                setError('Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <style>{`
                .admin-login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #312E81 100%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .admin-login-page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    opacity: 0.4;
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 24px;
                    padding: 3rem;
                    width: 100%;
                    max-width: 420px;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .logo-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .logo-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #3B82F6, #6366F1);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
                    position: relative;
                }

                .logo-icon::before {
                    content: '';
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    border: 2px solid rgba(99, 102, 241, 0.3);
                    border-radius: 50%;
                    animation: orbit 6s linear infinite;
                }

                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .logo-title {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }

                .logo-subtitle {
                    color: #93C5FD;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-top: 0.5rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    color: #93C5FD;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .form-input:focus {
                    border-color: #3B82F6;
                    background: rgba(255, 255, 255, 0.15);
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #3B82F6, #6366F1);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .error-msg {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    color: #FCA5A5;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .back-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
                    margin-top: 1.5rem;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: white;
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="logo-wrapper">
                    <div className="logo-icon">
                        <Shield size={36} color="white" />
                    </div>
                    <h1 className="logo-title">System Admin</h1>
                    <p className="logo-subtitle">Backend Portal</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Usuario Admin</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader size={18} className="spin" />
                                Accediendo...
                            </>
                        ) : (
                            'Acceder'
                        )}
                    </button>
                </form>

                <Link to="/" className="back-link">
                    <ArrowLeft size={16} />
                    Volver al Inicio
                </Link>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
