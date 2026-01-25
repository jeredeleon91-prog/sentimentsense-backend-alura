import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, BrainCircuit, User, Code, Terminal } from 'lucide-react';
import './CreditsFooter.css'; // Import the new CSS

const DATA_SCIENCE_TEAM = [
    {
        name: "Joel Valencia San Roman",
        role: "Data Scientist Lead",
        email: "joelvalenciasanroman@gmail.com"
    },
    {
        name: "Ana Mosquera Lozano",
        role: "Data Scientist",
        email: "armosque99@gmail.com"
    },
    {
        name: "Jetsael Villegas",
        role: "Data Scientist",
        email: "jet7vm@hotmail.com"
    },
    {
        name: "Enrique Antonio Hernández Parra",
        role: "Data Scientist",
        email: "enriketf@gmail.com"
    },
    {
        name: "Paola Andrea Rubiano Ruiz",
        role: "Data Scientist",
        email: "piavoal@hotmail.com"
    }
];

const CreditsFooter = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-cycle through team members
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % DATA_SCIENCE_TEAM.length);
        }, 5000); // Slower cycle to read details
        return () => clearInterval(timer);
    }, []);

    const currentMember = DATA_SCIENCE_TEAM[currentIndex];

    return (
        <footer className="credits-footer">
            <div className="credits-container">

                {/* 1. HEADER CENTRADO (Reduced Size) */}
                <div className="credits-header-section">
                    <h1 className="credits-title">
                        H12-25-L-Equipo 37
                    </h1>
                    <div className="credits-divider"></div>
                </div>

                <div className="credits-grid">

                    {/* 2. EQUIPO DATA SCIENCE (Animated 3D Fold) */}
                    <div className="team-column">
                        <h2 className="team-title team-title-ds">
                            <BrainCircuit size={16} /> Equipo Data Science
                        </h2>

                        <div className="credits-card">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ rotateX: 90, opacity: 0 }}
                                    animate={{ rotateX: 0, opacity: 1 }}
                                    exit={{ rotateX: -90, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                    className="card-content"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backfaceVisibility: 'hidden',
                                        transformOrigin: '50% 50%'
                                    }}
                                >
                                    <div className="avatar-circle avatar-ds">
                                        <User size={16} />
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <p className="member-name">
                                            {currentMember.name}
                                        </p>
                                        <p className="member-role role-ds">
                                            {currentMember.role}
                                        </p>
                                    </div>

                                    <div className="email-badge">
                                        <Mail size={12} />
                                        <span>{currentMember.email}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress bar */}
                            <motion.div
                                key={`progress-${currentIndex}`}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="progress-bar"
                            />
                        </div>
                    </div>

                    {/* 3. PROGRAMADOR BACKEND (Static) */}
                    <div className="team-column">
                        <h2 className="team-title team-title-be">
                            <Terminal size={16} /> Programador Backend
                        </h2>

                        <div className="credits-card">
                            <div className="card-content">
                                <div className="avatar-circle avatar-be">
                                    <Code size={16} />
                                </div>
                                <div style={{ textAlign: 'left', flex: 1 }}>
                                    <p className="member-name">
                                        Jeremias de Leon
                                    </p>
                                    <p className="member-role role-be">
                                        Backend Developer & Diseño
                                    </p>
                                </div>

                                <a href="mailto:jeredeleon@yahoo.com" className="email-badge">
                                    <Mail size={12} />
                                    <span>jeredeleon@yahoo.com</span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="credits-copyright">
                    © {new Date().getFullYear()} Proyecto Alura Latam | SentimentSense Hub | H12-25-L-Equipo 37
                </div>
            </div>
        </footer>
    );
};

export default CreditsFooter;
