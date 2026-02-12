import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Reutilizamos tu Sidebar
import clienteAxios from '../api/axios';

const RegistrarUsuario = () => {


const [miembros, setMiembros] = useState([]); // [{nombre, identificacion, relacion}]
const [vehiculos, setVehiculos] = useState([]); // [{placa, tipo, color}]

// Estados temporales para los inputs de las tablas
const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: '', identificacion: '', relacion: '' });
const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', tipo: '', color: '' });

    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null); // Para ver la foto antes de subirla

    const [rolSeleccionado, setRolSeleccionado] = useState('admin');
    const [formData, setFormData] = useState({
        nombre_completo: '',
        identificacion: '',
        email: '',
        password: '',
        confirmPassword: ''
    });



  

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validar 5MB en el frontend (5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es muy pesada. El máximo permitido son 5MB.");
            e.target.value = null; // Limpia el input
            return;
        }

        if (preview) URL.revokeObjectURL(preview);
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    }
};



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return alert("Las contraseñas no coinciden");
        }

        // IMPORTANTE: Usar FormData para enviar archivos
        const data = new FormData();
        data.append('nombre_completo', formData.nombre_completo);
        data.append('identificacion', formData.identificacion);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('rol', rolSeleccionado);
        if (foto) data.append('foto', foto);

// Campos extra para Propietario
    if (rolSeleccionado === 'propietario') {
        data.append('casa_id', formData.casa_id);
        data.append('familia', JSON.stringify(miembros)); // Lo enviamos como JSON string
        data.append('vehiculos', JSON.stringify(vehiculos));
    }





        try {
            const token = localStorage.getItem('token');
            // Usamos el endpoint que ya tienes en el backend
            //   await clienteAxios.post('/registro-admin', { ...formData, rol: rolSeleccionado }, {
            await clienteAxios.post('/registro-admin', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Indica que va un archivo
                }
            });
            alert("Usuario registrado con éxito");


            // AJUSTE: Limpiar formulario y estados después del éxito
            setFormData({
                nombre_completo: '',
                identificacion: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            setFoto(null);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(null);


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

                        {/* Selector de Roles Dinámico */}
                        <div className="role-selector">
                            <div className="role-group">
                                {['admin', 'conserje', 'propietario'].map((rol) => (
                                    <button
                                        key={rol}
                                        type="button"
                                        className={`role-link ${rolSeleccionado === rol ? 'is-selected' : ''}`}
                                        onClick={() => setRolSeleccionado(rol)}
                                    >
                                        <span className="role-label">
                                            {rol.charAt(0).toUpperCase() + rol.slice(1)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form className="form-grid-layout" onSubmit={handleSubmit}>

                            {/* Sección Datos Personales */}



                            {/* ... después de la sección de Datos Personales ... */}

{rolSeleccionado === 'propietario' && (
  <>
    {/* SECCIÓN NÚMERO DE CASA */}
    <section className="personalData">
      <h3 className="titulo-seccion">Ubicación</h3>
      <div className="campo-contenedor">
        <select 
          name="casa_id" 
          className="input" 
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar Casa/Apto</option>
          <option value="101">Casa 101</option>
          <option value="102">Casa 102</option>
          {/* Aquí luego mapearemos las casas desde la DB */}
        </select>
      </div>
    </section>

    {/* SECCIÓN FAMILIA */}
    <section className="personalData">
      <h3 className="titulo-seccion">Miembros de la Familia</h3>
      <div className="form-grid-mini" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '15px'}}>
        <input type="text" placeholder="Nombre" className="input" value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({...nuevoMiembro, nombre: e.target.value})} />
        <input type="text" placeholder="ID" className="input" value={nuevoMiembro.identificacion} onChange={(e) => setNuevoMiembro({...nuevoMiembro, identificacion: e.target.value})} />
        <input type="text" placeholder="Relación" className="input" value={nuevoMiembro.relacion} onChange={(e) => setNuevoMiembro({...nuevoMiembro, relacion: e.target.value})} />
        <button type="button" className="btn btn--secondary" onClick={() => {
          setMiembros([...miembros, nuevoMiembro]);
          setNuevoMiembro({ nombre: '', identificacion: '', relacion: '' });
        }}>+</button>
      </div>
      
      {/* Tabla simple de miembros agregados */}
      <ul className="lista-resumen">
        {miembros.map((m, i) => (
          <li key={i}>{m.nombre} ({m.relacion}) - <span onClick={() => setMiembros(miembros.filter((_, idx) => idx !== i))}>Eliminar</span></li>
        ))}
      </ul>
    </section>

    {/* SECCIÓN VEHÍCULOS */}
    <section className="personalData">
      <h3 className="titulo-seccion">Vehículos Autorizados</h3>
      <div className="form-grid-mini" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px'}}>
        <input type="text" placeholder="Placa" className="input" value={nuevoVehiculo.placa} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, placa: e.target.value})} />
        <select className="input" value={nuevoVehiculo.tipo} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, tipo: e.target.value})}>
          <option value="">Tipo</option>
          <option value="Auto">Auto</option>
          <option value="Moto">Moto</option>
        </select>
        <input type="text" placeholder="Color" className="input" value={nuevoVehiculo.color} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, color: e.target.value})} />
        <button type="button" className="btn btn--secondary" onClick={() => {
          setVehiculos([...vehiculos, nuevoVehiculo]);
          setNuevoVehiculo({ placa: '', tipo: '', color: '' });
        }}>+</button>
      </div>
    </section>
  </>
)}
                            <section className="personalData">
                                <h3 className="titulo-seccion">Datos del {rolSeleccionado}</h3>
                                <div className="campo-contenedor">
                                    <input type="text" name="nombre_completo" value={formData.nombre_completo} placeholder="Nombre Completo" className="input" onChange={handleChange} required />



                                </div>
                                <div className="campo-contenedor">
                                    <input type="text" name="identificacion" value={formData.identificacion} placeholder="Identificación" className="input" onChange={handleChange} required />



                                </div>
                                <div className="campo-contenedor">
                                    <input type="email" name="email" value={formData.email} placeholder="Correo electrónico" className="input" onChange={handleChange} required />



                                </div>
                            </section>

                            {/* Sección Foto (Dropzone) */}
                            <section className="seccion-foto">
                                <div className="cargador-contenido">

                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ width: '100px', borderRadius: '50%' }} />
                                    ) : (
                                        <i className="ph ph-cloud-arrow-up" style={{ fontSize: '2rem' }}></i>
                                    )}
                                    {/* <i className="ph ph-cloud-arrow-up" style={{fontSize: '2rem', color: 'var(--primary-color)'}}></i> */}
                                    <p className="cargador-titulo">Cargar Foto</p>
                                    <p className="cargador-subtitulo">Click para seleccionar archivo</p>
                                </div>


                                {/* Input oculto que se activa con el botón */}
                                <input
                                    type="file"
                                    id="foto-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />


                                <button type="button" className="btn btn--secondary" onClick={() => document.getElementById('foto-upload').click()} >Elegir Imagen</button>
                            </section>






                            {/* Sección Seguridad */}
                            <section className="cambiarClave">
                                <h3 className="titulo-seccion">Seguridad</h3>
                                <div className="campo-contenedor">
                                    <input type="password" name="password" placeholder="Nueva Contraseña" className="input" onChange={handleChange} required />
                                </div>
                                <div className="campo-contenedor">
                                    <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" className="input" onChange={handleChange} required />
                                </div>
                            </section>

                            <div className="form-footer">
                                <button type="submit" className="btn btn--primary">Finalizar Configuración</button>
                            </div>
                        </form>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegistrarUsuario;