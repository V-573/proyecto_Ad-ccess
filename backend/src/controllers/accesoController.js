import pool from '../config/db.js';
import * as AccesoService from '../services/accesoService.js';
import * as UsuarioService from '../services/usuarioService.js'


export const entrada = async (req, res) => {
    try {
        const nuevoRegistro = await AccesoService.registrarEntrada(req.body, req.usuario.id);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        if (error.message === "CAPACIDAD_PARQUEADERO_AGOTADA") {
            return res.status(400).json({ error: "No hay cupos de parqueadero disponibles." });
        }
        res.status(500).json({ error: "Error al registrar entrada" });
    }
};

export const salida = async (req, res) => {
    try {
        const { id } = req.params; // Captura el número 6 de la URL
        const registro = await AccesoService.registrarSalida(id);
        
        if (!registro) {
            // Si el service devuelve null, es que ya tenía salida o no existe
            return res.status(404).json({ error: "Registro no encontrado o ya finalizado" });
        }
        
        res.json({ mensaje: "Salida registrada con éxito", registro });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno al procesar salida" });
    }
};

// export const obtenerHistorial = async (req, res) => {
//     try {
//         const historial = await AccesoService.listarMovimientos();
//         res.json(historial);
//     } catch (error) {
//         res.status(500).json({ error: "Error al obtener historial" });
//     }
// };

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

export const consultarEstadoParqueadero = async (req, res) => {
    try {
        const estado = await AccesoService.obtenerEstadoParqueadero();
        res.json(estado);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar parqueadero" });
    }
};


export const obtenerHistorial = async (req, res) => {
    try {
        const historial = await AccesoService.listarHistorialVisitantes();
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};

export const obtenerVisitantesActivos = async (req, res) => {
    try {
        // Usamos el nombre REAL de tu tabla: registros_acceso
        // Usamos fecha_salida en lugar de hora_salida
        const query = `
            SELECT 
                id, 
                nombre_visitante, 
                identificacion_visitante AS identificacion, 
                fecha_entrada,
                placa_vehiculo
            FROM public.registros_acceso 
            WHERE fecha_salida IS NULL 
            ORDER BY fecha_entrada DESC
        `;
        
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        // Esto imprimirá el error real en tu terminal si algo falla
        console.error("DETALLE DEL ERROR EN EL SERVIDOR:", error);
        res.status(500).json({ error: "Error al obtener visitantes de la tabla registros_acceso" });
    }
};