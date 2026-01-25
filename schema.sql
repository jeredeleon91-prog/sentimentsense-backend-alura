-- Esquema de Base de Datos para SentimentSense SaaS

CREATE DATABASE IF NOT EXISTS sentimentsense_db;
USE sentimentsense_db;

-- 1. TABLA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_empresa VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    plan ENUM('free', 'basic', 'premium') DEFAULT 'free',
    limite_mensual INT DEFAULT 100,
    usado_este_mes INT DEFAULT 0,
    contacto_email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usar_rating_en_analisis BOOLEAN DEFAULT FALSE,
    peso_rating INT DEFAULT 30,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_api_key (api_key)
);

-- 1.1 TABLA USUARIOS (Dashboard Access)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CLIENTE', 'USER') NOT NULL,
    cliente_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 2. TABLA DEPARTAMENTOS_CLIENTE
CREATE TABLE IF NOT EXISTS departamentos_cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    codigo VARCHAR(20),
    descripcion TEXT,
    color_hex VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    UNIQUE KEY uk_cliente_depto (cliente_id, nombre)
);

-- 3. TABLA ANALISIS
CREATE TABLE IF NOT EXISTS analisis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    departamento_id INT,
    usuario_id BIGINT,  -- Optional: link to registered user (NULL for guests)
    texto TEXT NOT NULL,
    nombre_usuario VARCHAR(100),
    email_usuario VARCHAR(100),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    fuente VARCHAR(50) DEFAULT 'web',
    sentimiento ENUM('POSITIVO', 'NEUTRO', 'NEGATIVO') NOT NULL,
    probabilidad DECIMAL(5,4) NOT NULL,
    palabras_clave JSON,
    ip_solicitud VARCHAR(45),
    user_agent TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    necesita_seguimiento BOOLEAN DEFAULT FALSE,
    seguimiento_estado ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO') DEFAULT 'PENDIENTE',
    seguimiento_notas TEXT,
    seguimiento_fecha_respuesta TIMESTAMP NULL,
    respuesta TEXT,
    producto VARCHAR(100), -- Nueva columna para análisis por producto
    respuesta_sentimiento ENUM('POSITIVO', 'NEUTRO', 'NEGATIVO'),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (departamento_id) REFERENCES departamentos_cliente(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_cliente_fecha (cliente_id, fecha_solicitud)
);

-- 4. TABLA SEGUIMIENTO_NEGATIVOS
CREATE TABLE IF NOT EXISTS seguimiento_negativos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analisis_id BIGINT NOT NULL,
    cliente_id INT NOT NULL,
    prioridad ENUM('ALTA', 'MEDIA', 'BAJA') DEFAULT 'MEDIA',
    etapa ENUM('DETECTADO', 'ASIGNADO', 'PRIMER_CONTACTO', 'SEGUIMIENTO', 'RESUELTO') DEFAULT 'DETECTADO',
    intentos_contacto INT DEFAULT 0,
    ultimo_intento TIMESTAMP NULL,
    proximo_seguimiento TIMESTAMP NULL,
    tiempo_deteccion_horas INT,
    tiempo_resolucion_horas INT,
    resolucion_exitosa BOOLEAN DEFAULT NULL,
    feedback_cliente JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (analisis_id) REFERENCES analisis(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    INDEX idx_estado_prioridad (etapa, prioridad)
);

-- 5. TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    departamento_id INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos_cliente(id) ON DELETE SET NULL,
    UNIQUE KEY uk_cliente_producto (cliente_id, nombre)
);

-- VISTA PROFESIONAL PARA REPORTES EJECUTIVOS
CREATE OR REPLACE VIEW vista_reporte_ejecutivo AS
SELECT 
    c.nombre_empresa,
    COUNT(a.id) as total_analisis,
    SUM(CASE WHEN a.sentimiento = 'POSITIVO' THEN 1 ELSE 0 END) as total_positivos,
    SUM(CASE WHEN a.sentimiento = 'NEGATIVO' THEN 1 ELSE 0 END) as total_negativos,
    ROUND(AVG(a.probabilidad) * 100, 2) as confianza_promedio_modelo,
    (SELECT COUNT(*) FROM seguimiento_negativos sn WHERE sn.cliente_id = c.id AND sn.etapa != 'RESUELTO') as casos_pendientes_seguimiento
FROM clientes c
LEFT JOIN analisis a ON c.id = a.cliente_id
GROUP BY c.id;

-- 5. TABLA RESPUESTAS DE COMENTARIOS (Hilos de conversación)
CREATE TABLE IF NOT EXISTS respuestas_comentarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    analisis_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    autor_tipo ENUM('CLIENTE', 'ADMIN', 'USUARIO') NOT NULL,
    autor_nombre VARCHAR(100),
    texto TEXT NOT NULL,
    sentimiento ENUM('POSITIVO', 'NEUTRO', 'NEGATIVO'),
    probabilidad DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES respuestas_comentarios(id) ON DELETE CASCADE,
    INDEX idx_analisis_fecha (analisis_id, created_at)
);

-- VISTA PARA ESTADÍSTICAS DE RATINGS POR CLIENTE
CREATE OR REPLACE VIEW vista_rating_stats AS
SELECT 
    c.id as cliente_id,
    c.nombre_empresa,
    COUNT(a.rating) as total_con_rating,
    ROUND(AVG(a.rating), 2) as rating_promedio,
    SUM(CASE WHEN a.rating >= 4 THEN 1 ELSE 0 END) as ratings_altos,
    SUM(CASE WHEN a.rating <= 2 THEN 1 ELSE 0 END) as ratings_bajos,
    -- Satisfacción basada en combinación de sentimiento y rating
    ROUND(
        (SUM(CASE WHEN a.sentimiento = 'POSITIVO' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0)) * 0.6 +
        (AVG(a.rating) * 20.0) * 0.4,
    2) as indice_satisfaccion
FROM clientes c
LEFT JOIN analisis a ON c.id = a.cliente_id
GROUP BY c.id;

-- 6. USUARIO ADMINISTRADOR DE SISTEMA
-- Usuario: administrador | Password: administrador
-- Hash BCrypt generado directamente desde Spring Boot
INSERT INTO usuarios (username, password, role, cliente_id) 
VALUES ('administrador', '$2a$10$4AYrel6qgBFspLumHkSICutRcn7NtZnVEKsvPgyWKyA1kYiAwOcp.', 'ADMIN', NULL);
