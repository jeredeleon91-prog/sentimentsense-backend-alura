-- Script para crear o restablecer el usuario administrador
-- Base de datos: sentimentsense_db

USE sentimentsense_db;

-- Usuario: administrador
-- Contraseña: administrador
-- Hash BCrypt: $2a$10$4AYrel6qgBFspLumHkSICutRcn7NtZnVEKsvPgyWKyA1kYiAwOcp.

INSERT INTO usuarios (username, password, role, cliente_id) 
VALUES ('administrador', '$2a$10$4AYrel6qgBFspLumHkSICutRcn7NtZnVEKsvPgyWKyA1kYiAwOcp.', 'ADMIN', NULL)
ON DUPLICATE KEY UPDATE 
    password = '$2a$10$4AYrel6qgBFspLumHkSICutRcn7NtZnVEKsvPgyWKyA1kYiAwOcp.',
    role = 'ADMIN';

-- Verificación
SELECT id, username, role FROM usuarios WHERE username = 'administrador';
