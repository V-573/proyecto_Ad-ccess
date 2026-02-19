import express from 'express';
import * as accesoController from '../controllers/accesoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; // Solo importamos verificarToken
import * as AccesoService from '../services/accesoService.js';

const router = express.Router();

/**
 * Middleware de Autorización Local
 * Compara el rol del token (req.usuario.rol) con los permitidos.
 * Se usa .toLowerCase() para evitar errores si en la DB dice 'Conserje' o 'conserje'.
 */
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !req.usuario.rol) {
            return res.status(401).json({ error: "Usuario no identificado" });
        }

        const rolUsuario = req.usuario.rol.toLowerCase().trim();
        const permitido = rolesPermitidos.some(rol => rol.toLowerCase() === rolUsuario);

        if (!permitido) {
            return res.status(403).json({ 
                error: `Acceso denegado. Tu rol (${rolUsuario}) no tiene permiso.` 
            });
        }
        next();
    };
};

// --- RUTAS DE REGISTRO ---

// Registrar entrada de visitante
router.post('/entrada', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    accesoController.entrada
);

// Registrar salida de visitante
router.put('/salida/:id', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    accesoController.salida
);

// --- RUTAS DE CONSULTA ---

// --- RUTAS DE CONSULTA Y ESTADO ---

// 1. ESTADO DEL PARQUEADERO (Agrégale los roles por seguridad)
router.get('/estado-parqueadero', 
    verificarToken, 
    permitirRoles('admin', 'conserje', 'propietario'), // Agregamos propietario por si quieres que ellos lo vean luego
    accesoController.consultarEstadoParqueadero 
);



// Historial completo de movimientos
router.get('/historial', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    accesoController.obtenerHistorial
);






// Buscador de propietarios/residentes (para el formulario de entrada)
router.get('/buscar-propietario', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    accesoController.buscarPropietario
);

// --- RUTAS DE VISTA (DASHBOARD) ---

// Resumen rápido para tarjetas del dashboard (Inicio)
router.get('/resumen-inicio', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    async (req, res) => {
        try {
            const datos = await AccesoService.obtenerPresentes();
            res.json({
                total_presentes: datos.length,
                visitantes: datos
            });
        } catch (error) {
            res.status(500).json({ error: "Error al obtener resumen" });
        }
    }
);

// Lista de gestión para la pantalla de VISITANTES
router.get('/lista-gestion', 
    verificarToken, 
    permitirRoles('admin', 'conserje'), 
    async (req, res) => {
        try {
            const datos = await AccesoService.listarVisitantesActivos();
            res.json(datos); 
        } catch (error) {
            res.status(500).json({ error: "Error al obtener lista" });
        }
    }
);





export default router;