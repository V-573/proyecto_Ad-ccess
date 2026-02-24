import React, { useState, useEffect } from 'react';
import clienteAxios from '../../api/axios';

const Minuta = () => {
    const [registros, setRegistros] = useState([]);
    const [nuevaNovedad, setNuevaNovedad] = useState('');
    const [cargando, setCargando] = useState(true);


// 1. Obtener el rol del usuario actual
    const userRaw = localStorage.getItem('usuario');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const esAdmin = user?.rol?.toLowerCase() === 'admin';

    // Obtener los registros de la minuta
    const obtenerMinuta = async () => {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await clienteAxios.get('/minuta', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistros(respuesta.data);
        } catch (error) {
            console.error("Error al obtener minuta:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerMinuta();
    }, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaNovedad.trim()) return;

    try {
        const token = localStorage.getItem('token');
        await clienteAxios.post('/minuta', 
            { 
                descripcion: nuevaNovedad,
                categoria: 'General', // Valor por defecto
                importancia: 'NORMAL'  // Valor por defecto
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setNuevaNovedad('');
        obtenerMinuta();
        alert("Novedad registrada");
    } catch (error) {
        alert("Error al registrar");
    }
};
    return (
        <div className="minuta-container">
            <h2 className="section-title">Libro de Minutas Digital</h2>

{/* 2. Mostrar el formulario SOLO si NO es admin (solo conserjes) */}
{!esAdmin && (
                <div className="noticia-card" style={{ marginBottom: '20px' }}>
                    <form onSubmit={handleSubmit}>
                        <textarea 
                            className="form-control"
                            placeholder="Escribe aquí la novedad..."
                            value={nuevaNovedad}
                            onChange={(e) => setNuevaNovedad(e.target.value)}
                            style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn btn--primary" style={{ marginTop: '10px' }}>
                            <i className="ph ph-paper-plane-tilt"></i> Registrar Novedad
                        </button>
                    </form>
                </div>
            )}



            {/* Formulario para nuevo registro */}
            {/* <div className="noticia-card" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSubmit}>
                    <textarea 
                        className="form-control"
                        placeholder="Escribe aquí la novedad, entrega de turno o incidencia..."
                        value={nuevaNovedad}
                        onChange={(e) => setNuevaNovedad(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" className="btn btn--primary" style={{ marginTop: '10px' }}>
                        <i className="ph ph-paper-plane-tilt"></i> Registrar Novedad
                    </button>
                </form>
            </div> */}

            {/* Tabla de registros */}
            <div className="table-wrapper">
                <table className="tabla-usuarios">
                    <thead>
                        <tr className="tabla-encabezado">
                            <th>Fecha/Hora</th>
                            <th>Conserje</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center' }}>Cargando minuta...</td></tr>
                        ) : registros.length > 0 ? (
                            registros.map((reg) => (
                                <tr key={reg.id} className="fila">
                                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {new Date(reg.fecha).toLocaleString()}
                                    </td>
                                    <td><strong>{reg.nombre_conserje}</strong></td>
                                    <td>{reg.descripcion}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay registros hoy.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Minuta;