import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'CLIENTE')) {
            // Redirect if not a client (or allow Admin)
            //  navigate('/login'); 
            // For demo purposes, we might show a mock or require login
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        // Fetch stats
        // Mock for now or fetch from /api/v1/dashboard/estadisticas
        // Here we assume fetch logic similar to Libreria
        const mockStats = {
            totalComentarios: 1540,
            sentimientoPositivo: 65,
            sentimientoNegativo: 10,
            sentimientoNeutro: 25,
            modulos: [
                { nombre: 'Biblioteca', comentarios: 800 },
                { nombre: 'Cafetería', comentarios: 450 },
                { nombre: 'Tertulias', comentarios: 290 }
            ]
        };
        setStats(mockStats);
    }, []);

    if (!stats) return <div className="p-10 text-center">Cargando Estadísticas...</div>;

    const barData = {
        labels: stats.modulos.map(m => m.nombre),
        datasets: [{
            label: 'Comentarios por Módulo',
            data: stats.modulos.map(m => m.comentarios),
            backgroundColor: ['#8B0000', '#D4AF37', '#26619C']
        }]
    };

    const pieData = {
        labels: ['Positivo', 'Neutro', 'Negativo'],
        datasets: [{
            data: [stats.sentimientoPositivo, stats.sentimientoNeutro, stats.sentimientoNegativo],
            backgroundColor: ['#2E8B57', '#B8860B', '#B22222']
        }]
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-white rounded-xl shadow-lg border-l-4 border-[var(--color-venetian-red)]"
            >
                <h2 className="text-3xl font-bold font-serif text-[var(--color-venetian-red)]">
                    Panel de Control Analítico
                </h2>
                <p className="text-[var(--color-umber)]">Bienvenido, {user?.username || 'Cliente'}. Monitorizando el pulso de tu entorno.</p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[var(--color-gold)] text-center">
                    <h3 className="text-lg font-bold text-gray-500">Total Interacciones</h3>
                    <div className="text-4xl font-bold text-[var(--color-sepia)]">{stats.totalComentarios}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600 text-center">
                    <h3 className="text-lg font-bold text-gray-500">Satisfacción</h3>
                    <div className="text-4xl font-bold text-green-600">{stats.sentimientoPositivo}%</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-600 text-center">
                    <h3 className="text-lg font-bold text-gray-500">Críticas</h3>
                    <div className="text-4xl font-bold text-red-600">{stats.sentimientoNegativo}%</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-4 text-center">Distribución de Sentimiento</h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-4 text-center">Actividad por Módulo</h3>
                    <div className="h-64">
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
