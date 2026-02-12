import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

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
    );
};

export default Sidebar;