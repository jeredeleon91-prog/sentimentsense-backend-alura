import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error('Credenciales inválidas');

            const data = await res.json();
            const userData = { username: data.username, role: data.role };

            setUser(userData);
            setToken(data.token);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (username, password, email, apiKey) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ username, password, email })
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt);
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
