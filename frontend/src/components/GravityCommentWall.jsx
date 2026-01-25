/*
 * Gravity Comment Wall - Simplified Version
 * Removed heavy animations for elegant, subtle appearance
 */
import React from 'react';
import { motion } from 'framer-motion';
import './GravityCommentWall.css';

const GravityCommentWall = ({ comments }) => {
    return (
        <div className="gravity-wall-container">
            {comments.length === 0 ? (
                <div className="gravity-empty-state">
                    <span className="gravity-icon">🪐</span>
                    <p>El universo está silencioso... sé el primero en orbitar aquí.</p>
                </div>
            ) : (
                <div className="gravity-masonry-grid">
                    {comments.map((comment, index) => (
                        <motion.div
                            key={comment.id || `comment-${index}`}
                            className={`gravity-card ${comment.sentimiento?.toLowerCase() || 'neutral'}`}
                            // Soft fade-in animation instead of falling
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index < 6 ? index * 0.08 : 0,
                                ease: "easeOut"
                            }}
                            // Subtle hover effect
                            whileHover={{
                                y: -3,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                transition: { duration: 0.2 }
                            }}
                            layout
                        >
                            <div className="gravity-card-header">
                                <div className="gravity-avatar">
                                    {(comment.nombreUsuario || 'A')[0].toUpperCase()}
                                </div>
                                <div className="gravity-meta">
                                    <span className="gravity-name">
                                        {comment.nombreUsuario || 'Viajero Anónimo'}
                                    </span>
                                    <span className="gravity-date">
                                        {new Date(comment.fecha || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                {comment.sentimiento && (
                                    <div className={`gravity-sentiment-dot ${comment.sentimiento.toLowerCase()}`}
                                        title={comment.sentimiento} />
                                )}
                            </div>

                            <div className="gravity-content">
                                <p>"{comment.texto || comment.comentario}"</p>
                            </div>

                            {comment.rating && (
                                <div className="gravity-stars" title={`${comment.rating} estrellas`}>
                                    {'⭐'.repeat(comment.rating)}
                                </div>
                            )}

                            {comment.respuesta && (
                                <div className="gravity-reply">
                                    <div className="reply-marker"></div>
                                    <div className="reply-content">
                                        <strong>Admin:</strong> {comment.respuesta}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GravityCommentWall;
