/*
 * Threaded Comment Card Component
 * Displays a comment with its full conversation thread
 * Allows users/admins to continue replying
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle, MessageCircle, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper to format time
const timeAgo = (dateStr) => {
    if (!dateStr) return 'Ahora';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// Single thread message component
const ThreadMessage = ({ message, isAdmin = false }) => (
    <div style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.75rem',
        background: isAdmin ? 'var(--success-light, #ECFDF5)' : 'var(--primary-light, #FFF5F6)',
        borderRadius: 8,
        marginBottom: '0.5rem'
    }}>
        <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: isAdmin ? 'var(--success, #10B981)' : 'var(--primary, #FF6B7A)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            flexShrink: 0
        }}>
            {isAdmin ? '✓' : (message.autorNombre?.[0] || 'U').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4
            }}>
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: isAdmin ? 'var(--success, #059669)' : 'var(--primary, #FF6B7A)'
                }}>
                    {message.autorNombre || (isAdmin ? 'Equipo' : 'Usuario')}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #9CA3AF)' }}>
                    {timeAgo(message.createdAt)}
                </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary, #374151)', lineHeight: 1.4 }}>
                {message.texto}
            </p>
        </div>
    </div>
);

// Main threaded comment card
const ThreadedCommentCard = ({ comment, onReplySubmit, showDepartment = true }) => {
    const [threadMessages, setThreadMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    // Load thread messages when expanded
    useEffect(() => {
        if (expanded && comment.id) {
            loadThread();
        }
    }, [expanded, comment.id]);

    const loadThread = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const apiKey = localStorage.getItem('api_key');

            const headers = {
                'ngrok-skip-browser-warning': 'true'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else if (apiKey) {
                headers['X-API-KEY'] = apiKey;
            }

            const response = await fetch(`${API}/api/v1/dashboard/analisis/${comment.id}/respuestas`, {
                headers
            });
            if (response.ok) {
                const data = await response.json();
                setThreadMessages(data);
            }
        } catch (err) {
            console.error('Error loading thread:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setReplying(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const apiKey = localStorage.getItem('api_key');

            const headers = {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('Sending Reply with JWT');
            } else if (apiKey) {
                headers['X-API-KEY'] = apiKey;
                console.log('Sending Reply with API Key');
            } else {
                console.error('No Auth Credentials found for Reply');
            }

            const response = await fetch(`${API}/api/v1/dashboard/analisis/${comment.id}/respuestas`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    texto: replyText,
                    autorTipo: 'CLIENTE' // Admin/Client responding
                })
            });
            if (response.ok) {
                setReplyText('');
                setShowReplyForm(false);
                loadThread(); // Refresh thread
                if (onReplySubmit) onReplySubmit(comment);
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
        } finally {
            setReplying(false);
        }
    };

    const hasMultipleReplies = threadMessages.length > 0 || comment.respuesta;

    return (
        <div
            className="comment-thread-card"
            style={{
                background: 'var(--bg-card, white)',
                borderRadius: 12,
                border: '1px solid var(--border-color, #E5E7EB)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
                marginBottom: '1rem'
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
                            {typeof comment.departamento === 'object' ? comment.departamento.nombre : comment.departamento}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)' }}>{timeAgo(comment.fechaSolicitud)}</span>
            </div>

            {/* Original User Message */}
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

            {/* Initial Response (from legacy 'respuesta' field) */}
            {comment.respuesta && !expanded && (
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

            {/* Thread Messages (when expanded) */}
            {expanded && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border-color, #E5E7EB)' }}>
                    <div style={{ paddingTop: '1rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Show legacy response first if no thread messages */}
                                {comment.respuesta && threadMessages.length === 0 && (
                                    <ThreadMessage message={{ texto: comment.respuesta, autorNombre: 'Equipo' }} isAdmin={true} />
                                )}
                                {/* Thread responses */}
                                {threadMessages.map((msg, i) => (
                                    <ThreadMessage
                                        key={msg.id || i}
                                        message={msg}
                                        isAdmin={msg.autorTipo === 'CLIENTE' || msg.autorTipo === 'ADMIN'}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    {/* Reply Form */}
                    {showReplyForm && (
                        <form onSubmit={handleSubmitReply} style={{ marginTop: '1rem' }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Escribe una respuesta..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color, #E5E7EB)',
                                    borderRadius: 8,
                                    fontSize: '0.85rem',
                                    resize: 'vertical',
                                    minHeight: 80,
                                    background: 'var(--bg-input, #F9FAFB)',
                                    color: 'var(--text-primary, #374151)'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowReplyForm(false)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid var(--border-color, #E5E7EB)',
                                        background: 'transparent',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={replying}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '0.5rem 1rem',
                                        background: 'var(--primary)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        opacity: replying ? 0.7 : 1
                                    }}
                                >
                                    {replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Enviar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Action Footer */}
            <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid var(--border-color, #E5E7EB)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {/* Expand/Collapse Thread */}
                {hasMultipleReplies && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary, #6B7280)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                        }}
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expanded ? 'Ocultar hilo' : 'Ver conversación'}
                    </button>
                )}
                {!hasMultipleReplies && <div />}

                {/* Reply Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {expanded && !showReplyForm && (
                        <button
                            onClick={() => setShowReplyForm(true)}
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
                            <MessageCircle size={14} /> Continuar
                        </button>
                    )}
                    {!expanded && !comment.respuesta && (
                        <button
                            onClick={() => { setExpanded(true); setShowReplyForm(true); }}
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
                    {!expanded && comment.respuesta && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Respondido
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadedCommentCard;
