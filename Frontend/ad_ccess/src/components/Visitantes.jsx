import React, { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';

const Visitantes = () => {
    const [visitantes, setVisitantes] = useState([]);

    useEffect(() => {
        const obtenerVisitantes = async () => {
            try {

                const token = localStorage.getItem('token'); // 1. Recuperar el token
                // Ajustamos a tu nueva ruta de acceso
            // 2. Enviarlo en los headers
            const res = await clienteAxios.get('/acceso/activos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }); 
            
            setVisitantes(res.data);

            } catch (error) {
                console.error("Error al obtener visitantes activos", error.response?.data || error);
            }
        };
        obtenerVisitantes();
    }, []);

    return (
        <div className="table-wrapper">
            <h2 className="section-title">Visitantes actualmente en el conjunto</h2>
            <table className="tabla-usuarios">
                <thead>
                    <tr className="tabla-encabezado">
                        <th>Nombre</th>
                        <th>Identificación</th>
                        <th>Apartamento</th>
                        <th>Hora Entrada</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    
                    visitantes.length > 0 ? 
                    
                    visitantes.map(v => (
    <tr key={v.id} className="fila">
    <td>{v.nombre_visitante}</td>
    <td>{v.identificacion}</td>
    <td>{v.placa_vehiculo || 'N/A'}</td> 
    <td>{v.fecha_entrada ? new Date(v.fecha_entrada).toLocaleString() : 'Sin fecha'}</td>
</tr>
))
                    : (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No hay visitantes activos</td></tr>
                    )
                    
                    
                    }
                </tbody>
            </table>
        </div>
    );
};

export default Visitantes;