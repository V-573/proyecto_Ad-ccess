import pool from '../config/db.js';


export const obtenerEstadoParqueadero = async () => {
    try {
        // Verifica que la tabla se llame 'unidades_residenciales' 
        // y la columna 'parqueaderos_totales'
        const unidadRes = await pool.query("SELECT parqueaderos_totales FROM unidades_residenciales LIMIT 1");
        
        // Si la tabla está vacía, esto daría error, por eso el check:
        const totalCapacidad = unidadRes.rows.length > 0 ? parseInt(unidadRes.rows[0].parqueaderos_totales) : 0;

        const ocupadosRes = await pool.query(
            "SELECT COUNT(*)::int FROM registros_acceso WHERE tiene_vehiculo = TRUE AND fecha_salida IS NULL"
        );
        
        const ocupados = ocupadosRes.rows[0].count || 0;

        return {
            total: totalCapacidad,
            ocupados: ocupados,
            disponibles: Math.max(0, totalCapacidad - ocupados)
        };
    } catch (error) {
        // ESTO TE DIRÁ EL ERROR REAL EN LA TERMINAL DEL BACKEND
        console.error("ERROR CRÍTICO EN obtenerEstadoParqueadero:", error.message);
        throw error; 
    }
};

export const registrarEntrada = async (datos, usuario_id) => {
    // IMPORTANTE: Los nombres aquí deben coincidir con lo que envías en el frontend (datosAEnviar)
    const { 
        nombre_visitante, 
        identificacion_visitante, 
        usuario_visitado_id, 
        motivo, 
        observaciones, 
        tiene_vehiculo, 
        placa_vehiculo 
    } = datos;
    
    // Validar cupo si trae vehículo
    if (tiene_vehiculo) {
        const estado = await obtenerEstadoParqueadero();
        if (estado.disponibles <= 0) {
            const error = new Error("CAPACIDAD_PARQUEADERO_AGOTADA");
            error.status = 400; // Para que el controlador sepa que es un error de cliente
            throw error;
        }
    }

    // El INSERT debe usar los nombres de las columnas de tu tabla SQL
    const res = await pool.query(
        `INSERT INTO registros_acceso 
        (nombre_visitante, identificacion_visitante, usuario_visitado_id, motivo, conserje_id, observaciones, tiene_vehiculo, placa_vehiculo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
            nombre_visitante, 
            identificacion_visitante, 
            usuario_visitado_id, 
            motivo, 
            usuario_id, 
            observaciones || '', 
            tiene_vehiculo || false, 
            tiene_vehiculo ? placa_vehiculo.toUpperCase() : null
        ]
    );
    return res.rows[0];
};


export const registrarSalida = async (registroId) => {
    const res = await pool.query(
        "UPDATE registros_acceso SET fecha_salida = CURRENT_TIMESTAMP WHERE id = $1 AND fecha_salida IS NULL RETURNING *",
        [registroId]
    );
    return res.rows[0];
};

export const listarMovimientos = async () => {
    const res = await pool.query(`
        SELECT r.*, u.nombre_completo as visitado_nombre, g.nombre_completo as conserje_nombre
        FROM registros_acceso r
        LEFT JOIN usuarios u ON r.usuario_visitado_id = u.id
        LEFT JOIN usuarios g ON r.conserje_id = g.id
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};

// Para el resumen de la pantalla de INICIO (Personas que no han salido)
export const obtenerPresentes = async () => {
    const res = await pool.query(`
        SELECT r.id, r.nombre_visitante, r.identificacion_visitante, 
               u.casa_apto, r.fecha_entrada, r.motivo
        FROM registros_acceso r
        JOIN usuarios u ON r.usuario_visitado_id = u.id
        WHERE r.fecha_salida IS NULL
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};

// Para la pantalla de VISITANTES (Historial reciente para marcar salidas)
export const listarVisitantesActivos = async () => {
    const res = await pool.query(`
        SELECT r.*, u.nombre_completo as visitado_nombre, u.casa_apto
        FROM registros_acceso r
        JOIN usuarios u ON r.usuario_visitado_id = u.id
        WHERE r.fecha_salida IS NULL  -- <--- ESTO ES LO CLAVE: Solo los que no han salido
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};


export const listarHistorialVisitantes = async () => {
    const res = await pool.query(`
        SELECT 
            r.id,
            r.nombre_visitante,
            r.identificacion_visitante,
            r.placa_vehiculo,
            r.fecha_entrada,
            r.fecha_salida,
            u.nombre_completo as visitado_nombre,
            u.casa_apto
        FROM registros_acceso r
        JOIN usuarios u ON r.usuario_visitado_id = u.id
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};