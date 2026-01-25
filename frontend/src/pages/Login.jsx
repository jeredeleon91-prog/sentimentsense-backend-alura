import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData.username, formData.password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-[var(--color-venetian-red)]"
            >
                <div className="text-center mb-8">
                    <ShieldCheck size={48} className="mx-auto text-[var(--color-venetian-red)] mb-4" />
                    <h2 className="text-2xl font-bold font-serif text-[var(--color-sepia)]">Acceso Corporativo</h2>
                    <p className="text-sm text-gray-500">Solo personal autorizado</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-umber)] mb-2">Usuario / API ID</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-gold)] outline-none"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--color-umber)] mb-2">Contraseña</label>
                        <input
                            type="password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-gold)] outline-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded font-bold">{error}</div>}

                    <button type="submit" className="w-full py-3 bg-[var(--color-venetian-red)] text-white font-bold rounded-lg hover:bg-[var(--color-venetian-red-light)] transition shadow-lg">
                        Entrar al Sistema
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
