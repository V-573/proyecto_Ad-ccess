import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import InicioConserje from '../components/Conserje/InicioConcerje.jsx'; // Asegúrate de que la ruta sea correcta
import PantallaVisitantes from '../components/Conserje/PantallaVisitantes.jsx';
import RegistroPasado from '../components/Conserje/RegistroPasado.jsx';
import Minuta from '../components/Conserje/Minuta.jsx';
import Visitantes from '../components/Visitantes.jsx';
import Perfil from '../components/Perfil.jsx';
import Usuarios from '../components/Usuarios.jsx';


const ResumenAdmin = () => (
    <section className="activity-section">
        <h2 className="section-title">Resumen General del Conjunto</h2>
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="noticia-card">
                <h3>Estado Global</h3>
                <p>Bienvenido al panel de control administrativo. Aquí podrás supervisar usuarios y minutas.</p>
            </div>
            <div className="noticia-card">
                <h3>Accesos Recientes</h3>
                <p>No hay alertas críticas el día de hoy.</p>
            </div>
        </div>
    </section>
);

const Dashboard = () => {
    // 1. Estados y Datos de Usuario
    const [vistaActual, setVistaActual] = useState('inicio');
    const userRaw = localStorage.getItem('usuario');
    const user = userRaw ? JSON.parse(userRaw) : null;

    // 2. Formateador de Rol
    const formatRol = (rol) => {
        if (!rol) return '';
        const roles = {
            admin: 'Administrador',
            propietario: 'Propietario',
            conserje: 'Conserje'
        };
        return roles[rol.toLowerCase()] || rol;
    };

    // 3. Lógica para renderizar el contenido dinámico del centro
  const renderizarVistaDinamica = () => {
    if (user?.rol === 'conserje') {
        switch (vistaActual) {
            case 'inicio':
                return <InicioConserje />;
            case 'visitantes':
                return <PantallaVisitantes />;
            case 'parqueadero':
               return <RegistroPasado />;
            case 'minuta':
               return <Minuta/>;
               case 'noticias':
               return <div> EN DESARROLLO ... ... ...</div>
            default:
                return <InicioConserje />;
        }
    }

        // Si es PROPIETARIO, mostramos su dashboard fijo
        if (user?.rol === 'propietario') {
            return (
                <section className="activity-section full-width">
                    <h2 className="section-title">Anuncios de la Administración</h2>
                    <div className="noticia-card">
                        <span className="badge-new">Nuevo</span>
                        <h3>Corte de agua programado</h3>
                        <p>Este jueves de 8:00 AM a 12:00 PM por mantenimiento de tanques.</p>
                    </div>
                </section>
            );
        }

        // Si es ADMIN, mostramos su resumen
        if (user?.rol === 'admin') {
           
        switch (vistaActual) {
            case 'inicio':
                return  <ResumenAdmin />; 
            case 'visitantes':
                return <Visitantes />;
                 case 'parqueadero':
               return <RegistroPasado />;
            case 'minuta':
                return <Minuta />; // <--- Ahora el Admin también puede entrar aquí
            case 'usuarios':
                return <Usuarios />;
                case 'perfil':
    return <Perfil />;
     case 'noticias':
               return <div> EN DESARROLLO ... ... ...</div>
            default:
                return <ResumenAdmin />;
        }
    }
            
        }

console.log("Vista actual:", vistaActual, "Usuario:", user);
    return (
        <div className="page-container" style={{ display: 'flex' }}>
            {/* Sidebar recibe la función para cambiar de vista si es conserje */}
            <Sidebar setVista={setVistaActual} />

            <main className="layout-content" style={{ flex: 1, padding: '20px' }}>
                <header className="page-heading-row">
                    <h1 id="page-title">Dashboard {formatRol(user?.rol)}</h1>
                    <p style={{ color: '#666', marginTop: '5px' }}>
                        Bienvenido de nuevo, <strong>{user?.nombre}</strong>
                    </p>
                </header>

                <div className="dashboard-grid">
                    {/* Aquí se renderiza el contenido según el rol y la pestaña seleccionada */}
                    {renderizarVistaDinamica()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;