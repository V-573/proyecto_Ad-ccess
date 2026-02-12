import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    return (
        <div className="page-container">
            <Sidebar />

            <main className="layout-content">
                <header className="page-heading-row">
                    <h1 id="page-title">Dashboard Administrador</h1>
                </header>

                <div className="dashboard-grid">
                    {/* Actividad Reciente */}
                    <section className="activity-section">
                        <h2 className="section-title">Actividad Reciente</h2>
                        <div className="activity-grid">
                            <div className="activity-item">
                                <div className="icon-column">
                                    <i className="ph ph-user-circle"></i>
                                </div>
                                <div className="activity-info">
                                    <p className="title">Usuario 'Carlos' registrado</p>
                                    <p className="meta">Ayer</p>
                                </div>
                            </div>
                            
                            <div className="activity-item">
                                <div className="icon-column">
                                    <i className="ph ph-user-circle"></i>
                                </div>
                                <div className="activity-info">
                                    <p className="title">Usuario 'Fabian' registrado</p>
                                    <p className="meta">Ayer</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notificaciones */}
                    <section className="notifications-section">
                        <h2 className="section-title">Notificaciones</h2>
                        <div className="notification-row">
                            <i className="ph ph-wrench"></i>
                            <div className="notif-texto">
                                <p className="notif-title">Servicios</p>
                                <p className="notif-sub">3 solicitudes pendientes</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;