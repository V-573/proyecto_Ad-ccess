import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import clienteAxios from '../api/axios';

const RegistrarUsuario = () => {
    // ESTADOS PRINCIPALES
    const [rolSeleccionado, setRolSeleccionado] = useState('admin');
    const [formData, setFormData] = useState({
        nombre_completo: '',
        identificacion: '',
        email: '',
        password: '',
        confirmPassword: '',
        casa_apto: '' // Campo manual de casa
    });
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);

    // ESTADOS PROPIETARIO: MIEMBROS
    const [miembros, setMiembros] = useState([]);
    const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: '', identificacion: '', relacion: '' });
    const [fotoFamiliar, setFotoFamiliar] = useState(null);
    const [previewFamiliar, setPreviewFamiliar] = useState(null);

    // ESTADOS PROPIETARIO: VEHÍCULOS
    const [vehiculos, setVehiculos] = useState([]);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', tipo: '', color: '' });

    // HANDLERS
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB");
            setFoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const agregarMiembro = () => {
        if (!nuevoMiembro.nombre || !nuevoMiembro.identificacion) return alert("Nombre e ID obligatorios");
        setMiembros([...miembros, { ...nuevoMiembro, fotoArchivo: fotoFamiliar, preview: previewFamiliar }]);
        // Reset local
        setNuevoMiembro({ nombre: '', identificacion: '', relacion: '' });
        setFotoFamiliar(null);
        setPreviewFamiliar(null);
    };

    const agregarVehiculo = () => {
        if (!nuevoVehiculo.placa) return;
        setVehiculos([...vehiculos, nuevoVehiculo]);
        setNuevoVehiculo({ placa: '', tipo: '', color: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return alert("Contraseñas no coinciden");

        const data = new FormData();
        // Campos base
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('rol', rolSeleccionado);
        if (foto) data.append('foto', foto);

        // Lógica Propietario
        if (rolSeleccionado === 'propietario') {
            const miembrosParaEnvio = miembros.map(({ nombre, identificacion, relacion }) => ({
                nombre, identificacion, relacion
            }));
            data.append('familia', JSON.stringify(miembrosParaEnvio));
            data.append('vehiculos', JSON.stringify(vehiculos));

            miembros.forEach(m => {
                if (m.fotoArchivo) data.append('fotosFamiliares', m.fotoArchivo);
            });
        }

        try {
            const token = localStorage.getItem('token');
            await clienteAxios.post('/registro-admin', data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Usuario registrado con éxito");
            window.location.reload(); // Forma rápida de limpiar todo
        } catch (error) {
            alert(error.response?.data?.error || "Error al registrar");
        }
    };

    return (
        <div className="page-container">
            <Sidebar />
            <main className="layout-content-custom">
                <div className="main-content">
                    <div className="content-container">
                        <header className="page-header">
                            <h1 className="page-title">Registrar Usuarios</h1>
                        </header>

                        {/* SELECTOR DE ROLES */}
                        <div className="role-selector">
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
                            {/* 1. DATOS BÁSICOS */}
                            <section className="personalData">
                                <h3 className="titulo-seccion">Datos del {rolSeleccionado}</h3>
                                <div className="campo-contenedor">
                                    <input type="text" name="nombre_completo" placeholder="Nombre Completo" className="input" onChange={handleChange} required />
                                    <input type="text" name="identificacion" placeholder="Identificación" className="input" onChange={handleChange} required />
                                    <input type="email" name="email" placeholder="Correo electrónico" className="input" onChange={handleChange} required />
                                </div>
                            </section>

                            {/* 2. SECCIÓN DINÁMICA PROPIETARIO */}
                            {rolSeleccionado === 'propietario' && (
                                <>
                                    <section className="personalData">
                                        <h3 className="titulo-seccion">Ubicación y Vivienda</h3>
                                        <input type="text" name="casa_apto" placeholder="Número de Casa/Apto (Ej: 101A)" className="input" onChange={handleChange} required />
                                    </section>

                                    <section className="personalData">
                                        <h3 className="titulo-seccion">Miembros de la Familia</h3>
                                        <div className="familiar-form-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <input type="text" placeholder="Nombre" className="input" value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })} />
                                                <input type="text" placeholder="ID" className="input" value={nuevoMiembro.identificacion} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, identificacion: e.target.value })} />
                                                <input type="text" placeholder="Relación" className="input" value={nuevoMiembro.relacion} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, relacion: e.target.value })} />
                                                
                                                <div className="foto-familiar-input">
                                                    <label style={{ fontSize: '0.8rem', display: 'block' }}>Foto Familiar:</label>
                                                    <input type="file" accept="image/*" onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        setFotoFamiliar(file);
                                                        setPreviewFamiliar(URL.createObjectURL(file));
                                                    }} />
                                                    {previewFamiliar && <img src={previewFamiliar} alt="p" style={{ width: '40px', height: '40px', borderRadius: '4px', marginTop: '5px' }} />}
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
                                            <input type="text" placeholder="tipo" className="input" value={nuevoVehiculo.tipo} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, tipo: e.target.value })} />
                                            <input type="text" placeholder="Color" className="input" value={nuevoVehiculo.color} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })} />
                                            <button type="button" className="btn btn--secondary" onClick={agregarVehiculo}>+</button>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* 3. FOTO DE PERFIL PRINCIPAL */}
                            <section className="seccion-foto">
                                <h3 className="titulo-seccion">Foto de Perfil</h3>
                                <div className="cargador-contenido" onClick={() => document.getElementById('foto-upload').click()} style={{ cursor: 'pointer' }}>
                                    {preview ? <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} /> : <div className="placeholder-foto">📸</div>}
                                    <p className="cargador-subtitulo">Click para subir foto de {rolSeleccionado}</p>
                                </div>
                                <input type="file" id="foto-upload" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                            </section>

                            {/* 4. SEGURIDAD */}
                            <section className="cambiarClave">
                                <h3 className="titulo-seccion">Seguridad</h3>
                                <div className="campo-contenedor">
                                    <input type="password" name="password" placeholder="Nueva Contraseña" className="input" onChange={handleChange} required />
                                    <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" className="input" onChange={handleChange} required />
                                </div>
                            </section>

                            <div className="form-footer">
                                <button type="submit" className="btn btn--primary">Registrar Completamente</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegistrarUsuario;