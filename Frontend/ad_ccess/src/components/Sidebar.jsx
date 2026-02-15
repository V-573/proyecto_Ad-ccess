import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    // const location = useLocation();

    // // Simulando la obtención del rol (Cámbialo por tu lógica real)
    // const user = JSON.parse(localStorage.getItem('usuario'));
    // const rol = user?.rol;

    // // Definición de todos los links posibles
    // const menuItems = [
    //     { path: '/dashboard', label: 'Inicio', icon: '🏠', roles: ['admin', 'propietario', 'conserje'] },
    //     { path: '/perfil', label: 'Mi Perfil', icon: '👤', roles: ['admin', 'propietario'] },
    //     { path: '/usuarios', label: 'Gestión Usuarios', icon: '👥', roles: ['admin'] },
    //     { path: '/visitantes', label: 'Visitantes', icon: '🚪', roles: ['admin', 'conserje'] },
    //     { path: '/parqueadero', label: 'Parqueadero', icon: '🚗', roles: ['admin', 'conserje'] },
    //     { path: '/minuta', label: 'Minuta', icon: '📝', roles: ['admin', 'conserje'] },
    //     { path: '/noticias', label: 'Noticias', icon: '📢', roles: ['admin', 'propietario', 'conserje'] },
    // ];


    // // Filtrar links según el rol del usuario
    // const linksVisibles = menuItems.filter(item => item.roles.includes(rol));


    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (


        <aside className="menu-panel">
            <h1 className="menu-titulo">Ad-ccess</h1>
            <nav className="menu-lista">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "menu-enlace menu-enlace-activo" : "menu-enlace"}>
                    <i className="ph-fill ph-house"></i>
                    <span>Inicio</span>
                </NavLink>

                <NavLink to="/usuarios" className={({ isActive }) => isActive ? "menu-enlace menu-enlace-activo" : "menu-enlace"}>
                    <i className="ph ph-users menu-icono"></i>
                    <span className="menu-texto">Usuarios</span>
                </NavLink>

                <NavLink to="/noticias" className={({ isActive }) => isActive ? "menu-enlace menu-enlace-activo" : "menu-enlace"}>
                    <i className="ph ph-megaphone menu-icono"></i>
                    <span className="menu-texto">Noticias</span>
                </NavLink>

                <NavLink to="/perfil" className={({ isActive }) => isActive ? "menu-enlace menu-enlace-activo" : "menu-enlace"}>
                    <i className="ph ph-user menu-icono"></i>
                    <span className="menu-texto">Mi Perfil</span>
                </NavLink>

                {/* Botón de Salir */}
                <button onClick={handleLogout} className="menu-enlace menu-enlace-salir" >
                    <i className="ph ph-sign-out menu-icono"></i>
                    <span className="menu-texto">Cerrar Sesión</span>
                </button>
            </nav>
        </aside>


// <aside className="sidebar">
//             <div className="sidebar-logo">
//                 <h2>Ad-ccess</h2>
//             </div>

//             <nav className="sidebar-nav">
//                 {linksVisibles.map((item) => (
//                     <Link 
//                         key={item.path}
//                         to={item.path} 
//                         className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
//                     >
//                         <span className="icon">{item.icon}</span>
//                         <span className="label">{item.label}</span>
//                     </Link>
//                 ))}
//             </nav>

//             <div className="sidebar-footer">
//                 <button onClick={handleLogout} className="btn-logout">
//                     Logout
//                 </button>
//             </div>

//         </aside>
   


    );



};

export default Sidebar;