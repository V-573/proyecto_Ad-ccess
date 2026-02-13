import React, { useEffect, useState, useCallback } from 'react'; // Agregamos useCallback
import { useParams, useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import Sidebar from '../components/Sidebar';

const PerfilUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        nombre_completo: '',
        email: '',
        casa_apto: '',
    rol: ''
    });

    // 1. Envolvemos cargarPerfil en useCallback para que sea estable
    const cargarPerfil = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await clienteAxios.get(`/usuario/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPerfil(res.data);

            // Pre-cargamos los datos en el estado de edición
            setEditData({
                nombre_completo: res.data.nombre_completo,
                email: res.data.email,
                casa_apto: res.data.casa_apto || '',
                rol: res.data.rol
            });
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            alert("Error al cargar perfil");
        }
    }, [id]); // Solo cambia si el ID cambia

    // 2. useEffect limpio
    useEffect(() => {
        if (id) {
            cargarPerfil();
        }
    }, [id, cargarPerfil]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await clienteAxios.put(`/usuario/${id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            cargarPerfil(); // Recargamos datos actualizados
            alert("Usuario actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("Error al actualizar");
        }
    };

    if (!perfil) return <p className="loading-text">Cargando...</p>;

    return (
        <div className="page-container">
            <Sidebar />
            <main className="layout-content-custom">
                <button onClick={() => navigate('/usuarios')} className="btn-regresar">
                    <i className="ph ph-arrow-left"></i> Volver a Usuarios
                </button>

                <div className="perfil-card">
                    <header className="perfil-header">
                        <div className="foto-contenedor-principal">
                            {perfil.foto ? (
                                <img 
                                    src={`http://localhost:4000${perfil.foto}`} 
                                    alt="Perfil" 
                                    className="foto-grande" 
                                />
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
                                {/* IMPORTANTE: Agregamos el onClick aquí */}
                                <button className="btn-edit-mini" onClick={() => setIsModalOpen(true)}>
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
                                        <div key={f.id} className="familiar-card-mini">
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
                                        <li key={v.id}>
                                            <i className="ph ph-car"></i> {v.placa} - {v.tipo} ({v.color})
                                        </li>
                                    ))
                                ) : <p>No hay vehículos registrados.</p>}
                            </ul>
                        </div>
                    )}
                </div>

                {/* MODAL DE EDICIÓN */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Editar Información Básica</h3>
                            <form onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        value={editData.nombre_completo}
                                        onChange={(e) => setEditData({...editData, nombre_completo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={editData.email}
                                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Casa / Apto</label>
                                    <input 
                                        type="text" 
                                        value={editData.casa_apto}
                                        onChange={(e) => setEditData({...editData, casa_apto: e.target.value})}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancelar">Cancelar</button>
                                    <button type="submit" className="btn-guardar">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PerfilUsuario;