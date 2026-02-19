import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RegistroPasado = () => {
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                // 1. Obtener el token del localStorage
                const token = localStorage.getItem('token');
                
                // 2. Enviar la petición con el header de Authorization
                const res = await axios.get('http://localhost:4000/api/acceso/historial', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setHistorial(res.data);
            } catch (error) {
                console.error("Error al cargar el historial:", error.response?.data || error.message);
                if (error.response?.status === 401) {
                    alert("Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.");
                }
            }
        };
        fetchHistorial();
    }, []);

    return (
        <div style={{ padding: '20px', backgroundColor: '#101a23c4', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Historial de Visitas (Registro Pasado)</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: '#3b82f6', color: 'white' }}>
                            <th style={tableHeaderStyle}>Visitante</th>
                            <th style={tableHeaderStyle}>Vehículo</th>
                            <th style={tableHeaderStyle}>Apto Visitado</th>
                            <th style={tableHeaderStyle}>Entrada</th>
                            <th style={tableHeaderStyle}>Salida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length > 0 ? (
                            historial.map(v => (
                                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tableCellStyle}>
                                        <strong>{v.nombre_visitante}</strong><br/>
                                        <small style={{color: '#666'}}>{v.identificacion_visitante}</small>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {v.placa_vehiculo ? (
                                            <span style={{ background: '#c0b2c9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #f59e0b' }}>
                                                {v.placa_vehiculo}
                                            </span>
                                        ) : 'Peatón'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        Apto {v.casa_apto}<br/>
                                        <small>{v.visitado_nombre}</small>
                                    </td>
                                    <td style={tableCellStyle}>{new Date(v.fecha_entrada).toLocaleString()}</td>
                                    <td style={tableCellStyle}>
                                        {v.fecha_salida 
                                            ? new Date(v.fecha_salida).toLocaleString() 
                                            : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>En Edificio</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No hay registros disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Estilos rápidos para la tabla
const tableHeaderStyle = { padding: '12px', textAlign: 'left' };
const tableCellStyle = { padding: '12px', verticalAlign: 'top' };

export default RegistroPasado;