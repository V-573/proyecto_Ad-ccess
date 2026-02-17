import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';

const Login = () => {
    const [credenciales, setCredenciales] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             // Enviamos "email" y "password" que es lo que espera tu backend
//             const respuesta = await clienteAxios.post('/login', credenciales);
//             localStorage.setItem('token', respuesta.data.token);


//             // 2. GUARDAMOS EL USUARIO (Esto es lo que te faltaba)
//         // Asegúrate de que el backend envíe respuesta.data.usuario
//         if (respuesta.data.usuario) {
//             localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
//         }



// // Si no hay unidad creada, lo mandamos al Wizard
//         if (respuesta.data.requiereConfiguracion) {
//             navigate('/configuracion-inicial');
//         } else {
//             navigate('/dashboard');
//         }


//             // navigate('/dashboard'); 
//         } catch (error) {
//             alert(error.response?.data?.error || "Error al iniciar sesión");
//         }
//     };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const respuesta = await clienteAxios.post('/login', credenciales);
        
        // 1. Guardamos el TOKEN para las peticiones
        localStorage.setItem('token', respuesta.data.token);

        // 2. GUARDAMOS EL OBJETO USUARIO (Esto activará el Sidebar)
        // respuesta.data.usuario contiene { id, nombre, rol }
        if (respuesta.data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
        }

        // 3. Redirección lógica
        if (respuesta.data.requiereConfiguracion) {
            navigate('/configuracion-inicial');
        } else {
            navigate('/dashboard');
        }

    } catch (error) {
        console.error(error);
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