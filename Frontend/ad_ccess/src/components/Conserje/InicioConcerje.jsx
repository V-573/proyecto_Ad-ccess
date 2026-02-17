import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, LogIn, Clock, Home } from 'lucide-react'; // Iconos sugeridos

const InicioConserje = () => {
    const [resumen, setResumen] = useState({ total_presentes: 0, visitantes: [] });
    const [loading, setLoading] = useState(true);

    const cargarResumen = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/acceso/resumen-inicio', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumen(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar resumen", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResumen();
        // Opcional: Recargar cada 5 minutos automáticamente
        const interval = setInterval(cargarResumen, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-6 text-center">Cargando resumen...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control - Conserjería</h1>

            {/* Tarjetas de Resumen Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500 uppercase font-semibold">Visitantes en Sitio</p>
                            <p className="text-2xl font-bold text-gray-800">{resumen.total_presentes}</p>
                        </div>
                    </div>
                </div>
                {/* Puedes agregar más tarjetas aquí para Parqueaderos o Noticias */}
            </div>

            {/* Tabla de Personas que no han salido */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <LogIn size={18} className="text-green-600" /> 
                        Visitantes actualmente en la unidad
                    </h2>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">En tiempo real</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="p-4 font-medium">Visitante</th>
                                <th className="p-4 font-medium">Destino / Apto</th>
                                <th className="p-4 font-medium">Motivo</th>
                                <th className="p-4 font-medium">Hora Ingreso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {resumen.visitantes.length > 0 ? (
                                resumen.visitantes.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">{v.nombre_visitante}</div>
                                            <div className="text-xs text-gray-500">{v.identificacion_visitante}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Home size={14} /> {v.casa_apto}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                v.motivo === 'trabajador' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {v.motivo.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 flex items-center gap-2 text-sm">
                                            <Clock size={14} /> 
                                            {new Date(v.fecha_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400">
                                        No hay visitantes registrados en este momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InicioConserje;