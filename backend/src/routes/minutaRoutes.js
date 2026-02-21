import express from 'express';
import { obtenerMinuta, crearRegistroMinuta } from '../controllers/minutaController.js';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware.js'; // Ajusta la ruta si es necesario

const router = express.Router();

// Solo conserjes y admins pueden ver y crear minutas
router.get('/', verificarToken, permitirRoles('admin', 'conserje'), obtenerMinuta);
router.post('/', verificarToken, permitirRoles('admin', 'conserje'), crearRegistroMinuta);

export default router;