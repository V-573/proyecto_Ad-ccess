import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import clienteAxios from '../api/axios';

const RegistrarUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // --- ESTADOS PRINCIPALES ---
    const [rolSeleccionado, setRolSeleccionado] = useState('admin');
    const [formData, setFormData] = useState({
        nombre_completo: '',
        identificacion: '',
        email: '',
        password: '',
        confirmPassword: '',
        casa_apto: ''
    });
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);

    // --- ESTADOS PROPIETARIO: MIEMBROS ---
    const [miembros, setMiembros] = useState([]);
    const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: '', identificacion: '', relacion: '' });
    const [fotoFamiliar, setFotoFamiliar] = useState(null); // Faltaba esto
    const [previewFamiliar, setPreviewFamiliar] = useState(null); // Faltaba esto

    // --- ESTADOS PROPIETARIO: VEHÍCULOS ---
    const [vehiculos, setVehiculos] = useState([]);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', tipo: '', color: '' });

    // --- CARGA DE DATOS (EDICIÓN) ---
    useEffect(() => {
        if (isEditMode) {
            const cargarDatosUsuario = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await clienteAxios.get(`/usuario/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const u = res.data;

                    setRolSeleccionado(u.rol);
                    setFormData({
                        nombre_completo: u.nombre_completo || '',
                        identificacion: u.identificacion || '',
                        email: u.email || '',
                        password: '', 
                        confirmPassword: '',
                        casa_apto: u.casa_apto || ''
                    });
                    
                    if (u.foto) setPreview(`http://localhost:4000${u.foto}`);
                    if (u.familiares) setMiembros(u.familiares);
                    if (u.vehiculos) setVehiculos(u.vehiculos);

                } catch (error) {
                    console.error("Error al cargar datos:", error);
                }
            };
            cargarDatosUsuario();
        }
    }, [id, isEditMode]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const agregarMiembro = () => {
        if (!nuevoMiembro.nombre || !nuevoMiembro.identificacion) return alert("Nombre e ID obligatorios");
        setMiembros([...miembros, { ...nuevoMiembro, fotoArchivo: fotoFamiliar, preview: previewFamiliar }]);
        setNuevoMiembro({ nombre: '', identificacion: '', relacion: '' });
        setFotoFamiliar(null);
        setPreviewFamiliar(null);
    };

    const agregarVehiculo = () => {
        if (!nuevoVehiculo.placa) return;
        setVehiculos([...vehiculos, nuevoVehiculo]);
        setNuevoVehiculo({ placa: '', tipo: '', color: '' });
    };


//     //   
// const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (formData.password && formData.password !== formData.confirmPassword) {
//         return alert("Las contraseñas no coinciden");
//     }

//     const data = new FormData();
//  // Datos básicos
//     data.append('nombre_completo', formData.nombre_completo);
//     data.append('identificacion', formData.identificacion);
//     data.append('email', formData.email);
//     data.append('rol', rolSeleccionado);
//     data.append('casa_apto', formData.casa_apto || '');
//     // Solo enviar password si el usuario escribió algo (importante para edición)
//     if (formData.password) {
//         data.append('password', formData.password);
//     }
//     // 1. Agregar campos básicos (identificación, nombre, etc.)
//     Object.keys(formData).forEach(key => {
//         if (formData[key]) data.append(key, formData[key]);
//     });

//     // 2. Foto principal del usuario
//  if (foto) { 
//     // Si el usuario seleccionó un archivo nuevo (es un objeto File)
//     data.append('foto', foto); 
// } else if (isEditMode && preview) {
//     // Si no seleccionó nada nuevo, pero hay una foto previa (URL), 
//     // la enviamos para mantenerla.
//     // Extraemos solo la ruta (quitando el http://localhost:4000)
//     const rutaRelativa = preview.replace('http://localhost:4000', '');
//     data.append('foto', rutaRelativa);
// }

//     if (rolSeleccionado === 'propietario') {
//         // IMPORTANTE: Limpiamos los objetos de miembros antes de enviarlos
//         // para que no lleven datos circulares o pesados, solo la metadata.
//         const miembrosLimpios = miembros.map(m => ({
//             id: m.id || null,
//             nombre: m.nombre,
//             identificacion: m.identificacion,
//             relacion: m.relacion,
//             foto: m.foto, // Mantiene la URL de la foto vieja si existe
//             tieneNuevaFoto: Boolean(m.fotoArchivo)
//         }));

//         data.append('familia', JSON.stringify(miembrosLimpios));
//         data.append('vehiculos', JSON.stringify(vehiculos));

//         // 3. Enviar las fotos de los familiares en el orden correcto
//         // Recorremos la lista original de miembros que tiene los archivos binarios
//         miembros.forEach((m) => {
//             if (m.fotoArchivo) {
//                 data.append('fotosFamiliares', m.fotoArchivo);
//             }
//         });
//     }

//     try {
//         const token = localStorage.getItem('token');
//         const config = {
//             headers: { 
//                 Authorization: `Bearer ${token}`, 
//                 'Content-Type': 'multipart/form-data' 
//             }
//         };

//         if (isEditMode) {
//             await clienteAxios.put(`/usuario/${id}`, data, config);
//             alert("Usuario actualizado con éxito");
//             // Asegúrate de que esta ruta coincida con tu App.js
//             navigate(`/usuarios`); 
//         } else {
//             await clienteAxios.post('/registro-admin', data, config);
//             alert("Usuario registrado con éxito");
//             window.location.reload();
//         }
//     } catch (error) {
//         console.error(error);
//         alert(error.response?.data?.error || "Error en la operación");
//     }
// };


const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
        return alert("Las contraseñas no coinciden");
    }

    const data = new FormData();

    // 1. Datos básicos (Controlados uno a uno para evitar basura)
    data.append('nombre_completo', formData.nombre_completo);
    data.append('identificacion', formData.identificacion);
    data.append('email', formData.email);
    data.append('rol', rolSeleccionado);
    data.append('casa_apto', formData.casa_apto || '');
    
    // Solo enviar password si el usuario escribió algo
    if (formData.password) {
        data.append('password', formData.password);
    }

    // 2. Gestión de la Foto Principal
    if (foto) { 
        // Si hay un archivo nuevo seleccionado
        data.append('foto', foto); 
    } else if (isEditMode && preview) {
        // Si no hay archivo nuevo, enviamos la ruta relativa de la actual
        const rutaRelativa = preview.replace('http://localhost:4000', '');
        data.append('foto', rutaRelativa);
    }

    // 3. Datos de Propietario (Familia y Vehículos)
    if (rolSeleccionado === 'propietario') {
        const miembrosLimpios = miembros.map(m => ({
            id: m.id || null,
            nombre: m.nombre,
            identificacion: m.identificacion,
            relacion: m.relacion,
            foto: m.foto, 
            tieneNuevaFoto: Boolean(m.fotoArchivo)
        }));

        data.append('familia', JSON.stringify(miembrosLimpios));
        data.append('vehiculos', JSON.stringify(vehiculos));

        // Fotos binarias de familiares
        miembros.forEach((m) => {
            if (m.fotoArchivo) {
                data.append('fotosFamiliares', m.fotoArchivo);
            }
        });
    }

    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: { 
                Authorization: `Bearer ${token}`, 
                'Content-Type': 'multipart/form-data' 
            }
        };

        if (isEditMode) {
            await clienteAxios.put(`/usuario/${id}`, data, config);
            alert("Usuario actualizado con éxito");
            navigate('/usuarios'); 
        } else {
            await clienteAxios.post('/registro-admin', data, config);
            alert("Usuario registrado con éxito");
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Error en la operación");
    }
};




    return (
        <div className="page-container">
            <Sidebar />
            <main className="layout-content-custom">
                <div className="content-container">
                    <header className="page-header">
                        <h1 className="page-title">
                            {isEditMode ? `Editando: ${formData.nombre_completo}` : 'Registrar Nuevo Usuario'}
                        </h1>
                    </header>

                    {/* Selector de Roles */}
                    <div className="role-selector" style={{ opacity: isEditMode ? 0.6 : 1, pointerEvents: isEditMode ? 'none' : 'auto' }}>
                        <div className="role-group">
                            {['admin', 'conserje', 'propietario'].map((rol) => (
                                <button
                                    key={rol}
                                    type="button"
                                    className={`role-link ${rolSeleccionado === rol ? 'is-selected' : ''}`}
                                    onClick={() => setRolSeleccionado(rol)}
                                >
                                    <span className="role-label">{rol.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form className="form-grid-layout" onSubmit={handleSubmit}>
                        {/* 1. Datos Personales */}
                        <section className="personalData">
                            <h3 className="titulo-seccion">Datos Personales</h3>
                            <div className="campo-contenedor">
                                <input type="text" name="nombre_completo" value={formData.nombre_completo} placeholder="Nombre Completo" className="input" onChange={handleChange} required />
                                <input type="text" name="identificacion" value={formData.identificacion} placeholder="Identificación" className="input" onChange={handleChange} required />
                                <input type="email" name="email" value={formData.email} placeholder="Correo electrónico" className="input" onChange={handleChange} required />
                            </div>
                        </section>

                        {/* 2. Sección Propietario Dinámica */}
                        {rolSeleccionado === 'propietario' && (
                            <>
                                <section className="personalData">
                                    <h3 className="titulo-seccion">Ubicación y Vivienda</h3>
                                    <input type="text" name="casa_apto" value={formData.casa_apto} placeholder="Número de Casa/Apto" className="input" onChange={handleChange} required />
                                </section>

                                <section className="personalData">
                                    <h3 className="titulo-seccion">Miembros de la Familia</h3>
                                    <div className="familiar-form-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <input type="text" placeholder="Nombre" className="input" value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })} />
                                            <input type="text" placeholder="ID" className="input" value={nuevoMiembro.identificacion} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, identificacion: e.target.value })} />
                                            <input type="text" placeholder="Relación" className="input" value={nuevoMiembro.relacion} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, relacion: e.target.value })} />
                                            
                                            <div className="foto-familiar-input">
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setFotoFamiliar(file);
                                                    setPreviewFamiliar(URL.createObjectURL(file));
                                                }} />
                                                {previewFamiliar && <img src={previewFamiliar} alt="p" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />}
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn--secondary" style={{ marginTop: '10px', width: '100%' }} onClick={agregarMiembro}>+ Añadir a la lista</button>
                                    </div>
                                    <ul className="lista-resumen">
                                        {miembros.map((m, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#f9f9f9', padding: '5px 10px', marginTop: '5px' }}>
                                                <span>{m.nombre} - {m.relacion}</span>
                                                <button type="button" onClick={() => setMiembros(miembros.filter((_, idx) => idx !== i))} style={{ color: 'red', border: 'none', background: 'none' }}>Eliminar</button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>


<section className="personalData">
    <h3 className="titulo-seccion">Vehículos</h3>
    <div className="form-grid-mini" style={{ display: 'flex', gap: '5px' }}>
        <input type="text" placeholder="Placa" className="input" value={nuevoVehiculo.placa} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value })} />
        <input type="text" placeholder="Tipo" className="input" value={nuevoVehiculo.tipo} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, tipo: e.target.value })} />
        <input type="text" placeholder="Color" className="input" value={nuevoVehiculo.color} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })} />
        <button type="button" className="btn btn--secondary" onClick={agregarVehiculo}>+</button>
    </div>
    
    <ul className="lista-resumen">
        {vehiculos.map((v, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#f9f9f9', padding: '5px 10px', marginTop: '5px' }}>
                <span>{v.placa} - {v.tipo} ({v.color})</span>
                {/* BOTÓN DE ELIMINAR AÑADIDO */}
                <button 
                    type="button" 
                    onClick={() => setVehiculos(vehiculos.filter((_, idx) => idx !== i))} 
                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                    Eliminar
                </button>
            </li>
        ))}
    </ul>
</section>




                            </>
                        )}

                        {/* 3. Foto Principal */}
                        <section className="seccion-foto">
                            <h3 className="titulo-seccion">Foto de Perfil</h3>
                            <div className="cargador-contenido" onClick={() => document.getElementById('foto-upload').click()} style={{ cursor: 'pointer' }}>
                                {preview ? <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} /> : <div className="placeholder-foto">📸</div>}
                                <p className="cargador-subtitulo">{isEditMode ? "Click para cambiar foto" : "Click para subir foto"}</p>
                            </div>
                            <input type="file" id="foto-upload" style={{ display: 'none' }} onChange={(e) => {
                                const file = e.target.files[0];
                                setFoto(file);
                                setPreview(URL.createObjectURL(file));
                            }} accept="image/*" />
                        </section>

                        {/* 4. Seguridad */}
                        <section className="cambiarClave">
                            <h3 className="titulo-seccion">Seguridad</h3>
                            <p style={{fontSize: '0.8rem', color: '#afaaaa', marginBottom: '1rem'}}>
                                {isEditMode ? "(Dejar en blanco para no cambiar)" : "Defina una contraseña"}
                            </p>
                            <div className="campo-contenedor">
                                <input type="password" name="password" placeholder="Nueva Contraseña" className="input" onChange={handleChange} required={!isEditMode} />
                                <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" className="input" onChange={handleChange} required={!isEditMode} />
                            </div>
                        </section>

                        <div className="form-footer">
                            <button type="submit" className="btn btn--primary">
                                {isEditMode ? 'Guardar Cambios' : 'Registrar Completamente'}
                            </button>
                            {isEditMode && (
                                <button type="button" className="btn" onClick={() => navigate(-1)} style={{background: 'none', color: '#666'}}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RegistrarUsuario;