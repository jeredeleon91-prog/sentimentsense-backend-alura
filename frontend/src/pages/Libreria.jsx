/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Coffee, Users, MessageSquare,
    Search, ShoppingCart, Star, ChevronLeft, ChevronRight,
    Sparkles, Calendar, Clock, MapPin, User, Heart, X, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIsMobile } from '../hooks/useMediaQuery';
import AuthModal from '../components/AuthModal';
import PortalDashboard from '../components/PortalDashboard';
import ThemeToggle from '../components/ThemeToggle';
import CreditsFooter from '../components/CreditsFooter';
import api, { setGlobalApiKey, LIBRERIA_API_KEY } from '../services/api';
import GravityCommentWall from '../components/GravityCommentWall';
import './Libreria.css';

// Popular authors data
const popularAuthors = [
    { name: 'J.K. Rowling', reads: '8711 Lecturas', rating: 8.99, avatar: '🧙‍♀️' },
    { name: 'Stephen King', reads: '7420 Lecturas', rating: 9.17, avatar: '👻' },
    { name: 'Delia Owens', reads: '6443 Lecturas', rating: 9.13, avatar: '🦢' },
    { name: 'Y.N. Harari', reads: '5310 Lecturas', rating: 9.20, avatar: '🧠' }
];

// Book collection for LIBROS tab
const bookCollection = [
    {
        errorId: 'mock-101',
        title: 'Homo Deus',
        author: 'Yuval Noah Harari',
        cover: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
        premium: true
    },
    {
        title: 'The Splendid and the Vile',
        author: 'Erik Larson',
        cover: 'https://covers.openlibrary.org/b/id/10389354-L.jpg',
        premium: true
    },
    {
        title: '12 Rules for Life',
        author: 'Jordan B. Peterson',
        cover: 'https://covers.openlibrary.org/b/id/8479576-L.jpg',
        price: 'Q11.99'
    },
    {
        title: 'Harry Potter y el Cáliz de Fuego',
        author: 'J.K. Rowling',
        cover: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
        premium: true
    },
    {
        title: 'Brave New World',
        author: 'Aldous Huxley',
        cover: 'https://covers.openlibrary.org/b/id/9251896-L.jpg',
        premium: true
    }
];

// Tertulias data for TERTULIAS tab
const tertuliasData = [
    {
        id: 1,
        title: 'Clásicos del Siglo XX',
        description: 'Análisis y debate sobre las grandes obras literarias del siglo pasado',
        date: 'Viernes 20:00',
        location: 'Sala Da Vinci',
        participants: 12,
        maxParticipants: 15,
        host: 'Prof. García',
        tags: ['Literatura', 'Historia']
    },
    {
        id: 2,
        title: 'Ciencia Ficción Moderna',
        description: 'Explorando mundos futuros y distopías en la literatura contemporánea',
        date: 'Sábado 18:00',
        location: 'Sala Newton',
        participants: 8,
        maxParticipants: 12,
        host: 'Dr. Martínez',
        tags: ['Sci-Fi', 'Debates']
    },
    {
        id: 3,
        title: 'Poesía Latinoamericana',
        description: 'Recital y conversación sobre poetas latinoamericanos contemporáneos',
        date: 'Domingo 17:00',
        location: 'Jardín Central',
        participants: 20,
        maxParticipants: 25,
        host: 'María López',
        tags: ['Poesía', 'Cultura']
    }
];

// Cafeteria menu data for CAFETERIA tab
const cafeteriaMenu = [
    {
        category: 'Bebidas Calientes',
        icon: '☕',
        items: [
            { name: 'Espresso Leonardo', price: 'Q3.50', description: 'Café intenso con notas de chocolate', popular: true },
            { name: 'Latte Da Vinci', price: 'Q4.50', description: 'Espresso con leche cremosa y arte latte' },
            { name: 'Cappuccino Vitruvio', price: 'Q4.00', description: 'Equilibrio perfecto de café, leche y espuma' },
            { name: 'Chocolate del Renacimiento', price: 'Q4.50', description: 'Chocolate belga con crema batida' }
        ]
    },
    {
        category: 'Snacks & Postres',
        icon: '🥐',
        items: [
            { name: 'Croissant de Almendras', price: 'Q3.00', description: 'Horneado fresco cada mañana' },
            { name: 'Tarta de Miel y Nueces', price: 'Q5.00', description: 'Receta tradicional toscana', popular: true },
            { name: 'Galletas de Lavanda', price: 'Q2.50', description: 'Artesanales con lavanda de Provenza' },
            { name: 'Brownie de Café', price: 'Q4.00', description: 'Intenso y húmedo, con nueces' }
        ]
    }
];

// Hero Banner Component
const HeroBanner = () => (
    <div className="hero-banner">
        <div className="hero-content">
            <span className="hero-tag">
                <Sparkles size={14} /> Contenido Exclusivo
            </span>
            <h1 className="hero-title">
                Descubre bibliotecas llenas de contenido con nuestra suscripción
            </h1>
            <p className="hero-description">
                La suscripción mensual te permite acceder instantáneamente a más de mil e-books
                y audiolibros premium con los bestsellers más populares del mundo.
            </p>
            <div className="hero-actions">
                <button className="btn-primary">
                    Hazte Premium
                </button>
                <button className="btn-secondary">
                    Q75.00 Mensual
                </button>
            </div>
            <div className="hero-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
        </div>
        <div className="hero-illustration">
            <div className="reader-illustration">
                <div className="reader-body"></div>
                <div className="reader-book"></div>
            </div>
        </div>
    </div>
);

// Popular Authors Sidebar
const PopularAuthorsSidebar = () => (
    <div className="authors-sidebar">
        <h3 className="sidebar-title">Autores Populares</h3>
        <div className="authors-list">
            {popularAuthors.map((author, index) => (
                <div key={index} className="author-item">
                    <div className="author-avatar">{author.avatar}</div>
                    <div className="author-info">
                        <h4>{author.name}</h4>
                        <span>{author.reads}</span>
                    </div>
                    <div className="author-rating">
                        {author.rating.toFixed(2)}
                    </div>
                </div>
            ))}
        </div>
        <button className="btn-see-more">
            Ver Más
        </button>
    </div>
);

// Book Card Component
const BookCard = ({ book, onClick }) => (
    <motion.div
        className="book-card"
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        onClick={() => onClick(book)}
        style={{ cursor: 'pointer' }}
    >
        <div className="book-cover-wrapper">
            <img
                src={book.cover}
                alt={book.title}
                className="book-cover-img"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x220?text=📖';
                }}
            />
        </div>
        <h4 className="book-title">{book.title}</h4>
        <p className="book-author">by <span>{book.author}</span></p>
        <div className="book-actions">
            <button className={`book-btn ${book.premium ? 'premium' : 'purchase'}`}>
                {book.premium ? 'Premium' : book.price}
            </button>
        </div>
    </motion.div>
);

const BookDetailModal = ({ book, onClose, onComment, comments, user }) => {
    // Local comment state for the modal
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onComment(book, text, rating);
        setText('');
        setRating(0);
    };

    const handlePurchase = () => {
        // Redirect to purchase/spec protocol
        window.open(`https://www.google.com/search?q=comprar+libro+${encodeURIComponent(book.title)}`, '_blank');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="modal-content book-detail-modal"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}><X size={24} /></button>
                <div className="book-detail-grid">
                    <div className="detail-cover">
                        <img src={book.cover} alt={book.title} />
                    </div>
                    <div className="detail-info">
                        <h2>{book.title}</h2>
                        <h4 style={{ color: '#666', marginBottom: '1rem' }}>by {book.author}</h4>
                        <p style={{ lineHeight: 1.6, color: '#444' }}>
                            Una obra maestra que explora la profundidad de la experiencia humana.
                            Disfruta de esta edición especial con contenido exclusivo para suscriptores.
                        </p>

                        <div className="detail-actions">
                            <button className="btn-primary" onClick={handlePurchase}>
                                <ShoppingCart size={18} /> Comprar / Ver Especificaciones
                            </button>
                            <button className="btn-secondary">
                                <Heart size={18} /> Guardar
                            </button>
                        </div>

                        <div className="detail-comments">
                            <h3>Reseñas de la Comunidad</h3>
                            <div className="comments-list-mini">
                                {(comments || []).filter(c => c.producto === book.title).slice(0, 5).map(c => (
                                    <div key={c.id} className="mini-comment">
                                        <div className="mini-header">
                                            <strong>{c.nombreUsuario || 'Anónimo'}</strong>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 4,
                                                background: c.sentimiento === 'POSITIVO' ? '#D1FAE5' : c.sentimiento === 'NEGATIVO' ? '#FEE2E2' : '#FEF3C7',
                                                padding: '2px 8px', borderRadius: 12
                                            }}>
                                                <img
                                                    src={c.sentimiento === 'POSITIVO' ? '/assets/sentiments/alegre.png' : c.sentimiento === 'NEGATIVO' ? '/assets/sentiments/triste.png' : '/assets/sentiments/neutro.png'}
                                                    alt={c.sentimiento}
                                                    style={{ height: 22, width: 22, objectFit: 'contain' }}
                                                />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.sentimiento === 'POSITIVO' ? '#059669' : c.sentimiento === 'NEGATIVO' ? '#DC2626' : '#92400E' }}>
                                                    {c.sentimiento === 'POSITIVO' ? 'Alegre' : c.sentimiento === 'NEGATIVO' ? 'Triste' : 'Neutro'}
                                                </span>
                                            </div>
                                        </div>
                                        <p>{c.texto}</p>
                                        {c.respuesta && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#ECFDF5', borderRadius: 8, borderLeft: '3px solid #10B981' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>✓ Respuesta de la Librería:</span>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#065F46' }}>{c.respuesta}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!comments || comments.filter(c => c.producto === book.title).length === 0) && (
                                    <p style={{ fontStyle: 'italic', color: '#999', textAlign: 'center', padding: '1rem' }}>
                                        Sé el primero en opinar sobre este libro.
                                    </p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="mini-comment-form">
                                <h4>Deja tu opinión</h4>
                                <StarRating rating={rating} setRating={setRating} />
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="¿Qué te pareció este libro?"
                                    required
                                />
                                <button type="submit" className="btn-primary small">Publicar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// LIBROS Content - Book Carousel
const LibrosContent = ({ onBookClick }) => {
    const carouselRef = useRef(null);

    const scroll = (direction) => {
        const container = carouselRef.current;
        if (container) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="module-content">
            <div className="book-carousel-section">
                <div className="carousel-header">
                    <div>
                        <h2 className="section-title">
                            Explora nuestra colección<br />de bestsellers mundiales
                        </h2>
                    </div>
                    <button className="btn-show-all">Ver Todo</button>
                </div>

                <div className="carousel-wrapper">
                    <button className="carousel-nav left" onClick={() => scroll('left')}>
                        <ChevronLeft size={24} />
                    </button>

                    <div className="book-carousel" ref={carouselRef}>
                        {bookCollection.map((book, index) => (
                            <BookCard key={index} book={book} onClick={onBookClick} />
                        ))}
                    </div>

                    <button className="carousel-nav right" onClick={() => scroll('right')}>
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// TERTULIAS Content
const TertuliasContent = () => (
    <div className="module-content tertulias-content">
        <div className="tertulias-header">
            <h2 className="section-title">
                <Users size={28} /> Tertulias Literarias
            </h2>
            <p className="section-subtitle">Únete a nuestras conversaciones sobre literatura, arte y cultura</p>
        </div>

        <div className="tertulias-grid">
            {tertuliasData.map((tertulia) => (
                <motion.div
                    key={tertulia.id}
                    className="tertulia-card"
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                >
                    <div className="tertulia-tags">
                        {tertulia.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                        ))}
                    </div>
                    <h3 className="tertulia-title">{tertulia.title}</h3>
                    <p className="tertulia-description">{tertulia.description}</p>

                    <div className="tertulia-details">
                        <div className="detail">
                            <Calendar size={14} />
                            <span>{tertulia.date}</span>
                        </div>
                        <div className="detail">
                            <MapPin size={14} />
                            <span>{tertulia.location}</span>
                        </div>
                        <div className="detail">
                            <User size={14} />
                            <span>{tertulia.host}</span>
                        </div>
                    </div>

                    <div className="tertulia-footer">
                        <div className="participants">
                            <div className="participant-avatars">
                                {[...Array(Math.min(3, tertulia.participants))].map((_, i) => (
                                    <div key={i} className="participant-avatar">
                                        {['👤', '👨', '👩'][i]}
                                    </div>
                                ))}
                            </div>
                            <span>{tertulia.participants}/{tertulia.maxParticipants} participantes</span>
                        </div>
                        <button className="join-btn">
                            Unirse
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

// CAFETERIA Content
const CafeteriaContent = ({ onItemClick }) => (
    <div className="module-content cafeteria-content">
        <div className="cafeteria-header">
            <h2 className="section-title">
                <Coffee size={28} /> Cafetería Literaria
            </h2>
            <p className="section-subtitle">Disfruta de nuestras especialidades mientras lees tu libro favorito</p>
        </div>

        <div className="menu-grid">
            {cafeteriaMenu.map((category, index) => (
                <div key={index} className="menu-category">
                    <div className="category-header">
                        <span className="category-icon">{category.icon}</span>
                        <h3 className="category-title">{category.category}</h3>
                    </div>

                    <div className="menu-items">
                        {category.items.map((item, i) => (
                            <motion.div
                                key={i}
                                className={`menu-item ${item.popular ? 'popular' : ''}`}
                                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                                onClick={() => onItemClick && onItemClick({ ...item, category: category.category })}
                                style={{ cursor: 'pointer' }}
                            >
                                {item.popular && (
                                    <span className="popular-badge">
                                        <Heart size={10} /> Favorito
                                    </span>
                                )}
                                <div className="item-info">
                                    <h4 className="item-name">{item.name}</h4>
                                    <p className="item-description">{item.description}</p>
                                </div>
                                <span className="item-price">{item.price}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="cafeteria-promo">
            <div className="promo-content">
                <span className="promo-tag">🎉 Oferta Especial</span>
                <h3>¡Café gratis con tu membresía Premium!</h3>
                <p>Presenta tu tarjeta de socio y disfruta de un Latte Da Vinci de cortesía cada visita.</p>
            </div>
        </div>
    </div>
);

// Navigation tabs for modules
const ModuleTabs = ({ activeTab, onTabChange }) => (
    <div className="module-tabs-modern">
        <button
            className={`tab-modern ${activeTab === 'LIBROS' ? 'active' : ''}`}
            onClick={() => onTabChange('LIBROS')}
        >
            <BookOpen size={18} /> Biblioteca
        </button>
        <button
            className={`tab-modern ${activeTab === 'TERTULIAS' ? 'active' : ''}`}
            onClick={() => onTabChange('TERTULIAS')}
        >
            <Users size={18} /> Tertulias
        </button>
        <button
            className={`tab-modern ${activeTab === 'CAFETERIA' ? 'active' : ''}`}
            onClick={() => onTabChange('CAFETERIA')}
        >
            <Coffee size={18} /> Cafetería
        </button>
    </div>
);

// Star Rating Component
const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                >
                    <Star size={24} fill={star <= (hover || rating) ? '#FFD700' : 'none'} />
                </button>
            ))}
            <span className="rating-text">
                {rating > 0 ? ['', 'Malo', 'Regular', 'Bueno', 'Muy Bueno', '¡Excelente!'][rating] : 'Sin valorar'}
            </span>
        </div>
    );
};

// Main Libreria Component
const Libreria = () => {
    const navigate = useNavigate();
    const goHome = () => navigate('/');
    // Force set Libreria Key on mount
    useEffect(() => {
        setGlobalApiKey(LIBRERIA_API_KEY);
    }, []);

    const [activeTab, setActiveTab] = useState('LIBROS');
    const [isAuthOpen, setAuthOpen] = useState(false);
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();

    // Comments state
    const [commentText, setCommentText] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [rating, setRating] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [apiComments, setApiComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Product Protocol State
    const [realProducts, setRealProducts] = useState([]); // Products from Backend
    const [selectedBook, setSelectedBook] = useState(null); // For Modal
    const [selectedCafeteriaItem, setSelectedCafeteriaItem] = useState(null); // For Cafeteria Modal

    // Fetch Real Products for Protocol Mapping
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Using a known API key (Demo) or from context. For Demo Libreria, let's assume public access or hardcoded key
                // Ideally this endpoint should be public or use a specific DEMO key
                // For simplicity, we skip auth for this call if it's protected, but I made it require apiKey
                // Let's use a dummy key or the one from localStorage if user logged in
                const key = localStorage.getItem('api_key') || 'DEMO-API-KEY';
                const res = await api.get('/api/v1/public/productos');
                if (res.ok) {
                    setRealProducts(await res.json());
                }
            } catch (e) { console.log("Product Sync:", e); }
        };
        fetchProducts();
    }, []);

    // WebSocket for real-time updates
    const { messages: liveComments, connected } = useWebSocket(
        api.API_BASE,
        null,
        null,
        null,
        `/topic/client/1/comments`
    );

    // Reset product when tab changes
    useEffect(() => {
        setSelectedProduct('');
    }, [activeTab]);

    // Fetch comments with proper API key + auto-polling for real-time updates
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/api/v1/comentarios?modulo=${activeTab}`);
                if (response.ok) {
                    const data = await response.json();
                    setApiComments(data);
                }
            } catch (err) {
                console.error("Error fetching comments:", err);
            }
        };

        fetchComments(); // Initial fetch

        // Poll every 15 seconds for real-time reply updates
        const interval = setInterval(fetchComments, 15000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // Send comment with proper API key
    const sendComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            const payload = {
                texto: commentText,
                nombreUsuario: user?.username || userName || 'Anónimo',
                emailUsuario: userEmail || 'anonimo@demo.com',
                rating: rating || null,
                producto: selectedProduct || null
            };

            const response = await api.post('/api/v1/analizar', payload, activeTab);

            if (response.ok) {
                setCommentText('');
                setRating(0);
                // Refresh comments
                const updatedComments = await api.get(`/api/v1/comentarios?modulo=${activeTab}`);
                if (updatedComments.ok) {
                    setApiComments(await updatedComments.json());
                }
            }
        } catch (err) {
            console.error('Error sending comment:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Comment from Detail Modal
    const handleDetailComment = async (book, text, rate) => {
        // Protocol: Find real ID
        const realProd = realProducts.find(p => p.nombre === book.title);
        const prodId = realProd ? realProd.id : null;

        setLoading(true);
        try {
            const payload = {
                texto: text,
                nombreUsuario: user?.username || 'Lector Invitado',
                emailUsuario: user?.email || 'lector@demo.com',
                rating: rate,
                producto: book.title, // Name
                productoId: prodId   // Protocol ID
            };

            const response = await api.post('/api/v1/analizar', payload, 'LIBROS');
            if (response.ok) {
                // Refresh
                const updatedComments = await api.get(`/api/v1/comentarios?modulo=LIBROS`);
                if (updatedComments.ok) setApiComments(await updatedComments.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Combine and deduplicate comments
    const displayComments = [...(liveComments || []).filter(c => c.modulo === activeTab), ...(apiComments || [])]
        .slice(0, 50);

    // Render active module content
    const renderModuleContent = () => {
        switch (activeTab) {
            case 'LIBROS':
                return <LibrosContent onBookClick={setSelectedBook} />;
            case 'TERTULIAS':
                return <TertuliasContent />;
            case 'CAFETERIA':
                return <CafeteriaContent onItemClick={setSelectedCafeteriaItem} />;
            default:
                return <LibrosContent />;
        }
    };

    return (
        <div className="libreria-page-modern">
            <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />

            <AnimatePresence>
                {selectedBook && (
                    <BookDetailModal
                        book={selectedBook}
                        onClose={() => setSelectedBook(null)}
                        onComment={handleDetailComment}
                        comments={[...(liveComments || []), ...(apiComments || [])]}
                        user={user}
                    />
                )}
            </AnimatePresence>

            {/* Cafeteria Detail Modal */}
            <AnimatePresence>
                {selectedCafeteriaItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem'
                        }}
                        onClick={() => setSelectedCafeteriaItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            style={{
                                background: 'white', borderRadius: 16, maxWidth: 500,
                                width: '100%', maxHeight: '85vh', overflow: 'auto',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{selectedCafeteriaItem.category}</span>
                                    <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{selectedCafeteriaItem.name}</h2>
                                    <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontSize: '0.9rem' }}>{selectedCafeteriaItem.description}</p>
                                </div>
                                <button onClick={() => setSelectedCafeteriaItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Order Config */}
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600 }}>Precio:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedCafeteriaItem.price}</span>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Tamaño:</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['Pequeño', 'Mediano', 'Grande'].map(size => (
                                            <button key={size} style={{ flex: 1, padding: '0.5rem', border: '2px solid #E5E7EB', borderRadius: 8, background: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button style={{
                                    width: '100%', padding: '0.875rem', border: 'none', borderRadius: 10,
                                    background: 'var(--primary)', color: 'white', fontWeight: 600,
                                    fontSize: '1rem', cursor: 'pointer'
                                }}>
                                    🛒 Agregar al Pedido
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>💬 Opiniones sobre {selectedCafeteriaItem.name}</h3>

                                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {(apiComments || []).filter(c => c.producto === selectedCafeteriaItem.name).length === 0 ? (
                                        <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                                            Sé el primero en opinar sobre este producto
                                        </p>
                                    ) : (
                                        (apiComments || []).filter(c => c.producto === selectedCafeteriaItem.name).slice(0, 5).map(c => (
                                            <div key={c.id} style={{ padding: '0.75rem', background: '#F9FAFB', borderRadius: 8, marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <strong style={{ fontSize: '0.85rem' }}>{c.nombreUsuario || 'Anónimo'}</strong>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        background: c.sentimiento === 'POSITIVO' ? '#D1FAE5' : c.sentimiento === 'NEGATIVO' ? '#FEE2E2' : '#FEF3C7',
                                                        padding: '2px 8px', borderRadius: 12
                                                    }}>
                                                        <img
                                                            src={c.sentimiento === 'POSITIVO' ? '/assets/sentiments/alegre.png' : c.sentimiento === 'NEGATIVO' ? '/assets/sentiments/triste.png' : '/assets/sentiments/neutro.png'}
                                                            alt={c.sentimiento}
                                                            style={{ height: 18, width: 18, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151' }}>{c.texto}</p>
                                                {c.respuesta && (
                                                    <div style={{ marginTop: 8, padding: '0.5rem', background: '#ECFDF5', borderRadius: 6, borderLeft: '3px solid #10B981' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>✓ Respuesta:</span>
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#065F46' }}>{c.respuesta}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Comment Form */}
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleDetailComment(selectedCafeteriaItem.name, e.target.comment.value, parseInt(e.target.rating.value) || 5);
                                    e.target.reset();
                                }} style={{ marginTop: '1rem' }}>
                                    <input name="rating" type="hidden" defaultValue="5" />
                                    <textarea
                                        name="comment"
                                        placeholder={`¿Qué te pareció ${selectedCafeteriaItem.name}?`}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: 8, resize: 'none', fontSize: '0.9rem' }}
                                        rows={2}
                                        required
                                    />
                                    <button type="submit" style={{
                                        marginTop: 8, width: '100%', padding: '0.5rem', border: 'none',
                                        borderRadius: 8, background: '#10B981', color: 'white', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        Enviar Opinión
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PortalDashboard />

            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={goHome} className="icon-btn" title="Volver al Hub" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <Home size={24} />
                    </button>
                    <span className="brand-icon">📚</span>
                    <span className="brand-text">SentiEntorno</span>
                </div>

                <div className="nav-links">
                    <a href="#" className="nav-link active">Inicio</a>
                    <a href="#" className="nav-link">Libros Digitales</a>
                    <a href="#" className="nav-link">Audiolibros</a>
                    <a href="#" className="nav-link">Contenido Gratis</a>
                    <a href="#" className="nav-link">Autores</a>
                    <a href="#" className="nav-link highlight">Biblioteca Premium</a>
                </div>

                <div className="nav-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Buscar..." />
                    </div>
                    <button className="cart-btn">
                        <ShoppingCart size={20} />
                        <span className="cart-badge">2</span>
                    </button>
                    <ThemeToggle />
                    {user ? (
                        <div className="user-menu">
                            <span className="user-name">{user.username}</span>
                            <button onClick={logout} className="logout-btn">
                                Salir
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setAuthOpen(true)} className="login-btn">
                            Iniciar Sesión
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content Grid */}
            <div className="main-content-grid">
                {/* Left: Hero + Content */}
                <div className="content-main">
                    <HeroBanner />

                    {/* Module Tabs */}
                    <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Dynamic Module Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderModuleContent()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Comment Section */}
                    <div className="comment-section">
                        <div className="comment-header">
                            <h3>
                                <MessageSquare size={22} />
                                Voces de la Comunidad - {activeTab}
                                {connected && <span className="live-indicator" title="En vivo"></span>}
                            </h3>
                        </div>

                        {/* Comment Form */}
                        <form onSubmit={sendComment} className="comment-form">
                            {/* Only show name/email fields for guests (not logged in) */}
                            {!user ? (
                                <div className="form-row">
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Tu nombre (opcional)"
                                        className="form-input half"
                                    />
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        placeholder="Tu email (opcional)"
                                        className="form-input half"
                                    />
                                </div>
                            ) : (
                                <div className="logged-in-user-info">
                                    <span>✨ Comentando como <strong>{user.username}</strong></span>
                                </div>
                            )}

                            <StarRating rating={rating} setRating={setRating} />

                            {/* Product Selector */}
                            <div className="product-selector" style={{ margin: '1rem 0' }}>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #E5E7EB' }}
                                >
                                    <option value="">-- Selecciona lo que estás comentando (Opcional) --</option>
                                    {activeTab === 'LIBROS' && bookCollection.map((b, i) => (
                                        <option key={i} value={b.title}>{b.title} (Libro)</option>
                                    ))}
                                    {activeTab === 'CAFETERIA' && cafeteriaMenu.flatMap(c => c.items).map((item, i) => (
                                        <option key={i} value={item.name}>{item.name} ({item.price})</option>
                                    ))}
                                    {activeTab === 'TERTULIAS' && tertuliasData.map((t, i) => (
                                        <option key={i} value={t.title}>{t.title} (Evento)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="textarea-wrapper">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={`Comparte tu experiencia sobre ${activeTab.toLowerCase()}...`}
                                    className="form-textarea"
                                />
                                <button
                                    type="submit"
                                    className="submit-inline-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List - Now Gravity Wall */}
                        <GravityCommentWall comments={displayComments} />
                    </div>
                </div>

                {/* Right: Authors Sidebar */}
                <div className="content-sidebar">
                    <PopularAuthorsSidebar />
                </div>
            </div>

            {/* Footer with Copyright */}
            {/* Footer with Copyright */}
            <CreditsFooter />
        </div>
    );
};

export default Libreria;
