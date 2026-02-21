import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ setVista }) => { // 1. Recibimos setVista como prop
    const navigate = useNavigate();
    
    const userRaw = localStorage.getItem('usuario');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const rol = user?.rol?.toLowerCase().trim();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Inicio', icon: 'ph-fill ph-house', roles: ['admin', 'propietario', 'conserje'], vista: 'inicio' },
        { path: '/usuarios', label: 'Usuarios', icon: 'ph ph-users', roles: ['admin'] },
        { path: '/visitantes', label: 'Visitantes', icon: 'ph ph-address-book', roles: ['admin', 'conserje'], vista: 'visitantes' },
        { path: '/parqueadero', label: 'registroPasado', icon: 'ph ph-car', roles: ['admin', 'conserje'], vista: 'parqueadero' },
        { path: '/minuta', label: 'Minuta', icon: 'ph ph-book-open', roles: ['admin', 'conserje'], vista: 'minuta' },
        { path: '/noticias', label: 'Noticias', icon: 'ph ph-megaphone', roles: ['admin', 'propietario', 'conserje'], vista: 'noticias' },
        { path: '/perfil', label: 'Mi Perfil', icon: 'ph ph-user', roles: ['admin', 'propietario'] },
    ];

    const linksVisibles = menuItems.filter(item => item.roles.includes(rol));

    // 2. Función para manejar el clic en el menú
  const handleMenuClick = (item, e) => {
    // Si el item tiene una vista (como 'minuta', 'visitantes', etc.)
    // evitamos que el enlace cambie la URL y usamos el estado
    if (item.vista && setVista) {
        e.preventDefault(); // <--- ESTO EVITA QUE TE MANDE AL LOGIN
        setVista(item.vista);
    }
};

    return (
        <aside className="menu-panel">
            <h1 className="menu-titulo">Ad-ccess</h1>
            
            <nav className="menu-lista">
                {linksVisibles.map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path} 
                        onClick={(e) => handleMenuClick(item, e)} // 3. Disparamos el cambio de vista
                        className={({ isActive }) => 
                            isActive ? "menu-enlace menu-enlace-activo" : "menu-enlace"
                        }
                    >
                        <i className={`${item.icon} menu-icono`}></i>
                        <span className="menu-texto">{item.label}</span>
                    </NavLink>
                ))}

                <button onClick={handleLogout} className="menu-enlace menu-enlace-salir">
                    <i className="ph ph-sign-out menu-icono"></i>
                    <span className="menu-texto">Cerrar Sesión</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;