import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, LogOut, ClipboardList } from 'lucide-react';

const PantallaVisitantes = () => {
    const [visitantes, setVisitantes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [resultadosPropietarios, setResultadosPropietarios] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Estado para el nuevo registro
    const [nuevoVisitante, setNuevoVisitante] = useState({
        nombre: '',
        identificacion: '',
        usuario_visitado_id: '',
        motivo: 'personal',
        observaciones: '',
        nombrePropietario: '' // Solo para mostrar en el input
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarVisitantesActivos();
    }, []);

    const cargarVisitantesActivos = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/acceso/lista-gestion', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVisitantes(res.rows || res.data); // Depende de cómo envíes el JSON desde el backend
        } catch (error) {
            console.error("Error al cargar visitantes");
        }
    };

    // Buscador de propietarios en tiempo real
    const manejarBusquedaPropietario = async (e) => {
        const valor = e.target.value;
        setNuevoVisitante({ ...nuevoVisitante, nombrePropietario: valor });

        if (valor.length > 1) {
            try {
                const res = await axios.get(`http://localhost:4000/api/acceso/buscar-propietario?q=${valor}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResultadosPropietarios(res.data);
            } catch (error) {
                console.error("Error buscando propietario");
            }
        } else {
            setResultadosPropietarios([]);
        }
    };

    const seleccionarPropietario = (p) => {
        setNuevoVisitante({
            ...nuevoVisitante,
            usuario_visitado_id: p.id,
            nombrePropietario: `${p.nombre_completo} (${p.casa_apto})`
        });
        setResultadosPropietarios([]);
    };

    const registrarEntrada = async (e) => {
        e.preventDefault();

// 1. VALIDACIÓN: Evita enviar si no se ha seleccionado un propietario del buscador
    if (!nuevoVisitante.usuario_visitado_id) {
        alert("¡Atención! Debes buscar y seleccionar un propietario de la lista desplegable.");
        return;
    }

        const token = localStorage.getItem('token');

        // 2. PREPARACIÓN: Aseguramos que el ID sea un número y no un string vacío
    const datosParaEnviar = {
        ...nuevoVisitante,
        usuario_visitado_id: parseInt(nuevoVisitante.usuario_visitado_id)
    };


        try {
            await axios.post('http://localhost:4000/api/acceso/entrada', datosParaEnviar, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Entrada registrada con éxito");
            setNuevoVisitante({ nombre: '', identificacion: '', usuario_visitado_id: '', motivo: 'personal', observaciones: '', nombrePropietario: '' });
            cargarVisitantesActivos();
        } catch (error) {
            console.error("Error en la petición:", error.response?.data || error.message);
        alert(error.response?.data?.error || "Error al registrar entrada");
        }
    };

    const registrarSalida = async (id) => {
        try {
            await axios.put(`http://localhost:4000/api/acceso/salida/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarVisitantesActivos();
        } catch (error) {
            alert("Error al registrar salida");
        }
    };

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* FORMULARIO DE REGISTRO (Izquierda) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <UserPlus className="text-blue-600" /> Registrar Entrada
                    </h2>
                    <form onSubmit={registrarEntrada} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Visitante</label>
                            <input type="text" className="w-full border p-2 rounded mt-1" required
                                value={nuevoVisitante.nombre} onChange={(e) => setNuevoVisitante({...nuevoVisitante, nombre: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Identificación</label>
                            <input type="text" className="w-full border p-2 rounded mt-1" required
                                value={nuevoVisitante.identificacion} onChange={(e) => setNuevoVisitante({...nuevoVisitante, identificacion: e.target.value})} />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">A quién visita (Casa/Nombre)</label>
                            <input type="text" className="w-full border p-2 rounded mt-1" placeholder="Ej: 502 o Juan..."
                                value={nuevoVisitante.nombrePropietario} onChange={manejarBusquedaPropietario} required />
                            
                            {/* Resultados del buscador */}
                            {resultadosPropietarios.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1">
                                    {resultadosPropietarios.map(p => (
                                        <div key={p.id} onClick={() => seleccionarPropietario(p)}
                                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b">
                                            {p.nombre_completo} - <strong>{p.casa_apto}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Motivo</label>
                            <select className="w-full border p-2 rounded mt-1" 
                                value={nuevoVisitante.motivo} onChange={(e) => setNuevoVisitante({...nuevoVisitante, motivo: e.target.value})}>
                                <option value="personal">Personal / Visita</option>
                                <option value="trabajador">Trabajador / Servicio</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 transition">
                            Registrar Ingreso
                        </button>
                    </form>
                </div>

                {/* TABLA DE GESTIÓN (Derecha) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ClipboardList className="text-green-600" /> Control de Salidas
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500">
                                    <th className="p-3">Visitante</th>
                                    <th className="p-3">Destino</th>
                                    <th className="p-3">Entrada</th>
                                    <th className="p-3">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitantes.map(v => (
                                    <tr key={v.id} className="border-b">
                                        <td className="p-3 font-semibold">{v.nombre_visitante}</td>
                                        <td className="p-3">{v.casa_apto}</td>
                                        <td className="p-3 text-gray-500">{new Date(v.fecha_entrada).toLocaleTimeString()}</td>
                                        <td className="p-3">
                                            {!v.fecha_salida ? (
                                                <button onClick={() => registrarSalida(v.id)} className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition">
                                                    <LogOut size={14} /> Salida
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic">Salió {new Date(v.fecha_salida).toLocaleTimeString()}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PantallaVisitantes;