// import Sidebar from '../components/Sidebar';

// const Dashboard = () => {
//     return (
//         <div className="page-container">
//             <Sidebar />

//             <main className="layout-content">
//                 <header className="page-heading-row">
//                     <h1 id="page-title">Dashboard Administrador</h1>
//                 </header>

//                 <div className="dashboard-grid">
//                     {/* Actividad Reciente */}
//                     <section className="activity-section">
//                         <h2 className="section-title">Actividad Reciente</h2>
//                         <div className="activity-grid">
//                             <div className="activity-item">
//                                 <div className="icon-column">
//                                     <i className="ph ph-user-circle"></i>
//                                 </div>
//                                 <div className="activity-info">
//                                     <p className="title">Usuario 'Carlos' registrado</p>
//                                     <p className="meta">Ayer</p>
//                                 </div>
//                             </div>
                            
//                             <div className="activity-item">
//                                 <div className="icon-column">
//                                     <i className="ph ph-user-circle"></i>
//                                 </div>
//                                 <div className="activity-info">
//                                     <p className="title">Usuario 'Fabian' registrado</p>
//                                     <p className="meta">Ayer</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>

//                     {/* Notificaciones */}
//                     <section className="notifications-section">
//                         <h2 className="section-title">Notificaciones</h2>
//                         <div className="notification-row">
//                             <i className="ph ph-wrench"></i>
//                             <div className="notif-texto">
//                                 <p className="notif-title">Servicios</p>
//                                 <p className="notif-sub">3 solicitudes pendientes</p>
//                             </div>
//                         </div>
//                     </section>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default Dashboard;

import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    // 1. Extraemos el usuario del localStorage
    const userRaw = localStorage.getItem('usuario');
    const user = userRaw ? JSON.parse(userRaw) : null;

    // 2. Formateamos el rol para mostrarlo bonito (Ej: 'admin' -> 'Administrador')
    const formatRol = (rol) => {
        if (!rol) return '';
        const roles = {
            admin: 'Administrador',
            propietario: 'Propietario',
            conserje: 'Conserje'
        };
        return roles[rol.toLowerCase()] || rol;
    };

    return (
        <div className="page-container">
            <Sidebar />

            <main className="layout-content">
                <header className="page-heading-row">
                    {/* Título dinámico según el rol */}
                    <h1 id="page-title">Dashboard {formatRol(user?.rol)}</h1>
                    {/* Saludo personalizado */}
                    <p style={{ color: '#666', marginTop: '5px' }}>
                        Bienvenido de nuevo, <strong>{user?.nombre}</strong>
                    </p>
                </header>

                <div className="dashboard-grid">



                    {/* Actividad Reciente - Solo ejemplo, podrías filtrarla por rol después */}
                    {/* <section className="activity-section">
                        <h2 className="section-title">Actividad Reciente</h2>
                        <div className="activity-grid">
                            <div className="activity-item">
                                <div className="icon-column">
                                    <i className="ph ph-user-circle"></i>
                                </div>
                                <div className="activity-info">
                                    <p className="title">
                                        {user?.rol === 'admin' 
                                            ? "Usuario 'Carlos' registrado" 
                                            : "Has iniciado sesión correctamente"}
                                    </p>
                                    <p className="meta">Hace un momento</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notificaciones 
                    <section className="notifications-section">
                        <h2 className="section-title">Notificaciones</h2>
                        <div className="notification-row">
                            <i className="ph ph-wrench"></i>
                            <div className="notif-texto">
                                <p className="notif-title">Estado del Sistema</p>
                                <p className="notif-sub">Conectado como {user?.rol}</p>
                            </div>
                        </div>
                    </section> */}


<div className="dashboard-grid">
    {/* --- VISTA PARA EL CONSERJE --- */}
    {user?.rol === 'conserje' && (
        <>
            <section className="stat-card">
                <div className="stat-icon visitantes"><i className="ph ph-users-three"></i></div>
                <div className="stat-info">
                    <h3 className="stat-value">12</h3>
                    <p className="stat-label">Visitantes hoy</p>
                </div>
            </section>

            <section className="stat-card">
                <div className="stat-icon parqueo"><i className="ph ph-car"></i></div>
                <div className="stat-info">
                    <h3 className="stat-value">5</h3>
                    <p className="stat-label">Parqueaderos Libres</p>
                </div>
            </section>

            <section className="activity-section full-width">
                <h2 className="section-title">Últimas Entradas (Minuta)</h2>
                <div className="minuta-preview">
                    <p><strong>10:30 AM</strong> - Entrada Vehículo ABC-123 (Apto 201)</p>
                    <hr />
                    <p><strong>09:15 AM</strong> - Domicilio Rappi (Apto 504)</p>
                </div>
            </section>
        </>
    )}

    {/* --- VISTA PARA EL PROPIETARIO --- */}
    {user?.rol === 'propietario' && (
        <section className="activity-section full-width">
            <h2 className="section-title">Anuncios de la Administración</h2>
            <div className="noticia-card">
                <span className="badge-new">Nuevo</span>
                <h3>Corte de agua programado</h3>
                <p>Este jueves de 8:00 AM a 12:00 PM por mantenimiento de tanques.</p>
            </div>
        </section>
    )}

    {/* --- VISTA PARA EL ADMIN (La que ya tenías o una más completa) --- */}
    {user?.rol === 'admin' && (
        <section className="activity-section">
             <h2 className="section-title">Resumen del Conjunto</h2>
             {/* Aquí pones tus gráficos o listas de usuarios */}
        </section>
    )}
</div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;