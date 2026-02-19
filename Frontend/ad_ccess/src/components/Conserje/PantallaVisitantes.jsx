import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, LogOut, ClipboardList, Car } from 'lucide-react';

const PantallaVisitantes = () => {
    const [visitantes, setVisitantes] = useState([]);
    const [resultadosPropietarios, setResultadosPropietarios] = useState([]);
    const [parqueadero, setParqueadero] = useState({ total: 0, ocupados: 0, disponibles: 0 });
    
    const [nuevoVisitante, setNuevoVisitante] = useState({
        nombre: '',
        identificacion: '',
        usuario_visitado_id: '',
        motivo: 'personal',
        observaciones: '',
        nombrePropietario: '',
        tiene_vehiculo: false,
        placa_vehiculo: ''
    });

    const token = localStorage.getItem('token');

    const actualizarCupos = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/acceso/estado-parqueadero', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParqueadero(res.data);
        } catch (error) {
            console.error("Error al cargar parqueaderos", error);
        }
    };

    const cargarVisitantesActivos = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/acceso/lista-gestion', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVisitantes(res.data);
        } catch (error) {
            console.error("Error al cargar visitantes");
        }
    };

    useEffect(() => {
        cargarVisitantesActivos();
        actualizarCupos();
    }, []);

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
    if (!nuevoVisitante.usuario_visitado_id) return alert("Selecciona un propietario");

    // Mapeamos los nombres del estado a los nombres que espera la DB
    const datosAEnviar = {
        nombre_visitante: nuevoVisitante.nombre, // Cambiado para coincidir con la DB
        identificacion_visitante: nuevoVisitante.identificacion, // Cambiado para coincidir con la DB
        usuario_visitado_id: nuevoVisitante.usuario_visitado_id,
        motivo: nuevoVisitante.motivo,
        observaciones: nuevoVisitante.observaciones,
        tiene_vehiculo: nuevoVisitante.tiene_vehiculo,
        placa_vehiculo: nuevoVisitante.tiene_vehiculo ? nuevoVisitante.placa_vehiculo : null
    };

    try {
        // Corrección del POST: URL, Datos, Configuración (Headers)
        await axios.post('http://localhost:4000/api/acceso/entrada', datosAEnviar, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("Entrada registrada con éxito");
        
        // Limpiar formulario
        setNuevoVisitante({ nombre: '', identificacion: '', usuario_visitado_id: '', motivo: 'personal', observaciones: '', nombrePropietario: '', tiene_vehiculo: false, placa_vehiculo: '' });
        cargarVisitantesActivos();
        actualizarCupos();
    } catch (error) {
        console.error("Error detallado:", error.response?.data);
        alert(error.response?.data?.error || "Error al registrar");
    }
};

const registrarSalida = async (id) => {
    try {
        await axios.put(`http://localhost:4000/api/acceso/salida/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // ¡IMPORTANTE! Estas dos líneas hacen que la interfaz se limpie
        await cargarVisitantesActivos(); // Esto quita al visitante de la tabla
        await actualizarCupos();          // Esto libera el espacio en el widget azul
        
    } catch (error) {
        // Si es 404, significa que ya se le había dado salida
        if (error.response?.status === 404) {
            cargarVisitantesActivos(); // Refrescamos por si acaso
        } else {
            alert("Error al registrar salida");
        }
    }
};



    const buscarPropietario = async (termino) => {
    setNuevoVisitante({ ...nuevoVisitante, nombrePropietario: termino });
    if (termino.length < 2) return setResultadosPropietarios([]);

    try {
        const res = await axios.get(`http://localhost:4000/api/acceso/buscar-propietario?q=${termino}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setResultadosPropietarios(res.data);
    } catch (error) {
        console.error("Error buscando propietario");
    }
};
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const exitBtnStyle = { padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const dropdownStyle = { position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const itemDropdownStyle = { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '13px' };
    return (
     <div className="pantalla-visitantes-container" style={{ padding: '20px' }}>
        
        {/* SECCIÓN 1: WIDGET DE PARQUEADERO (OCUPA TODO EL ANCHO) */}
        <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignSelf: 'center'
        }}>
            <div>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#141111', margin: 0 }}>ESTADO DEL PARQUEADERO</p>
                <h2 style={{ fontSize: '24px', margin: '5px 0', color:'black'}}>
                    <i className="ph-bold ph-car" style={{ marginRight: '10px', color: parqueadero.disponibles > 0 ? '#10b981' : '#ef4444' }}></i>
                    {parqueadero.disponibles} Cupos Disponibles 
                    <span style={{ fontSize: '24px', color: '#999', marginLeft: '10px' }}>de {parqueadero.total}</span>
                </h2>
            </div>
            {/* Indicador visual rápido */}
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {Math.round((parqueadero.ocupados / parqueadero.total) * 100) || 0}%
                </div>
                <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>OCUPACIÓN ACTUAL</p>
            </div>
        </div>

        {/* SECCIÓN 2: GRID DE DOS COLUMNAS (REGISTRO Y TABLA) */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '20px',
            alignItems: 'start' 
        }}>
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div style={{ backgroundColor: '#101a235e', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(83, 81, 81, 0.38)' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserPlus size={20} color="#2563eb" /> Nuevo Registro
                </h3>
                
                <form onSubmit={registrarEntrada} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Nombre del Visitante" style={inputStyle} value={nuevoVisitante.nombre} onChange={e => setNuevoVisitante({...nuevoVisitante, nombre: e.target.value})} required />
                    <input type="text" placeholder="Cédula / ID" style={inputStyle} value={nuevoVisitante.identificacion} onChange={e => setNuevoVisitante({...nuevoVisitante, identificacion: e.target.value})} required />
                    
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Buscar Apto o Propietario..." 
                            style={{ ...inputStyle, backgroundColor: nuevoVisitante.usuario_visitado_id ? '#eff6ff' : 'white' }} 
                            value={nuevoVisitante.nombrePropietario} 
                            onChange={e => buscarPropietario(e.target.value)} 
                            required 
                        />
                        {resultadosPropietarios.length > 0 && (
                            <div style={dropdownStyle}>
                                {resultadosPropietarios.map(p => (
                                    <div key={p.id} onClick={() => seleccionarPropietario(p)} style={itemDropdownStyle}>
                                        <strong>{p.casa_apto}</strong> - {p.nombre_completo}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <select style={inputStyle} value={nuevoVisitante.motivo} onChange={e => setNuevoVisitante({...nuevoVisitante, motivo: e.target.value})}>
                        <option value="personal">Visita Personal</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="mantenimiento">Mantenimiento</option>
                    </select>

                    <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                disabled={parqueadero.disponibles === 0}
                                checked={nuevoVisitante.tiene_vehiculo} 
                                onChange={(e) => setNuevoVisitante({...nuevoVisitante, tiene_vehiculo: e.target.checked})} 
                            />
                            ¿Trae Vehículo? {parqueadero.disponibles === 0 && <span style={{color:'red'}}>(Lleno)</span>}
                        </label>
                        {nuevoVisitante.tiene_vehiculo && (
                            <input 
                                type="text" 
                                placeholder="PLACA" 
                                style={{ ...inputStyle, marginTop: '10px', textAlign: 'center', fontWeight: 'bold', borderColor: '#3b82f6' }} 
                                value={nuevoVisitante.placa_vehiculo} 
                                onChange={e => setNuevoVisitante({...nuevoVisitante, placa_vehiculo: e.target.value.toUpperCase()})} 
                                required 
                            />
                        )}
                    </div>

                    <button type="submit" style={btnStyle}>Registrar Ingreso</button>
                </form>
            </div>

            {/* COLUMNA DERECHA: TABLA DE PRESENTES */}
            <div style={{ backgroundColor: '#101A23', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(85, 81, 81, 0.51)', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Visitantes en el Edificio ({visitantes.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', fontSize: '13px', color: '#666' }}>
                            <th style={{ padding: '10px' }}>VISITANTE</th>
                            <th style={{ padding: '10px' }}>DESTINO</th>
                            <th style={{ padding: '10px' }}>VEHÍCULO</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>SALIDA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitantes.map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{v.nombre_visitante}</div>
                                    <div style={{ fontSize: '11px', color: '#999' }}>{v.identificacion}</div>
                                </td>
                                <td style={{ padding: '12px 10px' }}>
                                    <div>Apto {v.casa_apto}</div>
                                    <div style={{ fontSize: '11px', color: '#999' }}>{v.propietario}</div>
                                </td>
                                <td style={{ padding: '12px 10px' }}>
                                    {v.tiene_vehiculo ? <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{v.placa_vehiculo}</span> : '—'}
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                    <button onClick={() => registrarSalida(v.id)} style={exitBtnStyle} title="Marcar Salida">
                                        <LogOut size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
};

export default PantallaVisitantes;