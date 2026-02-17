import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';

const ConfiguracionInicial = () => {
    const navigate = useNavigate();
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        nombre_completo: '',
        identificacion: '',
        email: '',
        unidad_nombre: '',
        num_casas: '',
        parqueaderos: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFoto(file);
        setPreview(URL.createObjectURL(file)); // Crea una URL temporal para ver la foto
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return alert("Las contraseñas no coinciden");
        }

        // --- IMPORTANTE: Usar FormData para archivos ---
        const dataToSend = new FormData();
        // Agregamos todos los campos del form
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        // Agregamos la foto si existe
        if (foto) dataToSend.append('foto', foto);

        try {

           

            const token = localStorage.getItem('token');
            await clienteAxios.post('/configuracion-inicial', dataToSend, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });

            alert("Configuración guardada con éxito");
            navigate('/dashboard'); 
        } catch (error) {
            alert(error.response?.data?.error || "Error al guardar la configuración");
        }
    };

    return (
        <div className="layout__container-initialPage">
            <main className="layout__main-initialPage">
                <header className="header-wizard">
                    <h2 className="site-title">Ad-ccess</h2>
                    <p>Bienvenido. Vamos a configurar tu unidad residencial.</p>
                </header>

                <form className="wizard-form" onSubmit={handleSubmit}>
                    
                    <div className="wizard-grid">
                        {/* Columna Izquierda: Datos Personales */}
                        <section className="wizard-section">
                            <h3 className="titulo-seccion">Datos del Administrador</h3>
                            <input type="text" name="nombre_completo" placeholder="Nombre Completo" className="input" onChange={handleChange} required />
                            <input type="text" name="identificacion" placeholder="Identificación" className="input" onChange={handleChange} required />
                            <input type="email" name="email" placeholder="Correo electrónico" className="input" onChange={handleChange} required />
                        </section>

                        {/* Columna Derecha: Foto */}
                        <section className="wizard-section section-foto">
                            <h3 className="titulo-seccion">Foto de Perfil</h3>
                            <label className="dropzone">
                                <input type="file" name="foto" accept="image/*" onChange={handleFileChange} hidden />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="img-preview" />
                                ) : (
                                    <div className="dropzone-content">
                                        <i className="ph ph-camera"></i>
                                        <span>Click para subir foto</span>
                                    </div>
                                )}
                            </label>
                        </section>

                        {/* Datos del Conjunto */}
                        <section className="wizard-section">
                            <h3 className="titulo-seccion">Datos del Conjunto</h3>
                            <input type="text" name="unidad_nombre" placeholder="Nombre de la Unidad" className="input" onChange={handleChange} required />
                            <div className="input-group-row">
                                <input type="number" name="num_casas" placeholder="Casas" className="input" onChange={handleChange} required />
                                <input type="number" name="parqueaderos" placeholder="Parqueaderos" className="input" onChange={handleChange} required />
                            </div>
                        </section>

                        {/* Seguridad */}
                        <section className="wizard-section">
                            <h3 className="titulo-seccion">Seguridad</h3>
                            <input type="password" name="password" placeholder="Nueva Contraseña" className="input" onChange={handleChange} required />
                            <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" className="input" onChange={handleChange} required />
                        </section>
                    </div>

                    <button type="submit" className="btn-finalizar">Finalizar Configuración</button>
                </form>
            </main>
        </div>
    );
};

export default ConfiguracionInicial;