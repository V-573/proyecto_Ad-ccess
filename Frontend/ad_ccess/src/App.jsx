import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// IMPORTACIÓN DE TUS ESTILOS ORIGINALES
// Ajusta la ruta según donde hayas pegado tus archivos .css 
import './assets/css/reset.css'
import './assets/css/styleIndex.css'
import './assets/css/styleInitialPage.css';
import './assets/css/styleUsuarios.css';
import './assets/css/styleRegistrarUsuario.css';
import './assets/css/stylePerfilUsuario.css';
import './assets/css/styleSidebar.css';

import ConfiguracionInicial from './pages/ConfiguracionInicial.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Usuarios from './components/Usuarios.jsx';





// Importación de Páginas
import Login from './pages/login.jsx';
import RegistrarUsuario from './pages/RegistarUsuario.jsx';
import PerfilUsuario from './components/PerfilUsuario.jsx';
// import Dashboard from './pages/Dashboard'; // Lo crearás después

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta del Dashboard (por ahora vacía) */}
        <Route path="/dashboard" element={<Dashboard/>} />

        <Route path="/usuarios" element={<Usuarios />} />

        <Route path="/usuarios/nuevo" element={<RegistrarUsuario />} />

        {/* Redirigir cualquier otra ruta al login por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />

 {/* Redirigir a pagina inicial para registrar datos de nidad residencial y registrar el administrador inicial */}
        <Route path="/configuracion-inicial" element={<ConfiguracionInicial />} />

{/* ruta para ver detalles de perfil de usuario */}
<Route path="/usuario/:id" element={<PerfilUsuario />} />

<Route path="/registrar-usuario/:id?" element={<RegistrarUsuario />} />


      </Routes>
    </Router>
  );
}

export default App;