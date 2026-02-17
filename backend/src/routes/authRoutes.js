import express from 'express';
// IMPORTANTE: Importar todas las funciones necesarias
import { 
    registrarAdmin, 
    obtenerUsuarios, 
    configurarInicial, 
    login, 
    obtenerDetalleUsuario, 
    eliminarUsuario, 
    actualizarUsuario 
} from '../controllers/authController.js';
import { verificarToken, permitirRoles} from '../middlewares/authMiddleware.js';
import { upload } from '../config/multer.js'; // Si ya creaste el archivo config/multer.js

const router = express.Router();

// Definición de campos para Multer (reutilizable)
const uploadCampos = upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'fotosFamiliares', maxCount: 10 }
]);

router.post('/login', login);

router.post('/configuracion-inicial', verificarToken, permitirRoles('admin'), uploadCampos, configurarInicial);

router.get('/usuarios', verificarToken, permitirRoles('admin'), obtenerUsuarios);

router.post('/registro-admin', verificarToken, permitirRoles('admin'), uploadCampos, registrarAdmin);

router.get('/usuario/:id', verificarToken, obtenerDetalleUsuario);

router.delete('/usuario/:id', verificarToken, eliminarUsuario);

router.put('/usuario/:id', verificarToken, uploadCampos, actualizarUsuario);

export default router;