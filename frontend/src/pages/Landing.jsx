/*
 * Fecha de Creación: 17/01/2026
 * Landing Page - Menu Principal
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingBag, LayoutDashboard, ShieldCheck, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle'; // Asumo que existe
import './Landing.css';

import CreditsFooter from '../components/CreditsFooter';

const Landing = () => {
    const navigate = useNavigate();

    const options = [
        {
            title: 'Libreria Demo',
            desc: 'Sitio de libros con suscripciones y cafetería.',
            icon: <BookOpen size={32} />,
            path: '/demo/libreria',
            color: 'var(--primary)',
            bg: 'var(--primary-light)'
        },
        {
            title: 'Zapateria Demo',
            desc: 'Tienda e-commerce moderna de calzado con inventario.',
            icon: <ShoppingBag size={32} />,
            path: '/demo/zapateria',
            color: '#FF4757',
            bg: '#FFF0F1'
        },
        {
            title: 'Dashboard Cliente',
            desc: 'Panel de control para dueños de negocio (Manager).',
            icon: <LayoutDashboard size={32} />,
            path: '/client/login', // Login primero
            color: '#2ecc71',
            bg: '#E8F8F5'
        },
        {
            title: 'Backend Admin',
            desc: 'Super-administrador del sistema SaaS (Crear Tenants).',
            icon: <ShieldCheck size={32} />,
            path: '/admin/login',
            color: '#8e44ad',
            bg: '#F4ECF7'
        }
    ];

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="logo">SentimentSense <span>hub</span></div>
                <ThemeToggle />
            </header>

            <main className="landing-content">
                <div className="intro">
                    <h1>Selecciona tu Experiencia</h1>
                    <p>Explora nuestras demostraciones interactivas o accede a los portales de gestión.</p>
                </div>

                <div className="options-grid">
                    {options.map((opt, i) => (
                        <motion.div
                            key={i}
                            className="option-card"
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            onClick={() => navigate(opt.path)}
                            style={{ borderTop: `4px solid ${opt.color}` }}
                        >
                            <div className="icon-box" style={{ background: opt.bg, color: opt.color }}>
                                {opt.icon}
                            </div>
                            <h3>{opt.title}</h3>
                            <p>{opt.desc}</p>
                            <div className="arrow-link" style={{ color: opt.color }}>
                                Entrar <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <CreditsFooter />
        </div>
    );
};

export default Landing;
