import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, LogIn } from 'lucide-react';
import CreditsFooter from './CreditsFooter';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Renaissance Header */}
            <header className="bg-gradient-to-r from-[var(--color-venetian-red)] to-[var(--color-sepia)] text-[var(--color-parchment)] shadow-deep relative z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-4xl">🏛️</span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                                SentiEntorno
                            </h1>
                            <p className="text-xs text-[var(--color-gold)] uppercase tracking-widest">SaaS Analytics</p>
                        </div>
                    </motion.div>

                    <nav className="flex items-center gap-6 text-sm font-bold tracking-wide">
                        <Link to="/demo" className={`flex items-center gap-2 hover:text-[var(--color-gold)] transition ${location.pathname.includes('/demo') ? 'text-[var(--color-gold)]' : ''}`}>
                            <BookOpen size={18} /> DEMO LIBRERÍA
                        </Link>
                        <Link to="/dashboard" className={`flex items-center gap-2 hover:text-[var(--color-gold)] transition ${location.pathname.includes('/dashboard') ? 'text-[var(--color-gold)]' : ''}`}>
                            <BarChart3 size={18} /> DASHBOARD
                        </Link>
                    </nav>
                </div>
                {/* Gold Border Bottom */}
                <div className="h-1 bg-gradient-to-r from-[var(--color-gold-dim)] via-[var(--color-gold)] to-[var(--color-gold-dim)]"></div>
            </header>

            {/* Main Content with Transition */}
            <main className="flex-1 relative">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="container mx-auto px-4 py-8"
                >
                    {children}
                </motion.div>
            </main>



            {/* Footer */}
            <CreditsFooter />
        </div >
    );
};

export default Layout;
