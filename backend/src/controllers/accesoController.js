import * as AccesoService from '../services/accesoService.js';
import * as UsuarioService from '../services/usuarioService.js'


export const entrada = async (req, res) => {
    try {
        // req.usuario.id viene del middleware verificarToken
        const nuevoRegistro = await AccesoService.registrarEntrada(req.body, req.usuario.id);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
console.error("ERROR DETECTADO:", error);

        res.status(500).json({ error: "Error al registrar entrada" });
    }
};

export const salida = async (req, res) => {
    try {
        const registro = await AccesoService.registrarSalida(req.params.id);
        if (!registro) return res.status(404).json({ error: "Registro no encontrado o ya tiene salida" });
        res.json({ mensaje: "Salida registrada", registro });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar salida" });
    }
};

export const obtenerHistorial = async (req, res) => {
    try {
        const historial = await AccesoService.listarMovimientos();
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

export const buscarPropietario = async (req, res) => {
    try {
        const { q } = req.query; // El término de búsqueda vendrá en la URL: ?q=502
        if (!q) return res.json([]);
        
        const propietarios = await UsuarioService.buscarPropietarioPorFiltro(q);
        res.json(propietarios);
    } catch (error) {
        res.status(500).json({ error: "Error en la búsqueda" });
    }
};

export const obtenerResumenInicio = async (req, res) => {
    try {
        const presentes = await AccesoService.obtenerPresentes();
        res.json({
            total_presentes: presentes.length,
            visitantes: presentes
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener resumen" });
    }
};