import React from 'react';
import { Mail, Code, Terminal } from 'lucide-react';
import './CreditsFooter.css';

const CreditsFooter = () => {
    return (
        <footer className="credits-footer">
            <div className="credits-container">

                {/* HEADER */}
                <div className="credits-header-section">
                    <h1 className="credits-title">
                        H12-25-L-Equipo 37
                    </h1>
                    <div className="credits-divider"></div>
                </div>

                <div className="credits-grid credits-grid-single">

                    {/* PROGRAMADOR BACKEND */}
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
