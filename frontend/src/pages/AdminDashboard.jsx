/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreditsFooter from '../components/CreditsFooter';
import {
    Shield,
    Plus,
    RefreshCw,
    Copy,
    Check,
    X,
    AlertCircle,
    CheckCircle,
    Loader,
    LogOut,
    Users,
    Key,
    Building2
} from 'lucide-react';

import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form
    const [formData, setFormData] = useState({ nombreEmpresa: '', contactoEmail: '' });

    // Created client result
    const [createdClient, setCreatedClient] = useState(null);
    const [error, setError] = useState('');

    const token = localStorage.getItem('jwt_token');

    // Common headers for ngrok bypass
    const getHeaders = (includeAuth = true) => ({
        'ngrok-skip-browser-warning': 'true',
        ...(includeAuth && token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    const checkConnection = useCallback(async () => {
        try {
            await fetch(`${API}/auth/health`, {
                headers: getHeaders(false),
                signal: AbortSignal.timeout(15000)
            });
            setConnected(true);
            return true;
        } catch {
            setConnected(false);
            return false;
        }
    }, []);

    const verifyAuth = useCallback(async () => {
        if (!token) {
            navigate('/admin/login');
            return false;
        }

        const role = localStorage.getItem('role');
        if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
            localStorage.clear();
            navigate('/admin/login');
            return false;
        }

        try {
            const res = await fetch(`${API}/admin/clientes`, {
                headers: getHeaders(),
                signal: AbortSignal.timeout(15000)
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.clear();
                navigate('/admin/login');
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }, [token, navigate]);

    const loadClients = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/clientes`, {
                headers: getHeaders()
            });
            if (res.ok) {
                setClients(await res.json());
            }
        } catch (err) {
            console.error('Error loading clients:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const init = async () => {
            const conn = await checkConnection();
            const auth = await verifyAuth();
            if (conn && auth) {
                await loadClients();
            } else {
                setLoading(false);
            }
        };
        init();
    }, [checkConnection, verifyAuth, loadClients]);

    const createClient = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        setCreatedClient(null);

        try {
            const res = await fetch(`${API}/admin/clientes`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || 'Error al crear cliente');
            }

            const data = await res.json();
            setCreatedClient(data);
            setFormData({ nombreEmpresa: '', contactoEmail: '' });
            loadClients();

        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    const copyToClipboard = (text, el) => {
        navigator.clipboard.writeText(text);
        // Visual feedback handled by state
    };

    if (loading) {
        return (
            <div className="admin-dashboard loading-screen">
                <div className="loader" />
                <p>Verificando sesión...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Connection Banner */}
            {!connected && (
                <div className="connection-banner">
                    <AlertCircle size={16} />
                    Sin conexión al servidor. Verificando...
                </div>
            )}

            <div className="container">
                {/* Header */}
                <header className="header">
                    <div className="brand">
                        <div className="brand-icon">
                            <Shield size={28} color="white" />
                        </div>
                        <div>
                            <h1>SentiEntorno</h1>
                            <p>Panel de Administración</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
                            <span className="dot" />
                            {connected ? 'Conectado' : 'Desconectado'}
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            <LogOut size={16} />
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Create Client Form */}
                <motion.div
                    className="glass-card create-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2>
                        <Plus size={20} />
                        Registrar Nueva Empresa
                    </h2>

                    <form onSubmit={createClient} className="create-form">
                        <div className="form-group">
                            <label>Nombre de la Empresa</label>
                            <input
                                type="text"
                                placeholder="Ej. Librería Central"
                                value={formData.nombreEmpresa}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email de Contacto</label>
                            <input
                                type="email"
                                placeholder="contacto@empresa.com"
                                value={formData.contactoEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactoEmail: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <button type="submit" className="submit-btn" disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader size={16} className="spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Key size={16} />
                                        Generar Credenciales
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Success Message */}
                    <AnimatePresence>
                        {createdClient && (
                            <motion.div
                                className="success-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="success-header">
                                    <CheckCircle size={20} color="#10B981" />
                                    <h3>Cliente Creado Exitosamente</h3>
                                </div>
                                <div className="credentials-grid">
                                    <div className="credential">
                                        <span className="label">API Key</span>
                                        <CopyableCode value={createdClient.apiKey} highlight />
                                    </div>
                                    <div className="credential">
                                        <span className="label">Usuario</span>
                                        <CopyableCode value={createdClient.username} />
                                    </div>
                                    <div className="credential">
                                        <span className="label">Contraseña temporal</span>
                                        <CopyableCode value={createdClient.password} warning />
                                    </div>
                                </div>
                                <p className="warning-text">
                                    ⚠️ Guarda estas credenciales ahora. La contraseña no se mostrará de nuevo.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Clients Table */}
                <motion.div
                    className="glass-card table-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="table-header">
                        <h2>
                            <Users size={20} />
                            Empresas Registradas
                        </h2>
                        <button className="refresh-btn" onClick={loadClients}>
                            <RefreshCw size={14} />
                            Actualizar
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Empresa</th>
                                    <th>API Key</th>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Uso</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="empty-cell">
                                            No hay empresas registradas aún.
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map(client => (
                                        <tr key={client.id}>
                                            <td className="company-cell">
                                                <Building2 size={14} />
                                                {client.nombreEmpresa}
                                            </td>
                                            <td>
                                                <CopyableCode value={client.apiKey} small />
                                            </td>
                                            <td className="email-cell">{client.contactoEmail || '-'}</td>
                                            <td>
                                                <span className={`plan-badge ${client.plan === 'premium' ? 'premium' : 'free'}`}>
                                                    {client.plan || 'free'}
                                                </span>
                                            </td>
                                            <td className="usage-cell">
                                                {client.usadoEsteMes || 0}/{client.limiteMensual || 100}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${client.activo ? 'active' : 'inactive'}`}>
                                                    {client.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
            <CreditsFooter />
        </div>
    );
};

// Copyable Code Component
const CopyableCode = ({ value, highlight, warning, small }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <code
            className={`copyable-code ${highlight ? 'highlight' : ''} ${warning ? 'warning' : ''} ${small ? 'small' : ''}`}
            onClick={handleCopy}
            title="Click para copiar"
        >
            {copied ? (
                <>
                    <Check size={12} />
                    ¡Copiado!
                </>
            ) : (
                value
            )}
        </code>
    );
};




export default AdminDashboard;
