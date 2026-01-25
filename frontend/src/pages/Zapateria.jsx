/*
 * Fecha de Creación: 17/01/2026
 * Autor: Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 * Descripción: Componente principal de la demostración "Zapatería".
 * Simula una tienda e-commerce completa con catálogo, carrito de compras, 
 * selección de tallas e integración con el backend de SentimentSense para reseñas.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Search, Star, MessageCircle,
    X, Heart, TrendingUp, Trash2, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIsMobile } from '../hooks/useMediaQuery';
import AuthModal from '../components/AuthModal';
import CreditsFooter from '../components/CreditsFooter';
import ThemeToggle from '../components/ThemeToggle';
import api, { setGlobalApiKey, ZAPATERIA_API_KEY } from '../services/api';
import './Zapateria.css';

// ==========================================
// CONFIGURACIÓN DE LA DEMO
// ==========================================

// Usamos la clave importada de api.js para centralizar la configuración
// const ZAPATERIA_API_KEY está definida en services/api.js

// ==========================================
// DATOS MOCKADOS (SIMULACIÓN DE BASE DE DATOS)
// ==========================================

/**
 * Catálogo de productos disponibles en la tienda.
 * En una implementación real, esto vendría de un endpoint GET /api/productos.
 */
const coleccionZapatos = [
    {
        id: 'z-101',
        titulo: 'Air Zoom Pegasus 40',
        marca: 'Nike',
        precio: 1299.00,
        precioTexto: 'Q1,299',
        categoria: 'RUNNING',
        imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        rating: 4.8,
        tallas: [38, 39, 40, 41, 42, 43],
        descripcion: 'El caballo de batalla con alas regresa. Una pisada elástica para cada carrera, con la sensación familiar de Pegasus, solo para ti.'
    },
    {
        id: 'z-102',
        titulo: 'Ultraboost Light',
        marca: 'Adidas',
        precio: 1450.00,
        precioTexto: 'Q1,450',
        categoria: 'RUNNING',
        imagen: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop',
        rating: 4.9,
        tallas: [39, 40, 41, 42],
        descripcion: 'Siente la energía épica con el nuevo Ultraboost Light, nuestro Ultraboost más ligero hasta la fecha. La magia está en la entresuela Light BOOST.'
    },
    {
        id: 'z-103',
        titulo: 'Chuck 70 Vintage',
        marca: 'Converse',
        precio: 850.00,
        precioTexto: 'Q850',
        categoria: 'CASUAL',
        imagen: 'https://images.unsplash.com/photo-1627409279401-20907f164ac0?q=80&w=1000&auto=format&fit=crop', // Better Converse/Sneaker image
        rating: 4.7,
        tallas: [36, 37, 38, 39, 40, 41, 42, 43],
        descripcion: 'Las Chuck 70 combinan los mejores detalles de las Chuck de los 70 con una artesanía impecable y materiales premium.'
    },
    {
        id: 'z-104',
        titulo: 'Classic Leather',
        marca: 'Reebok',
        precio: 799.00,
        precioTexto: 'Q799',
        categoria: 'CASUAL',
        imagen: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
        rating: 4.5,
        tallas: [40, 41, 42, 44],
        descripcion: 'Un lienzo en blanco para tu estilo. Estas zapatillas Classic Leather cuentan con líneas nítidas y colores sólidos.'
    },
    {
        id: 'z-105',
        titulo: 'Mocasin Italiano Jordaan',
        marca: 'Gucci',
        precio: 5200.00,
        precioTexto: 'Q5,200',
        categoria: 'FORMAL',
        imagen: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=1000&auto=format&fit=crop',
        rating: 5.0,
        tallas: [40, 41, 42],
        descripcion: 'El mocasín Jordaan es un zapato clave de Gucci con su forma esbelta y el detalle de Horsebit.'
    }
];

// Configuración de Departamentos (Mapeo Frontend -> Backend)
const DEPARTAMENTOS_CONFIG = {
    'ALL': { codigo: 'ZAPATOS', nombre: 'General' },
    'RUNNING': { codigo: 'RUN', nombre: 'Running' },
    'CASUAL': { codigo: 'CAS', nombre: 'Casual' },
    'FORMAL': { codigo: 'FOR', nombre: 'Formal' }
};

// Categorías para filtrado (UI)
const categorias = [
    { id: 'ALL', etiqueta: 'Todo' },
    { id: 'RUNNING', etiqueta: 'Running' },
    { id: 'CASUAL', etiqueta: 'Casual' },
    { id: 'FORMAL', etiqueta: 'Formal' }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Zapateria = () => {
    // ------------------------------------------
    // ESTADOS (HOOKS)
    // ------------------------------------------

    // ------------------------------------------
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // Configuración Inicial e Integración API
    useEffect(() => {
        // Establecer la API Key global para que todas las peticiones (login, comentarios)
        // se identifiquen como provenientes de la "Zapatería Demo"
        setGlobalApiKey(ZAPATERIA_API_KEY);
    }, []);

    // Estado de Interfaz y Datos
    const [categoriaActiva, setCategoriaActiva] = useState('ALL');
    const [zapatoSeleccionado, setZapatoSeleccionado] = useState(null);
    const [comentarios, setComentarios] = useState([]);

    // Lógica de Carrito de Compras (Tienda)
    const [carrito, setCarrito] = useState([]);
    const [carritoAbierto, setCarritoAbierto] = useState(false);

    // Autenticación y Contexto de Usuario
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
    const { user } = useAuth();

    // Ref para acceso dentro de callbacks de WebSocket
    const categoriaActivaRef = React.useRef(categoriaActiva);
    useEffect(() => { categoriaActivaRef.current = categoriaActiva; }, [categoriaActiva]);

    // WebSocket: Escuchar comentarios en tiempo real desde el backend
    // Pasamos API (Url), null (clientId), callbacks, y el topic público
    const { connected: wsConnected } = useWebSocket(api.API_BASE, null,
        (data) => {
            // Filtrar mensajes en tiempo real: Solo agregar si coinciden con el módulo activo o si estamos en General y el mensaje es General
            const currentCode = DEPARTAMENTOS_CONFIG[categoriaActivaRef.current].codigo;
            // Si estamos en ALL (ZAPATOS), aceptamos ZAPATOS. Si estamos en RUN, aceptamos RUN, etc.
            // Opcional: Si estamos en ALL, ¿deberíamos ver todo? Por ahora, mantengamos aislamiento: ALL ve General.
            if (data.modulo === currentCode) {
                setComentarios(prev => [data, ...prev]);
            }
        }, // onNewComment
        (data) => setComentarios(prev => prev.map(c => c.id === data.commentId ? { ...c, respuesta: data.respuesta } : c)), // onReplyAdded
        '/topic/comentarios' // Custom Topic
    );

    // ------------------------------------------
    // EFECTOS Y CARGA DE DATOS
    // ------------------------------------------

    /**
     * Cargar comentarios existentes desde el backend al iniciar.
     * Endpoint: GET /api/v1/comentarios
     */
    /**
     * Cargar comentarios existentes desde el backend al cambiar categoría.
     * Endpoint: GET /api/v1/comentarios?modulo=CODE
     */
    useEffect(() => {
        const cargarComentarios = async () => {
            try {
                const codigoModulo = DEPARTAMENTOS_CONFIG[categoriaActiva].codigo;
                const res = await api.get(`/api/v1/comentarios?modulo=${codigoModulo}`);
                if (res.ok) setComentarios(await res.json());
            } catch (e) { console.error("Error cargando comentarios:", e); }
        };

        cargarComentarios();

        // Polling de respaldo cada 10s para asegurar consistencia
        const intervalo = setInterval(cargarComentarios, 10000);
        return () => clearInterval(intervalo);
    }, [categoriaActiva]);

    // ------------------------------------------
    // LÓGICA DE NEGOCIO (STORE LOGIC)
    // ------------------------------------------

    // Combinar comentarios históricos (API) con los nuevos (WebSocket)
    const todosLosComentarios = comentarios.slice(0, 50);

    // Filtrar catálogo según categoría seleccionada
    const zapatosFiltrados = categoriaActiva === 'ALL'
        ? coleccionZapatos
        : coleccionZapatos.filter(s => s.categoria === categoriaActiva);

    // Agregar item al carrito
    const agregarAlCarrito = (producto, talla) => {
        const nuevoItem = { ...producto, tallaSeleccionada: talla, uid: Date.now() };
        setCarrito([...carrito, nuevoItem]);
        setCarritoAbierto(true); // Abrir carrito sidebar para feedback visual
        setZapatoSeleccionado(null); // Cerrar modal de producto
    };

    // Remover item del carrito
    const removerDelCarrito = (uid) => {
        setCarrito(carrito.filter(item => item.uid !== uid));
    };

    // Calcular total del carrito
    const totalCarrito = carrito.reduce((acc, item) => acc + item.precio, 0);

    // ------------------------------------------
    // RENDERIZADO (JSX)
    // ------------------------------------------
    return (
        <div className="zapateria-container">
            {/* Modal de Login (Reutilizable) */}
            <AuthModal isOpen={modalAuthAbierto} onClose={() => setModalAuthAbierto(false)} />

            {/* Barra de Navegación Superior */}
            <header className="z-header">
                <div className="z-brand-row">
                    <button onClick={() => navigate('/')} className="icon-btn" title="Volver al Hub">
                        <Home size={24} />
                    </button>
                    <div className="z-brand">
                        <ShoppingBag size={28} />
                        <span>Zapatos<b>Ya!</b></span>
                    </div>
                </div>

                {/* Menú de Categorías */}
                <nav className="z-nav">
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            className={categoriaActiva === cat.id ? 'active' : ''}
                            onClick={() => setCategoriaActiva(cat.id)}
                        >
                            {cat.etiqueta}
                        </button>
                    ))}
                </nav>

                {/* Acciones de Usuario */}
                <div className="z-actions">
                    <ThemeToggle />
                    <button className="icon-btn" onClick={() => setCarritoAbierto(true)}>
                        <ShoppingBag size={20} />
                        {carrito.length > 0 && <span className="badge-count">{carrito.length}</span>}
                    </button>

                    {user ? (
                        <div className="user-pill">{user.username}</div>
                    ) : (
                        <button className="login-btn" onClick={() => setModalAuthAbierto(true)}>Login</button>
                    )}
                </div>
            </header>

            {/* Sidebar del Carrito */}
            <CarritoSidebar
                isOpen={carritoAbierto}
                onClose={() => setCarritoAbierto(false)}
                items={carrito}
                onRemove={removerDelCarrito}
                total={totalCarrito}
            />

            {/* Banner Principal (Hero) */}
            <section className="z-hero">
                <div className="hero-text">
                    <motion.h1
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        Corre hacia <br />tu destino.
                    </motion.h1>
                    <p>La mejor tecnología y diseño para tus pies.</p>
                    <button className="cta-btn">
                        Ver Colección <TrendingUp size={16} />
                    </button>
                </div>
                <div className="hero-img">
                    <img src="https://parspng.com/wp-content/uploads/2023/02/shoespng.parspng.com-11.png" alt="Zapato Hero" />
                </div>
            </section>

            {/* Grid de Productos */}
            <main className="z-catalog">
                <div className="catalog-grid">
                    {zapatosFiltrados.map(zapato => (
                        <motion.div
                            key={zapato.id}
                            className="shoe-card"
                            layout
                            whileHover={{ y: -10 }}
                            onClick={() => setZapatoSeleccionado(zapato)}
                        >
                            <div className="shoe-img-box">
                                <img src={zapato.imagen} alt={zapato.titulo} />
                                <button className="fav-btn" onClick={(e) => { e.stopPropagation(); /* Lógica Favoritos */ }}>
                                    <Heart size={14} />
                                </button>
                            </div>
                            <div className="shoe-info">
                                <span className="brand">{zapato.marca}</span>
                                <h3>{zapato.titulo}</h3>
                                <div className="bottom-row">
                                    <span className="price">{zapato.precioTexto}</span>
                                    <div className="rating">
                                        <Star size={12} fill="#FFD700" color="#FFD700" />
                                        {zapato.rating}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* SECCIÓN DE RESEÑAS GENERALES (Añadido por solicitud) */}
            <section className="z-reviews-wall">
                <div className="wall-header">
                    <h2><MessageCircle size={24} /> Voces de la Comunidad - {DEPARTAMENTOS_CONFIG[categoriaActiva].nombre}</h2>
                    <p>Cuéntanos tu experiencia de compra o lo que piensas de nuestros productos.</p>
                </div>

                <div className="wall-content">
                    {/* Formulario General */}
                    <div className="wall-form-card">
                        <h3>Deja tu opinión</h3>
                        <WallForm user={user} moduloCodigo={DEPARTAMENTOS_CONFIG[categoriaActiva].codigo} />
                    </div>
                    {/* Muro de Comentarios (Reutilizando el concepto visual transparente/moderno) */}
                    <div className="wall-feed">
                        {
                            todosLosComentarios.length === 0 ? (
                                <p className="empty-wall">Sé el primero en opinar.</p>
                            ) : (
                                <div className="wall-grid">
                                    {todosLosComentarios.map((c, i) => (
                                        <motion.div
                                            key={i}
                                            className="wall-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="wall-card-header">
                                                <strong>{c.nombreUsuario}</strong>
                                                <span className={`badge ${c.sentimiento}`}>
                                                    {c.sentimiento === 'POSITIVO' ? '😊' : c.sentimiento === 'NEGATIVO' ? '😠' : '😐'}
                                                </span>
                                            </div>
                                            <p>"{c.texto}"</p>
                                            {c.respuesta && (
                                                <div className="reply">
                                                    <span>↪ Respuesta de ZapatosYa!:</span> {c.respuesta}
                                                </div>
                                            )}
                                            {c.producto && <span className="product-tag">Sobre: {c.producto}</span>}
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        }
                    </div >
                </div >
            </section >

            {/* Modal de Detalle de Producto */}
            < AnimatePresence >
                {zapatoSeleccionado && (
                    <ModalProducto
                        zapato={zapatoSeleccionado}
                        onClose={() => setZapatoSeleccionado(null)}
                        comentarios={todosLosComentarios.filter(c => c.producto === zapatoSeleccionado.titulo || c.productoId === zapatoSeleccionado.id)}
                        usuario={user}
                        onAgregarAlCarrito={agregarAlCarrito}
                        moduloCodigo={DEPARTAMENTOS_CONFIG[categoriaActiva].codigo}
                    />
                )}


            </AnimatePresence>
            <CreditsFooter />
        </div>
    );
};

// ==========================================
// SUB-COMPONENTES
// ==========================================

/**
 * Formulario del Muro de Voces
 */
const WallForm = ({ user, moduloCodigo }) => {
    const [text, setText] = useState('');
    const [rating, setRating] = useState(5);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            await api.post('/api/v1/analizar', {
                texto: text,
                nombreUsuario: user?.username || 'Cliente',
                rating: rating,
                modulo: moduloCodigo
            });
            setText('');
            setRating(5);
        } catch (err) { console.error(err); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="rating-row">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={20}
                        fill={star <= rating ? "#FFD700" : "none"}
                        color={star <= rating ? "#FFD700" : "#ccc"}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="¿Qué te pareció el servicio?"
                required
            />
            <button type="submit">Enviar Opinión</button>
        </form>
    );
};

/**
 * Sidebar deslizante para el Carrito de Compras.
 */
const CarritoSidebar = ({ isOpen, onClose, items, onRemove, total }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <div className="sidebar-overlay" onClick={onClose} />
                <motion.div
                    className="cart-sidebar"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                >
                    <div className="cart-header">
                        <h2>Tu Carrito ({items.length})</h2>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>

                    <div className="cart-items">
                        {items.length === 0 ? (
                            <p className="empty-cart">Tu carrito está vacío.</p>
                        ) : (
                            items.map(item => (
                                <div key={item.uid} className="cart-item">
                                    <img src={item.imagen} alt={item.titulo} />
                                    <div className="cart-item-info">
                                        <h4>{item.titulo}</h4>
                                        <p>Talla: {item.tallaSeleccionada}</p>
                                        <span>{item.precioTexto}</span>
                                    </div>
                                    <button onClick={() => onRemove(item.uid)} className="remove-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="total-row">
                            <span>Total Estimado:</span>
                            <span className="total-price">Q{total.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn">Proceder al Pago</button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

/**
 * Modal Detalle de Producto.
 * Maneja la selección de tallas y la interacción con la API de comentarios.
 */
const ModalProducto = ({ zapato, onClose, comentarios, usuario, onAgregarAlCarrito, moduloCodigo }) => {
    const [comentarioTexto, setComentarioTexto] = useState('');
    const [ratingUsuario, setRatingUsuario] = useState(0);
    const [tallaSeleccionada, setTallaSeleccionada] = useState(null);

    // Enviar comentario al Backend de SentimentSense
    const enviarComentario = async (e) => {
        e.preventDefault();
        if (!comentarioTexto.trim()) return;

        try {
            await api.post('/api/v1/analizar', {
                texto: comentarioTexto,
                nombreUsuario: usuario?.username || 'Invitado',
                rating: ratingUsuario || 5,

                producto: zapato.titulo,
                // productoId: zapato.id, // Omitido por ser string (backend espera Long)
                modulo: moduloCodigo      // Usar módulo activo (RUN, CAS, etc)
            });
            setComentarioTexto('');
            setRatingUsuario(0);
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor de análisis.');
        }
    };

    const manejarCompra = () => {
        if (!tallaSeleccionada) {
            alert("Por favor selecciona una talla.");
            return;
        }
        onAgregarAlCarrito(zapato, tallaSeleccionada);
    };

    return (
        <div className="z-modal-overlay" onClick={onClose}>
            <motion.div
                className="z-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {/* Columna Izquierda: Imagen */}
                <div className="modal-left">
                    <img src={zapato.imagen} alt={zapato.titulo} />
                </div>

                {/* Columna Derecha: Info y Reseñas */}
                <div className="modal-right">
                    <span className="brand-tag">{zapato.marca}</span>
                    <h2>{zapato.titulo}</h2>
                    <span className="price-lg">{zapato.precioTexto}</span>

                    <p className="desc">{zapato.descripcion}</p>

                    {/* Selector de Tallas */}
                    <div className="size-selector">
                        <label>Tallas disponibles:</label>
                        <div className="sizes-grid">
                            {zapato.tallas.map(talla => (
                                <button
                                    key={talla}
                                    className={`size-btn ${tallaSeleccionada === talla ? 'selected' : ''}`}
                                    onClick={() => setTallaSeleccionada(talla)}
                                >
                                    {talla}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="add-cart-btn" onClick={manejarCompra}>
                        Agregar al Carrito
                    </button>

                    {/* Sección de Reseñas (Integración Backend) */}
                    <div className="comments-section">
                        <h3>Opiniones de Clientes ({comentarios.length})</h3>
                        <div className="list">
                            {comentarios.length === 0 ? <p className="empty">Aún no hay opiniones. ¡Sé el primero!</p> :
                                comentarios.map((c, i) => (
                                    <div key={i} className="comment-item">
                                        <div className="comment-header">
                                            <strong>{c.nombreUsuario}</strong>
                                            {/* Etiqueta de Sentimiento generada por la IA */}
                                            <span className={`badge ${c.sentimiento}`}>
                                                {c.sentimiento === 'POSITIVO' ? '😊' : c.sentimiento === 'NEGATIVO' ? '😠' : '😐'}
                                            </span>
                                        </div>
                                        <p>{c.texto}</p>
                                        {/* Respuesta oficial del negocio si existe */}
                                        {c.respuesta && (
                                            <div className="reply">
                                                <span>↪ Respuesta de ZapatosYa!:</span> {c.respuesta}
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                        </div>

                        {/* Formulario de envío */}
                        <form onSubmit={enviarComentario}>
                            <div className="comment-inputs">
                                <div className="rating-selector">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={20}
                                            fill={star <= ratingUsuario ? "#FFD700" : "none"}
                                            color={star <= ratingUsuario ? "#FFD700" : "#ccc"}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setRatingUsuario(star)}
                                        />
                                    ))}
                                </div>
                                <div className="input-group">
                                    <input
                                        value={comentarioTexto}
                                        onChange={e => setComentarioTexto(e.target.value)}
                                        placeholder="Comparte tu experiencia..."
                                        required
                                    />
                                    <button type="submit" title="Enviar opinión"><MessageCircle size={16} /></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Zapateria;
