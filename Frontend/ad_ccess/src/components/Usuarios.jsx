import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import clienteAxios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom'; // 1. Importar
import Avatar from './Avatar';


const Usuarios = () => {


    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate(); // 2. Inicializar

    const handleNuevoUsuario = () => {
        // Aquí podrías poner lógica extra si quisieras
        navigate('/usuarios/nuevo'); // 3. Navegar
    };


    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const token = localStorage.getItem('token');
                const respuesta = await clienteAxios.get('/usuarios', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsuarios(respuesta.data);
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerUsuarios();
    }, []);

    // Función para obtener iniciales del nombre (Ej: "Sandra Leal" -> "SL")
    // const getIniciales = (nombre) => {
    //     if (!nombre) return "?";
    //     return nombre
    //         .split(' ')
    //         .map(palabra => palabra[0])
    //         .join('')
    //         .toUpperCase()
    //         .slice(0, 2);
    // };


    const eliminarUser = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar a ${nombre}?`);
    if (!confirmar) return;

    try {
        const token = localStorage.getItem('token');
        await clienteAxios.delete(`/usuario/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Actualizar el estado para que desaparezca de la tabla inmediatamente
        setUsuarios(usuarios.filter(u => u.id !== id));
        alert("Usuario eliminado");
    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar el usuario");
    }
};
    return (
        <div className="page-container">
            <Sidebar />

            <main className="layout-content">
                <header className="page-heading-row">
                    <h1 id="page-title">Gestión de Usuarios</h1>
                    <div className="page-actions">
                        <button className="btn btn--primary btn--add" onClick={handleNuevoUsuario}  >
                            <i className="ph ph-user-plus"></i>
                            <span style={{ marginLeft: '10px' }}>Nuevo Usuario</span>
                        </button>
                    </div>
                </header>

                <div className="table-wrapper">
                    <div className="tabla-contenedor">
                        <table className="tabla-usuarios">
                            <thead>
                                <tr className="tabla-encabezado">
                                    <th className="columna-nombre">Nombre</th>
                                    <th className="columna-rol">Rol</th>
                                    <th className="columna-usuario">Usuario</th>
                                    <th className="columna-estado">Estado</th>
                                    <th className="columna-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</td></tr>
                                ) : (
                                    usuarios.map((usuario) => (
                                        <tr key={usuario.id} className="fila">
                                            <td className="celda celda-nombre">
                                              
                                             
                                                <div className="user-info">


                                                    
                                                      {/* div avatar<div className="user-avatar-mini">
                                                     
                                                        {usuario.foto ? (
                                                            <img src={`http://localhost:4000${usuario.foto}`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            getIniciales(usuario.nombre_completo)
                                                        )}
                                                    </div> */}
<Avatar
    src={usuario.foto} 
    nombre={usuario.nombre_completo} 
    size="35px" 
    fontSize="0.8rem" 
/>




                                                    <Link to={`/usuario/${usuario.id}`} className="enlace-perfil">
                                                    <span>{usuario.nombre_completo}</span>

 </Link> 

                                                </div>


                                            </td>
                                            <td className="celda celda-rol">
                                                <span className="role-tag">{usuario.rol}</span>
                                            </td>
                                            <td className="celda celda-usuario">
                                                {/* @{usuario.email.split('@')[0]} */}
                                                {usuario.email}
                                            </td>
                                            <td className="celda celda-estado">
                                                <span className="badge badge-active">Activo</span>
                                            </td>
                                            <td className="celda celda-acciones">
                                                <div className="action-buttons">
                                                
                                                    <button
                                                        className="delete-link"
                                                        title="Eliminar"
                                      
                                                        onClick={() => eliminarUser(usuario.id, usuario.nombre_completo)}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                                    >
                                                        <i className="ph ph-trash"></i>
                                                    </button>
                                                  
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Usuarios;