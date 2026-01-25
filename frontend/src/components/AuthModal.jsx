/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Contacto: jeredeleon@yahoo.com
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, BookOpen, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const DEMO_API_KEY = import.meta.env.VITE_API_KEY || 'sk_f26ff8ac60cf4d2dbd5fb595';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                // Registrar y luego inicio de sesión automático
                const regRes = await register(formData.username, formData.password, formData.email, DEMO_API_KEY);
                if (!regRes.success) {
                    setError(regRes.error || 'Error en el registro');
                    setLoading(false);
                    return;
                }

                // Inicio de sesión automático tras registro exitoso
                const loginRes = await login(formData.username, formData.password);
                if (loginRes.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                        setSuccess(false);
                    }, 1500);
                } else {
                    setError('Registro exitoso pero error al iniciar sesión. Por favor inicia sesión manualmente.');
                }
            } else {
                const res = await login(formData.username, formData.password);
                if (res.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                        setSuccess(false);
                    }, 1000);
                } else {
                    setError(res.error || 'Credenciales inválidas');
                }
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const resetAndSwitch = () => {
        setIsRegister(!isRegister);
        setError('');
        setSuccess(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="auth-modal-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="auth-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="auth-header">
                        <button className="close-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                        <div className="auth-icon">
                            {isRegister ? <Sparkles size={28} color="white" /> : <BookOpen size={28} color="white" />}
                        </div>
                        <h2 className="auth-title">
                            {isRegister ? 'Únete a la Comunidad' : 'Bienvenido de Vuelta'}
                        </h2>
                        <p className="auth-subtitle">
                            {isRegister
                                ? 'Crea tu cuenta y disfruta de beneficios exclusivos'
                                : 'Accede a tu cuenta de Librería Da Vinci'}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="auth-form">
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="success-box"
                            >
                                <CheckCircle size={20} />
                                {isRegister ? '¡Registro exitoso! Iniciando sesión...' : '¡Bienvenido!'}
                            </motion.div>
                        )}

                        {error && <div className="error-box">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Usuario</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Tu nombre de usuario"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        disabled={success}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contraseña</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        disabled={success}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {isRegister && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="form-group"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <label className="form-label">Email (Opcional)</label>
                                        <div className="input-wrapper">
                                            <Mail size={18} className="input-icon" />
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="correo@ejemplo.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={success}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        Procesando...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle size={20} />
                                        ¡Listo!
                                    </>
                                ) : (
                                    isRegister ? 'Crear Mi Cuenta' : 'Iniciar Sesión'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <span>
                                {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                            </span>
                            <button className="switch-btn" onClick={resetAndSwitch} disabled={loading}>
                                {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
