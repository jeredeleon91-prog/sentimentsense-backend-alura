/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 31/12/2025
 * (c) Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import CreditsFooter from '../components/CreditsFooter';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    LayoutDashboard,
    MessageSquare,
    Package,
    Layers,
    Settings,
    LogOut,
    Bell,
    TrendingUp,
    ThumbsUp,
    ThumbsDown,
    Search,
    Filter,
    X,
    CheckCircle,
    Send,
    Loader2,
    MessageCircle
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ThreadedCommentCard from '../components/ThreadedCommentCard';
import './ClientDashboard.css';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ==========================================
// HELPERS
// ==========================================
const AnimatedNumber = ({ value, suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const duration = 1000;
        const steps = 30;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);
    return <>{display}{suffix}</>;
};

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMins = Math.floor((now - past) / 60000);
    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
};

// ==========================================
// COMPONENTS
// ==========================================
const CommentCard = ({ comment, onReply, showDepartment = true }) => (
    <div
        className="comment-thread-card"
        style={{
            background: 'var(--bg-card, white)',
            borderRadius: 12,
            border: '1px solid var(--border-color, #E5E7EB)',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s ease'
        }}
    >
        {/* Header */}
        <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color, #E5E7EB)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-input, #F9FAFB)'
        }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Sentiment Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 16,
                    background: comment.sentimiento === 'POSITIVO' ? 'var(--success-light, #D1FAE5)' : comment.sentimiento === 'NEGATIVO' ? 'var(--error-light, #FEE2E2)' : 'var(--warning-light, #FEF3C7)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: comment.sentimiento === 'POSITIVO' ? 'var(--success, #059669)' : comment.sentimiento === 'NEGATIVO' ? 'var(--error, #DC2626)' : 'var(--warning, #92400E)'
                }}>
                    {comment.sentimiento === 'POSITIVO' ? '😊' : comment.sentimiento === 'NEGATIVO' ? '😔' : '😐'}
                    <span>{comment.sentimiento === 'POSITIVO' ? 'Positivo' : comment.sentimiento === 'NEGATIVO' ? 'Negativo' : 'Neutro'}</span>
                </div>
                {comment.producto && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>@{comment.producto}</span>
                )}
                {showDepartment && comment.departamento && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary, #6B7280)', background: 'var(--bg-card, white)', padding: '2px 6px', borderRadius: 4 }}>
                        {comment.departamento}
                    </span>
                )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)' }}>{timeAgo(comment.fechaSolicitud)}</span>
        </div>

        {/* User Message */}
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--primary-light, #FFF5F6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    flexShrink: 0
                }}>
                    👤
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary, #1E293B)', marginBottom: 4 }}>
                        {comment.nombreUsuario || 'Anónimo'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary, #374151)', lineHeight: 1.5 }}>
                        {comment.texto}
                    </p>
                </div>
            </div>
        </div>

        {/* Admin Response Thread */}
        {comment.respuesta && (
            <div style={{
                padding: '1rem',
                background: 'var(--success-light, #ECFDF5)',
                borderTop: '1px solid var(--border-color, #E5E7EB)'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--success, #10B981)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                    }}>
                        ✓
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success, #059669)', marginBottom: 4 }}>
                            Respuesta del Equipo
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary, #065F46)', lineHeight: 1.5 }}>
                            {comment.respuesta}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Action Footer */}
        <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--border-color, #E5E7EB)',
            display: 'flex',
            justifyContent: 'flex-end'
        }}>
            {comment.respuesta ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Conversación cerrada
                </div>
            ) : (
                <button
                    onClick={onReply}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                    }}
                >
                    <MessageCircle size={14} /> Responder
                </button>
            )}
        </div>
    </div>
);

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
const ClientDashboard = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'comments', 'products', 'modules', 'config'
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [comments, setComments] = useState([]);
    const [config, setConfig] = useState(null);
    const [user, setUser] = useState(null);
    const [departamentos, setDepartamentos] = useState([]);

    // Modal States
    const [replyModal, setReplyModal] = useState({ open: false, comment: null });
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [showDeptoModal, setShowDeptoModal] = useState(false);
    const [newDepto, setNewDepto] = useState({ nombre: '', codigo: '', descripcion: '', colorHex: '#FF6B7A' });

    // Product State
    const [products, setProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ nombre: '', descripcion: '' });
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchJson, setBatchJson] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState(null); // For per-department import


    const [batchImportType, setBatchImportType] = useState('products'); // 'products', 'departments'

    // Product Detail Modal State
    const [productDetailModal, setProductDetailModal] = useState({ open: false, product: null });
    const [productSentimentTab, setProductSentimentTab] = useState('all'); // 'all', 'positivo', 'neutro', 'negativo'
    const [productDateFilter, setProductDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year', 'custom'
    const [productDateRange, setProductDateRange] = useState({ start: '', end: '' });

    // Auth & Data Fetching
    const getHeaders = useCallback(() => {
        const apiKey = localStorage.getItem('api_key');
        const token = localStorage.getItem('jwt_token');
        const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };

        // Priorizar JWT (Sesión explícita) sobre API Key (puede ser antigua/demo)
        if (token) headers['Authorization'] = `Bearer ${token}`;
        else if (apiKey) headers['X-API-KEY'] = apiKey;

        return headers;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const h = getHeaders();
            const [sRes, cRes, cfgRes, uRes, dRes, pRes] = await Promise.all([
                fetch(`${API}/api/v1/dashboard/estadisticas`, { headers: h }),
                fetch(`${API}/api/v1/dashboard/comentarios`, { headers: h }),
                fetch(`${API}/api/v1/dashboard/config`, { headers: h }),
                fetch(`${API}/api/v1/dashboard/me`, { headers: h }),
                fetch(`${API}/api/v1/departamentos`, { headers: h }),
                fetch(`${API}/api/v1/dashboard/productos`, { headers: h })
            ]);

            if (sRes.ok) setStats(await sRes.json());
            if (cRes.ok) {
                const commentsData = await cRes.json();
                console.log("Loaded Comments:", commentsData.length);
                setComments(commentsData);
            }
            if (cfgRes.ok) setConfig(await cfgRes.json());
            if (uRes.ok) setUser(await uRes.json());
            if (dRes.ok) setDepartamentos(await dRes.json());
            if (pRes.ok) setProducts(await pRes.json());

        } catch (e) {
            console.error("Dashboard Load Error:", e);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        if (!localStorage.getItem('api_key') && !localStorage.getItem('jwt_token')) {
            window.location.href = '/login';
            return;
        }
        fetchData();
    }, [fetchData]);

    // Auto-polling fallback for real-time updates (every 15 seconds)
    useEffect(() => {
        const pollComments = async () => {
            try {
                const res = await fetch(`${API}/api/v1/dashboard/comentarios`, { headers: getHeaders() });
                if (res.ok) {
                    const newComments = await res.json();
                    setComments(newComments);
                }
            } catch (e) {
                console.log('Poll failed:', e.message);
            }
        };

        const interval = setInterval(pollComments, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, [getHeaders]);

    // Real-time WebSocket updates
    const handleNewComment = useCallback(async (data) => {
        console.log('🆕 New comment received:', data);
        // Refetch comments to get full data
        try {
            const res = await fetch(`${API}/api/v1/dashboard/comentarios`, { headers: getHeaders() });
            if (res.ok) {
                const commentsData = await res.json();
                setComments(commentsData);
            }
        } catch (e) {
            console.error('Error refetching comments:', e);
        }
    }, [getHeaders]);

    const handleReplyAdded = useCallback((data) => {
        console.log('💬 Reply added:', data);
        if (data.commentId && data.respuesta) {
            setComments(prev => prev.map(c =>
                c.id === data.commentId ? { ...c, respuesta: data.respuesta } : c
            ));
        }
    }, []);

    // Connect to WebSocket when user is loaded
    const { connected: wsConnected } = useWebSocket(
        API,
        user?.id,
        handleNewComment,
        handleReplyAdded
    );

    // Actions
    const handleReply = async () => {
        if (!replyText.trim() || !replyModal.comment) return;
        setSendingReply(true);
        try {
            const res = await fetch(`${API}/api/v1/dashboard/comentarios/${replyModal.comment.id}/respuesta`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ respuesta: replyText })
            });
            if (res.ok) {
                setComments(prev => prev.map(c =>
                    c.id === replyModal.comment.id ? { ...c, respuesta: replyText } : c
                ));
                setReplyModal({ open: false, comment: null });
                setReplyText('');
            }
        } catch (e) { console.error(e); }
        finally { setSendingReply(false); }
    };

    const handleCreateDepto = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/api/v1/departamentos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(newDepto)
            });
            if (res.ok) {
                const savedDepto = await res.json();
                setDepartamentos(prev => [...prev, savedDepto]);
                setShowDeptoModal(false);
                setNewDepto({ nombre: '', codigo: '', descripcion: '', colorHex: '#FF6B7A' });
            }
        } catch (e) { console.error(e); }
    };


    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/api/v1/dashboard/productos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                const savedProd = await res.json();
                setProducts(prev => [savedProd, ...prev]); // Prepend new product
                setShowProductModal(false);
                setNewProduct({ nombre: '', descripcion: '' });
            }
        } catch (e) { console.error(e); }
    };

    const handleBatchImport = async () => {
        try {
            let data = JSON.parse(batchJson);
            if (!Array.isArray(data)) {
                alert("El JSON debe ser una lista de objetos.");
                return;
            }

            if (batchImportType === 'departments') {
                const res = await fetch(`${API}/api/v1/departamentos/batch`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    const newDeptos = await res.json();
                    setDepartamentos(prev => [...prev, ...newDeptos]);
                    setShowBatchModal(false);
                    setBatchJson('');
                    alert(`Se importaron ${newDeptos.length} departamentos correctamente`);
                }
            } else {
                // PRODUCT IMPORT
                // Auto-inject departamentoId if importing from a specific department
                if (selectedDeptId) {
                    data = data.map(item => ({ ...item, departamentoId: selectedDeptId }));
                }

                const res = await fetch(`${API}/api/v1/dashboard/productos/batch`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    const newProds = await res.json();
                    setProducts(prev => [...newProds, ...prev]);
                    setShowBatchModal(false);
                    setBatchJson('');
                    setSelectedDeptId(null); // Reset
                    alert(`Se importaron ${newProds.length} productos correctamente`);
                }
            }
        } catch (e) {
            alert("Error en el JSON o en la importación: " + e.message);
        }
    };

    // Delete single product
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            const res = await fetch(`${API}/api/v1/dashboard/productos/${productId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (e) { console.error(e); }
    };

    // Delete all products
    const handleDeleteAllProducts = async () => {
        if (!window.confirm('¿Estás seguro de eliminar TODOS los productos? Esta acción no se puede deshacer.')) return;
        const ids = products.map(p => p.id);
        if (ids.length === 0) return;
        try {
            const res = await fetch(`${API}/api/v1/dashboard/productos/batch`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify(ids)
            });
            if (res.ok) {
                setProducts([]);
                alert('Todos los productos han sido eliminados');
            }
        } catch (e) { console.error(e); }
    };

    // Derived Data
    const alerts = comments.filter(c => c.sentimiento === 'NEGATIVO' && !c.respuesta);
    const uniqueProducts = [...new Set(comments.map(c => c.producto).filter(Boolean))];

    // Helper: Filter comments for product detail modal
    const getFilteredProductComments = useCallback((product) => {
        if (!product) return [];

        let filtered = comments.filter(c => c.producto === product.nombre);

        // Filter by sentiment
        if (productSentimentTab !== 'all') {
            filtered = filtered.filter(c => c.sentimiento === productSentimentTab.toUpperCase());
        }

        // Filter by date
        const now = new Date();
        const getStartDate = () => {
            switch (productDateFilter) {
                case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
                case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                case 'year': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                case 'custom': return productDateRange.start ? new Date(productDateRange.start) : null;
                default: return null;
            }
        };
        const startDate = getStartDate();
        const endDate = productDateFilter === 'custom' && productDateRange.end ? new Date(productDateRange.end + 'T23:59:59') : now;

        if (startDate) {
            filtered = filtered.filter(c => {
                const commentDate = new Date(c.fechaSolicitud || c.fecha);
                return commentDate >= startDate && commentDate <= endDate;
            });
        }

        return filtered;
    }, [comments, productSentimentTab, productDateFilter, productDateRange]);

    if (loading) return <div className="loading-screen"><div className="loader" /><p style={{ marginTop: '1rem', color: '#666' }}>Cargando Panel...</p></div>;

    return (
        <div className="client-dashboard">
            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">
                <div className="brand">
                    <div className="brand-icon">✒️</div>
                    <div>
                        <h1>SentiEntorno</h1>
                        <p>Suite de Análisis</p>
                    </div>
                    <ThemeToggle style={{ marginLeft: 'auto' }} />
                </div>

                <nav className="sidebar-nav">
                    <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                        <LayoutDashboard size={20} /> Panel
                    </button>
                    <button className={`nav-item ${view === 'comments' ? 'active' : ''}`} onClick={() => setView('comments')}>
                        <MessageSquare size={20} /> Comentarios
                        {alerts.length > 0 && <span className="badge">{alerts.length}</span>}
                    </button>
                    <button className={`nav-item ${view === 'products' ? 'active' : ''}`} onClick={() => setView('products')}>
                        <Package size={20} /> Productos
                    </button>
                    <button className={`nav-item ${view === 'modules' ? 'active' : ''}`} onClick={() => setView('modules')}>
                        <Layers size={20} /> Departamentos
                    </button>
                    <button className={`nav-item ${view === 'config' ? 'active' : ''}`} onClick={() => setView('config')}>
                        <Settings size={20} /> Configuración
                    </button>
                </nav>

                <div className="user-profile" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
                    <div className="user-avatar">{user?.nombreEmpresa?.substring(0, 2).toUpperCase() || 'ME'}</div>
                    <div className="user-info">
                        <h4>{user?.nombreEmpresa || 'Mi Empresa'}</h4>
                        <p>Cerrar Sesión</p>
                    </div>
                    <LogOut size={16} color="var(--gray-400)" style={{ marginLeft: 'auto' }} />
                </div>
            </aside>

            {/* MAIN CONTENT Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <main className="dashboard-content">
                    <AnimatePresence mode="wait">

                        {/* DASHBOARD VIEW */}
                        {view === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <header className="page-header">
                                    <h2>Resumen General</h2>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #6B7280)' }}>
                                        Última actualización: {new Date().toLocaleTimeString()}
                                    </div>
                                </header>

                                <div className="stats-grid">
                                    <div className="glass-panel stat-card">
                                        <div className="header"><span className="label">Total Feedback</span><MessageSquare size={24} color="var(--gray-400)" /></div>
                                        <div className="value"><AnimatedNumber value={stats?.resumen?.totalComentarios || 0} /></div>
                                    </div>
                                    <div className="glass-panel stat-card">
                                        <div className="header"><span className="label">Positivos</span><ThumbsUp size={24} color="var(--success)" /></div>
                                        <div className="value" style={{ color: 'var(--success)' }}><AnimatedNumber value={stats?.resumen?.distribucion?.positivos || 0} /></div>
                                    </div>
                                    <div className="glass-panel stat-card">
                                        <div className="header"><span className="label">Negativos</span><ThumbsDown size={24} color="var(--error)" /></div>
                                        <div className="value" style={{ color: 'var(--error)' }}><AnimatedNumber value={stats?.resumen?.distribucion?.negativos || 0} /></div>
                                    </div>
                                    <div className="glass-panel stat-card stat-dark">
                                        <div className="header"><span className="label">Satisfacción</span><TrendingUp size={24} color="var(--primary)" /></div>
                                        <div className="value"><AnimatedNumber value={Math.round(stats?.resumen?.tasaSatisfaccion || 0)} suffix="%" /></div>
                                    </div>
                                </div>

                                <div className="main-grid">
                                    <div className="glass-panel chart-panel">
                                        <h3>Dinámica de Sentimientos</h3>
                                        <div style={{ height: 250 }}>
                                            <Line
                                                options={{ responsive: true, maintainAspectRatio: false }}
                                                data={{
                                                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                                                    datasets: [
                                                        { label: 'Positivos', data: [12, 19, 15, 22, 18, 25, 20], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true },
                                                        { label: 'Negativos', data: [3, 2, 5, 1, 4, 2, 3], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true }
                                                    ]
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="glass-panel alerts-panel">
                                        <h3 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Bell size={20} /> Atención Requerida
                                        </h3>
                                        <div style={{ marginTop: '1rem', maxHeight: 300, overflowY: 'auto' }}>
                                            {alerts.length === 0 ? <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>Todo en orden</p> :
                                                alerts.slice(0, 5).map(c => (
                                                    <div key={c.id} className="alert-card" onClick={() => setReplyModal({ open: true, comment: c })}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                                                            <span style={{ fontWeight: 'bold', color: 'var(--error)' }}>URGENTE</span>
                                                            <span>{timeAgo(c.fechaSolicitud)}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary, #333)' }}>{c.texto.substring(0, 60)}...</p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* COMMENTS VIEW */}
                        {view === 'comments' && (
                            <motion.div
                                key="comments"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <header className="page-header"><h2>Gestión de Comentarios</h2></header>
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
                                            <input type="text" placeholder="Buscar en comentarios..." style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #E5E7EB', borderRadius: 12 }} />
                                        </div>
                                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 1.5rem', border: '1px solid var(--border-color, #E5E7EB)', borderRadius: 12, background: 'var(--bg-card, white)', cursor: 'pointer' }}>
                                            <Filter size={16} /> Filtros
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {comments.map(c => <ThreadedCommentCard key={c.id} comment={c} onReplySubmit={() => fetchData()} />)}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* PRODUCTS VIEW (NEW) */}
                        {view === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <header className="page-header">
                                    <h2>Análisis por Producto</h2>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button className="btn-primary" onClick={() => setShowProductModal(true)}>+ Agregar</button>
                                        <button
                                            onClick={() => { setBatchImportType('products'); setSelectedDeptId(null); setShowBatchModal(true); }}
                                            style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                                        >
                                            📥 Importar
                                        </button>
                                        {products.length > 0 && (
                                            <button onClick={handleDeleteAllProducts} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                                                🗑️ Eliminar Todos
                                            </button>
                                        )}
                                    </div>
                                </header>

                                {products.length === 0 && uniqueProducts.length === 0 ? (
                                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <Package size={48} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--text-secondary, #6B7280)' }}>Aún no hay comentarios asociados a productos específicos.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Render each department from departamentos */}
                                        {departamentos.map(dept => {
                                            const deptoProducts = products.filter(p => p.departamento?.id === dept.id);
                                            return (
                                                <div key={dept.id} style={{ marginBottom: '2rem' }}>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        marginBottom: '1rem', padding: '0.75rem 1rem',
                                                        background: `linear-gradient(90deg, ${dept.colorHex || 'var(--primary)'} 0%, ${dept.colorHex || 'var(--primary)'}22 100%)`,
                                                        borderRadius: 12
                                                    }}>
                                                        <Layers size={18} color="white" />
                                                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', flex: 1 }}>
                                                            {dept.nombre}
                                                        </h3>
                                                        <span style={{
                                                            background: 'var(--bg-card, white)', color: dept.colorHex || 'var(--primary)',
                                                            padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600
                                                        }}>
                                                            {deptoProducts.length} producto{deptoProducts.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <button
                                                            onClick={() => { setBatchImportType('products'); setSelectedDeptId(dept.id); setShowBatchModal(true); }}
                                                            style={{
                                                                background: 'var(--bg-card, white)', color: dept.colorHex || 'var(--primary)', border: 'none',
                                                                borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
                                                                fontSize: '0.75rem', fontWeight: 600
                                                            }}
                                                        >
                                                            📥 Importar
                                                        </button>
                                                    </div>
                                                    {deptoProducts.length > 0 ? (
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                            {deptoProducts.map(prod => {
                                                                const prodComments = comments.filter(c => c.producto === prod.nombre);
                                                                const positives = prodComments.filter(c => c.sentimiento === 'POSITIVO').length;
                                                                const negatives = prodComments.filter(c => c.sentimiento === 'NEGATIVO').length;
                                                                const score = prodComments.length > 0 ? ((positives / prodComments.length) * 100) : 0;
                                                                return (
                                                                    <div
                                                                        key={prod.id}
                                                                        className="glass-panel"
                                                                        style={{ padding: '1.25rem', borderLeft: `4px solid ${dept.colorHex || 'var(--primary)'}`, position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                                        onClick={() => { setProductDetailModal({ open: true, product: prod }); setProductSentimentTab('all'); setProductDateFilter('all'); }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                                    >
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(prod.id); }}
                                                                            style={{ position: 'absolute', top: 8, right: 8, background: '#FEE2E2', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontSize: '0.75rem' }}
                                                                            title="Eliminar producto"
                                                                        >×</button>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{prod.nombre}</h4>
                                                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 10, background: 'var(--gray-100)' }}>
                                                                                {prodComments.length} opiniones
                                                                            </span>
                                                                        </div>
                                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #666)', marginBottom: '0.75rem' }}>{prod.descripcion}</p>
                                                                        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, marginBottom: '0.5rem', overflow: 'hidden' }}>
                                                                            <div style={{ width: `${score}%`, height: '100%', background: score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--error)' }} />
                                                                        </div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #6B7280)' }}>
                                                                            <span>👍 {positives}</span>
                                                                            <span>👎 {negatives}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                                                            <Package size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                                            <p style={{ margin: 0, fontSize: '0.85rem' }}>Sin productos. Click en "📥 Importar" para agregar.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Unassigned products section */}
                                        {(() => {
                                            const unassigned = products.filter(p => !p.departamento);
                                            return unassigned.length > 0 && (
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        marginBottom: '1rem', padding: '0.75rem 1rem',
                                                        background: 'linear-gradient(90deg, #64748B 0%, rgba(100,116,139,0.1) 100%)',
                                                        borderRadius: 12
                                                    }}>
                                                        <Package size={18} color="white" />
                                                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', flex: 1 }}>Sin Departamento</h3>
                                                        <span style={{ background: 'var(--bg-card, white)', color: 'var(--text-secondary, #64748B)', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {unassigned.length}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                        {unassigned.map(prod => {
                                                            const prodComments = comments.filter(c => c.producto === prod.nombre);
                                                            const positives = prodComments.filter(c => c.sentimiento === 'POSITIVO').length;
                                                            const negatives = prodComments.filter(c => c.sentimiento === 'NEGATIVO').length;
                                                            const score = prodComments.length > 0 ? ((positives / prodComments.length) * 100) : 0;
                                                            return (
                                                                <div key={prod.id} className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(prod.id)}
                                                                        style={{ position: 'absolute', top: 8, right: 8, background: '#FEE2E2', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontSize: '0.75rem' }}
                                                                        title="Eliminar producto"
                                                                    >×</button>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{prod.nombre}</h4>
                                                                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 10, background: 'var(--gray-100)' }}>
                                                                            {prodComments.length} opiniones
                                                                        </span>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #666)', marginBottom: '0.75rem' }}>{prod.descripcion}</p>
                                                                    <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, marginBottom: '0.5rem', overflow: 'hidden' }}>
                                                                        <div style={{ width: `${score}%`, height: '100%', background: score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--error)' }} />
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                                                                        <span>👍 {positives}</span>
                                                                        <span>👎 {negatives}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Auto-detected products from comments */}
                                        {uniqueProducts.filter(name => !products.some(p => p.nombre === name)).length > 0 && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF3C7', borderRadius: 12 }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400E' }}>
                                                    💡 Hay {uniqueProducts.filter(name => !products.some(p => p.nombre === name)).length} productos detectados en comentarios que aún no están registrados.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* MODULES/DEPARTMENTS VIEW */}
                        {view === 'modules' && (
                            <motion.div
                                key="modules"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <header className="page-header">
                                    <h2>Departamentos</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-primary" onClick={() => setShowDeptoModal(true)}>+ Agregar</button>
                                        <button
                                            onClick={() => { setBatchImportType('departments'); setShowBatchModal(true); }}
                                            style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                                        >
                                            📥 Importar
                                        </button>
                                    </div>
                                </header>

                                <div className="modules-grid">
                                    {departamentos.map((d, i) => (
                                        <div key={i} className="module-card">
                                            <div className="module-header">
                                                <div className="module-icon" style={{ background: `${d.colorHex}20`, color: d.colorHex }}><Layers size={16} /></div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary, #9CA3AF)' }}>{d.codigo}</span>
                                            </div>
                                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{d.nombre}</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>{d.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* CONFIG VIEW */}
                        {view === 'config' && (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <header className="page-header"><h2>Configuración</h2></header>

                                {/* Analysis Settings */}
                                <div className="glass-panel" style={{ padding: '2rem', maxWidth: 700, marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Settings size={20} /> Configuración de Análisis
                                    </h3>

                                    {/* Toggle: Use Rating in Analysis */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-input, #F9FAFB)', borderRadius: 12 }}>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: 4 }}>Análisis Híbrido</strong>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6B7280)' }}>Combinar predicción IA con calificación del usuario</span>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 26 }}>
                                            <input
                                                type="checkbox"
                                                checked={config?.usarRatingEnAnalisis || false}
                                                onChange={(e) => setConfig(prev => ({ ...prev, usarRatingEnAnalisis: e.target.checked }))}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute', cursor: 'pointer', inset: 0,
                                                backgroundColor: config?.usarRatingEnAnalisis ? '#10B981' : 'var(--gray-300, #D1D5DB)',
                                                borderRadius: 26, transition: '0.3s'
                                            }}>
                                                <span style={{
                                                    position: 'absolute', content: '', height: 20, width: 20,
                                                    left: config?.usarRatingEnAnalisis ? 26 : 3, bottom: 3,
                                                    backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }} />
                                            </span>
                                        </label>
                                    </div>

                                    {/* Slider: Rating Weight */}
                                    <div style={{ padding: '1rem', background: 'var(--bg-input, #F9FAFB)', borderRadius: 12, marginBottom: '1.5rem', opacity: config?.usarRatingEnAnalisis ? 1 : 0.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <strong>Peso de la Calificación</strong>
                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{config?.pesoRating || 30}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={config?.pesoRating || 30}
                                            disabled={!config?.usarRatingEnAnalisis}
                                            onChange={(e) => setConfig(prev => ({ ...prev, pesoRating: parseInt(e.target.value) }))}
                                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)', marginTop: 4 }}>
                                            <span>100% IA</span>
                                            <span>50/50</span>
                                            <span>100% Calificación</span>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`${API}/api/v1/dashboard/config`, {
                                                    method: 'PUT',
                                                    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        usarRatingEnAnalisis: config?.usarRatingEnAnalisis || false,
                                                        pesoRating: config?.pesoRating || 30
                                                    })
                                                });
                                                if (res.ok) {
                                                    alert('✅ Configuración guardada exitosamente');
                                                } else {
                                                    alert('❌ Error al guardar configuración');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('❌ Error de conexión');
                                            }
                                        }}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: 8, border: 'none',
                                            background: 'var(--primary)', color: 'white', fontWeight: 600,
                                            cursor: 'pointer', fontSize: '0.95rem'
                                        }}
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>

                                {/* API Credentials */}
                                <div className="glass-panel" style={{ padding: '2rem', maxWidth: 700 }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Credenciales API</h3>
                                    <div style={{ background: 'var(--bg-input, #F9FAFB)', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color, #E5E7EB)' }}>
                                        <code style={{ color: 'var(--text-secondary, #6B7280)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{config?.apiKey || localStorage.getItem('api_key') || '••••••••'}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(config?.apiKey || localStorage.getItem('api_key') || '');
                                                alert('API Key copiada al portapapeles');
                                            }}
                                            style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, marginLeft: 16 }}
                                        >
                                            COPIAR
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
                <CreditsFooter />
            </div>

            {/* REPLY MODAL - Calendly Style */}
            <AnimatePresence>
                {replyModal.open && (
                    <div
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1100,
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem'
                        }}
                        onClick={() => setReplyModal({ open: false, comment: null })}
                    >
                        <motion.div
                            style={{
                                background: 'var(--bg-card, white)',
                                borderRadius: 12,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                maxWidth: 500,
                                width: '100%',
                                padding: 0,
                                overflow: 'hidden'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>Responder Comentario</h3>
                                <button
                                    onClick={() => setReplyModal({ open: false, comment: null })}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 6, color: 'var(--text-secondary, #6B7280)' }}
                                    onMouseEnter={e => e.target.style.background = '#F3F4F6'}
                                    onMouseLeave={e => e.target.style.background = 'none'}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '1.5rem' }}>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary, #6B7280)' }}>Comentario del cliente:</p>
                                <div style={{ background: 'var(--bg-input, #F9FAFB)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', borderLeft: '3px solid #3B82F6' }}>
                                    <p style={{ margin: 0, color: 'var(--text-primary, #374151)', fontSize: '0.95rem' }}>"{replyModal.comment?.texto}"</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)', marginTop: '0.5rem', display: 'block' }}>— {replyModal.comment?.nombreUsuario || 'Anónimo'}</span>
                                </div>

                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary, #6B7280)' }}>Tu respuesta:</p>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Escribe una respuesta profesional y amable..."
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: 8,
                                        border: '1px solid #D1D5DB',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                                />
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color, #E5E7EB)', background: 'var(--bg-input, #F9FAFB)' }}>
                                <button
                                    onClick={() => setReplyModal({ open: false, comment: null })}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: 6,
                                        border: '1px solid var(--gray-300, #D1D5DB)',
                                        background: 'var(--bg-card, white)',
                                        color: 'var(--text-primary, #374151)',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReply}
                                    disabled={sendingReply || !replyText.trim()}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: 6,
                                        border: 'none',
                                        background: sendingReply || !replyText.trim() ? '#9CA3AF' : '#3B82F6',
                                        color: 'white',
                                        fontWeight: 500,
                                        cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {sendingReply ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                                    Enviar Respuesta
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BATCH IMPORT MODAL */}
            <AnimatePresence>
                {showBatchModal && (
                    <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Importar {batchImportType === 'departments' ? 'Departamentos' : 'Productos'} (JSON)</h3>
                                <button className="modal-close" onClick={() => setShowBatchModal(false)}><X size={20} /></button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                                Pega una lista de objetos JSON o sube un archivo. Ejemplo: <br />
                                {batchImportType === 'departments' ? (
                                    <code>[&#123;"nombre": "RRHH", "codigo": "HR01"&#125;, &#123;"nombre": "IT", "codigo": "IT05"&#125;]</code>
                                ) : (
                                    <code>[&#123;"nombre": "Prod A", "descripcion": "Desc A"&#125;, &#123;"nombre": "Prod B"&#125;]</code>
                                )}
                            </p>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Cargar archivo JSON:</label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => setBatchJson(event.target.result);
                                            reader.readAsText(file);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: 8 }}
                                />
                            </div>

                            <textarea
                                value={batchJson}
                                onChange={e => setBatchJson(e.target.value)}
                                placeholder={batchImportType === 'departments'
                                    ? '[{"nombre": "Recursos Humanos", "codigo": "RH", "descripcion": "..."}]'
                                    : '[{"nombre": "Producto 1", "descripcion": "..."}]'}
                                rows={8}
                                style={{ width: '100%', padding: '1rem', borderRadius: 8, border: '1px solid #E5E7EB', marginBottom: '1rem', fontFamily: 'monospace' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className="btn-secondary" onClick={() => setShowBatchModal(false)}>Cancelar</button>
                                <button className="btn-primary" onClick={handleBatchImport}>Importar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DEPARTMENT MODAL */}
            <AnimatePresence>
                {showDeptoModal && (
                    <div className="modal-overlay" onClick={() => setShowDeptoModal(false)}>
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header"><h3>Nuevo Departamento</h3><button className="modal-close" onClick={() => setShowDeptoModal(false)}><X size={20} /></button></div>
                            <form onSubmit={handleCreateDepto}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre</label>
                                    <input required style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: 8 }} value={newDepto.nombre} onChange={e => setNewDepto({ ...newDepto, nombre: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Código (Ej: VNT)</label>
                                    <input style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: 8 }} value={newDepto.codigo} onChange={e => setNewDepto({ ...newDepto, codigo: e.target.value.toUpperCase() })} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descripción</label>
                                    <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: 8 }} value={newDepto.descripcion} onChange={e => setNewDepto({ ...newDepto, descripcion: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowDeptoModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">Crear</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PRODUCT MODAL */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header"><h3>Nuevo Producto</h3><button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button></div>
                            <form onSubmit={handleCreateProduct}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre del Producto</label>
                                    <input required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #DDD)', borderRadius: 8 }}
                                        value={newProduct.nombre}
                                        onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                        placeholder="Ej. Libro de Cocina"
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descripción</label>
                                    <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD', borderRadius: 8 }}
                                        value={newProduct.descripcion}
                                        onChange={e => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                                        placeholder="Breve descripción..."
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">Registrar</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Detail Modal - Calendly Style */}
            <AnimatePresence>
                {productDetailModal.open && productDetailModal.product && (
                    <div
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem'
                        }}
                        onClick={() => setProductDetailModal({ open: false, product: null })}
                    >
                        <motion.div
                            style={{
                                background: 'var(--bg-card, white)',
                                borderRadius: 12,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                maxWidth: 850,
                                width: '100%',
                                maxHeight: '85vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>{productDetailModal.product.nombre}</h2>
                                    <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary, #6B7280)', fontSize: '0.9rem' }}>{productDetailModal.product.descripcion || 'Sin descripción'}</p>
                                </div>
                                <button
                                    onClick={() => setProductDetailModal({ open: false, product: null })}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 6, color: 'var(--text-secondary, #6B7280)', marginTop: -4 }}
                                    onMouseEnter={e => e.target.style.background = '#F3F4F6'}
                                    onMouseLeave={e => e.target.style.background = 'none'}
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Stats Row */}
                            {(() => {
                                const allProdComments = comments.filter(c => c.producto === productDetailModal.product.nombre);
                                const positives = allProdComments.filter(c => c.sentimiento === 'POSITIVO').length;
                                const neutrals = allProdComments.filter(c => c.sentimiento === 'NEUTRO').length;
                                const negatives = allProdComments.filter(c => c.sentimiento === 'NEGATIVO').length;
                                const avgRating = allProdComments.length > 0 ? (allProdComments.reduce((sum, c) => sum + (c.rating || 0), 0) / allProdComments.length).toFixed(1) : '-';
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{allProdComments.length}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Total</div>
                                        </div>
                                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{positives}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Positivos</div>
                                        </div>
                                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>{negatives}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Negativos</div>
                                        </div>
                                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{avgRating}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #666)' }}>Calificación Prom.</div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Filters Row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                                {/* Sentiment Tabs */}
                                <div style={{ display: 'flex', gap: '0.25rem', background: '#F3F4F6', borderRadius: 8, padding: '0.25rem' }}>
                                    {[
                                        { key: 'all', label: 'Todos' },
                                        { key: 'positivo', label: '👍 Positivos', color: 'var(--success)' },
                                        { key: 'neutro', label: '😐 Neutros', color: 'var(--warning)' },
                                        { key: 'negativo', label: '👎 Negativos', color: 'var(--error)' }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setProductSentimentTab(tab.key)}
                                            style={{
                                                padding: '0.5rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                                                background: productSentimentTab === tab.key ? (tab.color || 'var(--primary)') : 'transparent',
                                                color: productSentimentTab === tab.key ? 'white' : 'var(--text-secondary, #666)',
                                                fontWeight: productSentimentTab === tab.key ? 600 : 400
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Date Filter */}
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select
                                        value={productDateFilter}
                                        onChange={e => setProductDateFilter(e.target.value)}
                                        style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #DDD', fontSize: '0.75rem' }}
                                    >
                                        <option value="all">Todo el tiempo</option>
                                        <option value="today">Hoy</option>
                                        <option value="week">Última semana</option>
                                        <option value="month">Último mes</option>
                                        <option value="year">Último año</option>
                                        <option value="custom">Rango personalizado</option>
                                    </select>
                                    {productDateFilter === 'custom' && (
                                        <>
                                            <input type="date" value={productDateRange.start} onChange={e => setProductDateRange(prev => ({ ...prev, start: e.target.value }))} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #DDD', fontSize: '0.75rem' }} />
                                            <span style={{ color: '#666' }}>-</span>
                                            <input type="date" value={productDateRange.end} onChange={e => setProductDateRange(prev => ({ ...prev, end: e.target.value }))} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #DDD', fontSize: '0.75rem' }} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Comments List */}
                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
                                {(() => {
                                    const filteredComments = getFilteredProductComments(productDetailModal.product);
                                    if (filteredComments.length === 0) {
                                        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary, #999)' }}>No hay comentarios con los filtros seleccionados.</div>;
                                    }
                                    return filteredComments.map((c, i) => (
                                        <div key={c.id || i} className="glass-panel" style={{ padding: '1rem', marginBottom: '0.75rem', borderLeft: `4px solid ${c.sentimiento === 'POSITIVO' ? 'var(--success)' : c.sentimiento === 'NEGATIVO' ? 'var(--error)' : 'var(--warning)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.nombreUsuario || 'Anónimo'}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {c.rating && <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 10, fontSize: '0.7rem' }}>★ {c.rating}</span>}
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #999)' }}>{new Date(c.fechaSolicitud || c.fecha).toLocaleDateString('es-MX')}</span>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary, #333)' }}>{c.texto}</p>
                                            {c.respuesta ? (
                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: 8, borderLeft: '3px solid var(--success)' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>Respuesta:</span>
                                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>{c.respuesta}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setReplyModal({ open: true, comment: c }); setReplyText(''); }}
                                                    style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    💬 Responder
                                                </button>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>





        </div>
    );
};

export default ClientDashboard;
