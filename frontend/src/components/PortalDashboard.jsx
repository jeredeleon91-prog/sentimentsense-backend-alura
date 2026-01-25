/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PortalDashboard.css';
import CreditsFooter from './CreditsFooter';

const PortalDashboard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const portals = [
        {
            id: 'admin',
            title: 'Administrador',
            subtitle: 'Gestión de clientes y API Keys',
            icon: '🛡️',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.4)',
            path: '/admin/login'
        },
        {
            id: 'manager',
            title: 'Manager',
            subtitle: 'Análisis y métricas de negocio',
            icon: '💼',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            shadowColor: 'rgba(17, 153, 142, 0.4)',
            path: '/login'
        },
        {
            id: 'library',
            title: 'Librería Demo',
            subtitle: 'Explorar la biblioteca',
            icon: '📚',
            gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
            shadowColor: 'rgba(238, 9, 121, 0.4)',
            path: '/demo'
        }
    ];

    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Floating Button - Stylized Folder */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="portal-fab"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
            >
                {isOpen ? '✕' : '📂'}
            </motion.button>

            {/* Dashboard Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="portal-backdrop"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="portal-panel"
                        >
                            {/* Header */}
                            <div className="portal-header">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="portal-close-btn"
                                >
                                    <X size={18} />
                                </button>
                                <h2 className="portal-title">SentiEntorno</h2>
                                <p className="portal-subtitle">Panel de Acceso Rápido</p>
                            </div>

                            {/* Folder Grid */}
                            <div className="portal-grid-container">
                                <div className="portal-grid">
                                    {portals.map((portal, index) => (
                                        <motion.button
                                            key={portal.id}
                                            onClick={() => handleNavigate(portal.path)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{
                                                y: -8,
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="portal-item"
                                        >
                                            {/* Folder Icon */}
                                            <div
                                                className="portal-folder-icon"
                                                style={{
                                                    background: portal.gradient,
                                                    boxShadow: `0 8px 20px ${portal.shadowColor}`
                                                }}
                                            >
                                                {/* Folder Tab */}
                                                <div
                                                    className="portal-folder-tab"
                                                    style={{ background: portal.gradient }}
                                                />
                                                <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                                    {portal.icon}
                                                </span>
                                            </div>

                                            {/* Label */}
                                            <span className="portal-item-label">
                                                {portal.title}
                                            </span>

                                            {/* Arrow */}
                                            <ChevronRight
                                                size={14}
                                                className="portal-chevron"
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <CreditsFooter />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default PortalDashboard;
