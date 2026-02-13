
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import Sidebar from '../components/Sidebar';

const PerfilUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);


    const handleUpdateAdmin = async () => {
    const data = new FormData();
    data.append('nombre', adminData.nombre);
    data.append('email', adminData.email);
    
    // El archivo binario de la foto (el que obtienes del <input type="file">)
    if (adminData.nuevaFotoArchivo) {
        data.append('fotoPerfil', adminData.nuevaFotoArchivo);
    }

    try {
        const response = await axios.put(`/api/usuarios/${adminId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Actualizar el estado local con la nueva URL que devuelva el servidor
    } catch (error) {
        console.error("Error al actualizar admin", error);
    }
};

    const cargarPerfil = useCallback(async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            const res = await clienteAxios.get(`/usuario/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPerfil(res.data);




        } catch (error) {
            console.error("Error al cargar perfil:", error);
            alert("Error al cargar perfil");
            navigate('/usuarios'); // Redirigir si hay error
        } finally {
            setCargando(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) cargarPerfil();
    }, [id, cargarPerfil]);

    if (cargando) return (
        <div className="page-container">
            <Sidebar />
            <main className="layout-content-custom"><p>Cargando...</p></main>
        </div>
    );

    if (!perfil) return null;

    return (
        <div className="page-container">
            <Sidebar />
            <main className="layout-content-custom">
                {/* <button onClick={() => navigate('/usuarios')} className="btn-regresar">
                    <i className="ph ph-arrow-left"></i> Volver a Usuarios
                </button> */}

                <div className="perfil-card">
                    <header className="perfil-header">
                        <div className="foto-contenedor-principal">
                            {perfil.foto ? (
                                <img src={`http://localhost:4000${perfil.foto}`} alt="Perfil" className="foto-grande" />
                            ) : (
                                <div className="avatar-iniciales-grande">
                                    {perfil.nombre_completo?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="perfil-titulos">
                            <h2>{perfil.nombre_completo}</h2>
                            <span className="badge-rol">{perfil.rol}</span>
                            <div className="acciones-perfil">
                                <button className="btn-edit-mini" onClick={() => navigate(`/registrar-usuario/${perfil.id}`)}>
                                    <i className="ph ph-pencil"></i> Editar Perfil
                                </button>
                            </div>
                        </div>
                    </header>

                    <section className="info-basica">
                        <h3>Información de Contacto</h3>
                        <p><strong>Email:</strong> {perfil.email}</p>
                        <p><strong>Identificación:</strong> {perfil.identificacion}</p>
                        {perfil.casa_apto && <p><strong>Casa/Apto:</strong> {perfil.casa_apto}</p>}
                    </section>

                    {perfil.rol === 'propietario' && (
                        <div className="propietario-extras">
                            <hr />
                            <h3>Grupo Familiar</h3>
                            <div className="familia-grid">
                                {perfil.familiares?.length > 0 ? (
                                    perfil.familiares.map(f => (
                                        <div key={f.id || f.identificacion} className="familiar-card-mini">
                                            <img 
                                                src={f.foto ? `http://localhost:4000${f.foto}` : '/default-avatar.png'} 
                                                alt={f.nombre} 
                                                className="foto-familiar-mini" 
                                            />
                                            <div className="familiar-info">
                                                <p><strong>{f.nombre}</strong></p>
                                                <p>{f.relacion}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : <p>No hay familiares registrados.</p>}
                            </div>

                            <hr />
                            <h3>Vehículos</h3>
                            <ul className="vehiculos-lista">
                                {perfil.vehiculos?.length > 0 ? (
                                    perfil.vehiculos.map(v => (
                                        <li key={v.id || v.placa}>
                                            <i className="ph ph-car"></i> {v.placa} - {v.tipo} ({v.color})
                                        </li>
                                    ))
                                ) : <p>No hay vehículos registrados.</p>}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PerfilUsuario;