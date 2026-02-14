import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- LOGIN ---
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.trim()]);
        
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ error: "El correo no existe" });
        }

        const usuario = userQuery.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ error: "La contraseña es incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const unidad = await pool.query("SELECT * FROM unidades_residenciales LIMIT 1");
        const requiereConfiguracion = unidad.rows.length === 0;

        return res.json({
            mensaje: "Login exitoso",
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol },
            requiereConfiguracion
        });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: "Error en el servidor" });
    }
};

// --- REGISTRAR ADMIN / CONSERJE / PROPIETARIO ---
export const registrarAdmin = async (req, res) => {
    // 1. Extraer casa_apto del body (que viene del frontend)
    const { nombre_completo, identificacion, email, password, rol, casa_apto, familia, vehiculos } = req.body;
    
    // Foto de perfil principal (admin/conserje/propietario)
    const fotoPath = req.files && req.files['foto'] ? `/uploads/${req.files['foto'][0].filename}` : null;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Validar unicidad de casa si es propietario
        if (rol === 'propietario' && casa_apto) {
            const existeCasa = await client.query("SELECT id FROM usuarios WHERE casa_apto = $1", [casa_apto]);
            if (existeCasa.rows.length > 0) {
                // Usamos return para cortar la ejecución aquí
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "Esta casa/apto ya está registrado por otro propietario" });
            }
        }

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Insertar Usuario Principal (Incluyendo casa_apto)
        const userRes = await client.query(
            "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto, casa_apto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [nombre_completo, identificacion, email, hashedPassword, rol, fotoPath, casa_apto || null]
        );
        const nuevoUsuarioId = userRes.rows[0].id;

        // 5. Lógica de Propietario (Familia y Vehículos)
        if (rol === 'propietario') {
            
            // --- Insertar Familiares con sus respectivas fotos ---
            if (familia) {
                const miembros = JSON.parse(familia);
                const fotosFamiliares = req.files['fotosFamiliares'] || [];

                for (let i = 0; i < miembros.length; i++) {
                    // Mapeamos la foto por el orden en que llegaron
                    const rutaFotoFamiliar = fotosFamiliares[i] ? `/uploads/${fotosFamiliares[i].filename}` : null;
                    
                    await client.query(
                        "INSERT INTO familiares (usuario_id, nombre, identificacion, relacion, foto) VALUES ($1, $2, $3, $4, $5)",
                        [nuevoUsuarioId, miembros[i].nombre, miembros[i].identificacion, miembros[i].relacion, rutaFotoFamiliar]
                    );
                }
            }

            // --- Insertar Vehículos ---
            if (vehiculos) {
                const autos = JSON.parse(vehiculos);
                for (let v of autos) {
                    await client.query(
                        "INSERT INTO vehiculos (usuario_id, placa, tipo, color) VALUES ($1, $2, $3, $4)",
                        [nuevoUsuarioId, v.placa, v.tipo, v.color]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Usuario registrado con éxito" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Error interno al procesar el registro" });
    } finally {
        client.release();
    }
};


export const obtenerUsuarios = async (req, res) => {
    try {
        // Consultamos todos los usuarios de la tabla
        const usuarios = await pool.query(
            "SELECT id, nombre_completo, email, rol, foto, fecha_creacion FROM usuarios ORDER BY id ASC"
        );

        res.json(usuarios.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};



export const configurarInicial = async (req, res) => {
    const { nombre_completo, identificacion, email, unidad_nombre, num_casas, parqueaderos, password } = req.body;
    const adminId = req.usuario.id; // Obtenido del token por el middleware

    try {
        // 1. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Actualizar el administrador (Ya no es el "semilla")
        await pool.query(
            "UPDATE usuarios SET nombre_completo = $1, identificacion = $2, email = $3, password = $4 WHERE id = $5",
            [nombre_completo, identificacion, email, hashedPassword, adminId]
        );

        // 3. Crear la unidad residencial
        await pool.query(
            "INSERT INTO unidades_residenciales (nombre, num_casas, parqueaderos_totales, admin_id) VALUES ($1, $2, $3, $4)",
            [unidad_nombre, num_casas, parqueaderos, adminId]
        );

        res.json({ mensaje: "Configuración inicial completada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar la configuración inicial" });
    }
};



export const obtenerDetalleUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener datos básicos del usuario
        const userRes = await pool.query(
            "SELECT id, nombre_completo, identificacion, email, rol, foto, casa_apto, fecha_creacion FROM usuarios WHERE id = $1",
            [id]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const usuario = userRes.rows[0];

        // 2. Si es propietario, buscar sus "extras"
        let familiares = [];
        let vehiculos = [];

        if (usuario.rol === 'propietario') {
            const famRes = await pool.query("SELECT * FROM familiares WHERE usuario_id = $1", [id]);
            const vehRes = await pool.query("SELECT * FROM vehiculos WHERE usuario_id = $1", [id]);
            familiares = famRes.rows;
            vehiculos = vehRes.rows;
        }

        res.json({
            ...usuario,
            familiares,
            vehiculos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener detalle" });
    }
};


// --- ELIMINAR USUARIO ---
export const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        // Al eliminar al usuario, si tienes ON DELETE CASCADE en la DB, 
        // se borrarán sus familiares y vehículos automáticamente.
        const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
        
        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
};

// --- EDITAR USUARIO (Básico) ---

export const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Extraer datos del body
        const { nombre_completo, email, rol, casa_apto, identificacion, familia, vehiculos } = req.body;

        // 2. Manejo de la FOTO PRINCIPAL (Admin/Conserje/Propietario)
        let rutaFoto = req.body.foto; // Mantiene la actual si no hay cambios

        // Si llega un archivo nuevo en el campo 'foto'
        if (req.files && req.files['foto']) {
            rutaFoto = `/uploads/${req.files['foto'][0].filename}`;
        }

        // Antes de hacer el update/save:
let valorCasa = req.body.casa_apto;

// Si el campo viene vacío o el rol no lo requiere, lo ponemos en NULL
if (!valorCasa || valorCasa.trim() === "" || rol !== 'propietario') {
    valorCasa = null;
}
        // 3. Actualizar datos básicos del Usuario (Incluida la FOTO)
        await client.query(
            `UPDATE usuarios 
             SET nombre_completo = $1, email = $2, rol = $3, casa_apto = $4, identificacion = $5, foto = $6
             WHERE id = $7`,
            [nombre_completo, email, rol, casa_apto, identificacion, rutaFoto, id]
        );

        // 4. Manejar Familiares (Lógica que ya tienes...)
        if (familia) {
            const miembros = typeof familia === 'string' ? JSON.parse(familia) : familia;
            const idsQueSeQuedan = miembros.map(f => f.id).filter(id => id !== null);

            if (idsQueSeQuedan.length > 0) {
                await client.query(
                    `DELETE FROM familiares WHERE usuario_id = $1 AND id NOT IN (${idsQueSeQuedan.join(',')})`,
                    [id]
                );
            } else {
                await client.query("DELETE FROM familiares WHERE usuario_id = $1", [id]);
            }

            const fotosFamiliares = req.files['fotosFamiliares'] || [];
            let fotoIndex = 0;

            for (let f of miembros) {
                let rutaFotoFinal = f.foto;
                if (f.tieneNuevaFoto && fotosFamiliares[fotoIndex]) {
                    rutaFotoFinal = `/uploads/${fotosFamiliares[fotoIndex].filename}`;
                    fotoIndex++;
                }

                if (f.id) {
                    await client.query(
                        "UPDATE familiares SET nombre = $1, identificacion = $2, relacion = $3, foto = $4 WHERE id = $5 AND usuario_id = $6",
                        [f.nombre, f.identificacion, f.relacion, rutaFotoFinal, f.id, id]
                    );
                } else {
                    await client.query(
                        "INSERT INTO familiares (usuario_id, nombre, identificacion, relacion, foto) VALUES ($1, $2, $3, $4, $5)",
                        [id, f.nombre, f.identificacion, f.relacion, rutaFotoFinal]
                    );
                }
            }
        }

        // 5. Manejar Vehículos (Lógica que ya tienes...)
        if (vehiculos) {
            const autos = typeof vehiculos === 'string' ? JSON.parse(vehiculos) : vehiculos;
            const idsVehiculosQueSeQuedan = autos.map(v => v.id).filter(id => id != null);

            if (idsVehiculosQueSeQuedan.length > 0) {
                await client.query(
                    `DELETE FROM vehiculos WHERE usuario_id = $1 AND id NOT IN (${idsVehiculosQueSeQuedan.join(',')})`,
                    [id]
                );
            } else {
                await client.query("DELETE FROM vehiculos WHERE usuario_id = $1", [id]);
            }

            for (let v of autos) {
                if (v.id) {
                    await client.query(
                        "UPDATE vehiculos SET placa = $1, tipo = $2, color = $3 WHERE id = $4 AND usuario_id = $5",
                        [v.placa, v.tipo, v.color, v.id, id]
                    );
                } else {
                    await client.query(
                        "INSERT INTO vehiculos (usuario_id, placa, tipo, color) VALUES ($1, $2, $3, $4)",
                        [id, v.placa, v.tipo, v.color]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ mensaje: "Usuario actualizado con éxito", foto: rutaFoto });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: "Error interno al actualizar" });
    } finally {
        client.release();
    }
};