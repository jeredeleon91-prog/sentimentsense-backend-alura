/*
 * Fecha de Creación: 30/12/2025
 * Fecha de Actualización: 30/12/2025
 * (c) Jeremias de Leon
 * Grupo: H12-25-L-Equipo 37
 * Contacto: jeredeleon@yahoo.com
 */

// Servicio API Centralizado con autenticación requerida
// Usa la variable de entorno VITE_API_URL en producción, con fallback a localhost para desarrollo
// Servicio API Centralizado con autenticación requerida
// Usa la variable de entorno VITE_API_URL en producción, con fallback a localhost para desarrollo
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ==========================================
// CONFIGURACIÓN CENTRAL DE API KEYS
// ==========================================
// Las claves no deben estar en el repositorio. Usa variables de entorno
// en desarrollo/producción. Añade un archivo `frontend/.env` basado en
// `frontend/.env.example` y define `VITE_LIBRERIA_API_KEY` y
// `VITE_ZAPATERIA_API_KEY`.
export const LIBRERIA_API_KEY = import.meta.env.VITE_LIBRERIA_API_KEY || 'REPLACE_ME_LIBRERIA_KEY';
export const ZAPATERIA_API_KEY = import.meta.env.VITE_ZAPATERIA_API_KEY || 'REPLACE_ME_ZAPATERIA_KEY';

// API Key por defecto (Usamos Librería como fallback)
const DEFAULT_KEY = LIBRERIA_API_KEY;
let currentApiKey = import.meta.env.VITE_API_KEY || DEFAULT_KEY;

export const setGlobalApiKey = (key) => {
    console.log(`[API] Switching API Key to: ${key}`);
    currentApiKey = key;
    localStorage.setItem('active_api_key', key);
};

export const getGlobalApiKey = () => {
    return currentApiKey;
};

// Carga la clave API almacenada en localStorage si existe
const storedKey = localStorage.getItem('active_api_key');
if (storedKey) currentApiKey = storedKey;

// Encabezados comunes para todas las solicitudes (incluye bypass de ngrok)
const commonHeaders = {
    'ngrok-skip-browser-warning': 'true',
};

export const api = {
    // Solicitud GET con clave API
    get: async (path, options = {}) => {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: {
                ...commonHeaders,
                'X-API-KEY': currentApiKey,
                ...options.headers
            },
            ...options
        });
        return response;
    },

    // Solicitud POST con clave API y módulo opcional
    post: async (path, body, modulo = null) => {
        const headers = {
            ...commonHeaders,
            'Content-Type': 'application/json',
            'X-API-KEY': currentApiKey,
        };

        if (modulo) {
            headers['X-Modulo'] = modulo;
        }

        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        return response;
    },

    // Endpoints de autenticación (no requieren clave API para login)
    auth: {
        login: async (username, password) => {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    ...commonHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            return response;
        },

        register: async (username, password, email) => {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    ...commonHeaders,
                    'Content-Type': 'application/json',
                    'X-API-KEY': currentApiKey
                },
                body: JSON.stringify({ username, password, email })
            });
            return response;
        }
    },

    // Expose API_BASE for WebSocket connections
    API_BASE: API_BASE
};

export { currentApiKey as API_KEY };
export default api;
