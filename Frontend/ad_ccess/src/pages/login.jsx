import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';

const Login = () => {
    const [credenciales, setCredenciales] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Enviamos "email" y "password" que es lo que espera tu backend
            const respuesta = await clienteAxios.post('/login', credenciales);
            localStorage.setItem('token', respuesta.data.token);


// Si no hay unidad creada, lo mandamos al Wizard
        if (respuesta.data.requiereConfiguracion) {
            navigate('/configuracion-inicial');
        } else {
            navigate('/dashboard');
        }


            // navigate('/dashboard'); 
        } catch (error) {
            alert(error.response?.data?.error || "Error al iniciar sesión");
        }
    };

    return (
        <div className="layout__container">
            <main className="layout__main card-container">
                
                <section className="main__img">
                    <div className="main__img-fondo"></div>
                    <h2 className="main__title">AD-CCESS</h2>
                </section>

                {/* Importante: El onSubmit va en el form */}
                <form id="login-form" className="main__form" onSubmit={handleSubmit}>
                    
                    <input 
                        id="email" 
                        name="email" // Debe coincidir con el estado
                        type="email"
                        placeholder="Correo Electrónico" 
                        className="form__input" 
                        value={credenciales.email}
                        onChange={handleChange}
                        required
                    />

                    <input 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="Contraseña" 
                        className="form__input" 
                        value={credenciales.password}
                        onChange={handleChange}
                        required
                    />

                    {/* El botón debe ser type="submit" para que dispare el handleSubmit del form */}
                    <button id="login-button" type="submit" className="btn btn--primary">
                        <span>Iniciar Sesión</span>
                    </button>
                </form>

            </main>
        </div>
    );
};

export default Login;