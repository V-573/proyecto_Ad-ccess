import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';

const ConfiguracionInicial = () => {
    const navigate = useNavigate();
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica de contraseña
        if (formData.password !== formData.confirmPassword) {
            return alert("Las contraseñas no coinciden");
        }

        try {
            const token = localStorage.getItem('token');
            // Aquí enviarías los datos a un nuevo endpoint, por ejemplo: /configuracion-inicial
            await clienteAxios.post('/configuracion-inicial', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Configuración guardada con éxito");
            navigate('/dashboard'); 
        } catch (error) {
            alert(error.response?.data?.error || "Error al guardar la configuración");
        }
    };

    return (
        <div className="layout__container-initialPage layout-container-custom">
            <main className="layout__main-initialPage">
                <header className="site-header">
                    <h2 className="site-title">Ad-ccess</h2>
                </header>

                <h2 className="page-heading">Configuración Inicial</h2>

                <form className="layout-content" onSubmit={handleSubmit}>
                    
                    <section className="personalData">
                        <h3 className="titulo-seccion">Datos del Administrador</h3>
                        <div className="campo-contenedor">
                            <input type="text" name="nombre_completo" placeholder="Nombre Completo" className="input" onChange={handleChange} required />
                        </div>
                        <div className="campo-contenedor">
                            <input type="text" name="identificacion" placeholder="Identificación" className="input" onChange={handleChange} required />
                        </div>
                        <div className="campo-contenedor">
                            <input type="email" name="email" placeholder="Correo electrónico" className="input" onChange={handleChange} required />
                        </div>
                    </section>

                    <section className="seccion-foto">
                        <div className="cargador-contenido">
                            <p className="cargador-titulo">Cargar Foto</p>
                            <p className="cargador-subtitulo">Click para seleccionar archivo</p>
                        </div>
                        <button type="button" className="btn btn--secondary">Elegir Imagen</button>
                    </section>

                    <section className="ur_data">
                        <h3 className="titulo-seccion">Datos del Conjunto</h3>
                        <div className="campo-contenedor">
                            <input type="text" name="unidad_nombre" placeholder="Nombre de la Unidad" className="input" onChange={handleChange} required />
                        </div>
                        <div className="campo-contenedor">
                            <input type="number" name="num_casas" placeholder="Número de Casas" className="input" onChange={handleChange} required />
                        </div>
                        <div className="campo-contenedor">
                            <input type="number" name="parqueaderos" placeholder="Número de parqueaderos disponibles" className="input" onChange={handleChange} required />
                        </div>
                    </section>

                    <section className="cambiarClave">
                        <h3 className="titulo-seccion">Seguridad</h3>
                        <div className="campo-contenedor">
                            <input type="password" name="password" placeholder="Nueva Contraseña" className="input" onChange={handleChange} required />
                        </div>
                        <div className="campo-contenedor">
                            <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" className="input" onChange={handleChange} required />
                        </div>
                    </section>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" className="btn btn--primary">Finalizar Configuración</button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ConfiguracionInicial;