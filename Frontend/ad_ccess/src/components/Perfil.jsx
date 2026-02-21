import React, { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import Avatar from './Avatar'; 

const Perfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerDatosPerfil = async () => {
            try {
                const storageUser = JSON.parse(localStorage.getItem('usuario'));
                const token = localStorage.getItem('token');

                if (storageUser?.id) {
                    const res = await clienteAxios.get(`/auth/usuario/${storageUser.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPerfil(res.data);
                }
            } catch (error) {
                console.error("Error al obtener perfil", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerDatosPerfil();
    }, []);

    if (cargando) return <div style={{ padding: '20px' }}>Cargando datos del perfil...</div>;
    
    // Si no hay perfil, evitamos renderizar el Avatar para que no haya bucles
    if (!perfil) return <div style={{ padding: '20px' }}>No se pudo cargar la información.</div>;

    return (
        <div className="perfil-container" style={{ padding: '20px', maxWidth: '800px' }}>
            <h2 className="section-title">Mi Perfil</h2>
            
            <div className="perfil-card" style={{ 
                display: 'flex', 
                gap: '20px', 
                backgroundColor: '#554f4f', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
                {/* <div className="perfil-foto">
                   
                    <Avatar 
                        src={perfil.foto_url} 
                        nombre={perfil.nombre_completo || perfil.nombre} 
                        size="150px" 
                        fontSize="3rem" 
                    />
                </div> */}

                <div className="perfil-foto">
    <Avatar 
        /* Cambiamos foto_url por foto para que coincida con Usuarios.jsx */
        src={perfil.foto || perfil.foto_url} 
        nombre={perfil.nombre_completo} 
        size="150px" 
        fontSize="3rem" 
    />
</div>

                <div className="perfil-info">
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {perfil.nombre_completo || perfil.nombre}
                    </h3>
                    <p><strong>Rol:</strong> <span className="role-tag">{(perfil.rol || '').toUpperCase()}</span></p>
                    <p><strong>Email:</strong> {perfil.email}</p>
                    <p><strong>Teléfono:</strong> {perfil.telefono || 'No registrado'}</p>
                    <p><strong>Identificación:</strong> {perfil.identificacion || 'No registrado'}</p>
                    {perfil.casa_apto && <p><strong>Ubicación:</strong> {perfil.casa_apto}</p>}
                </div>
            </div>
        </div>
    );
};

export default Perfil;