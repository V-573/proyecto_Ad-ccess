import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Asegúrate de haber instalado jsonwebtoken

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario
        const userQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.trim()]);
        
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ error: "El correo no existe" });
        }

        const usuario = userQuery.rows[0];

        // 2. Validar contraseña
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ error: "La contraseña es incorrecta" });
        }

        // 3. Crear el Token (PRIMERO creamos el token)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Validar si requiere configuración inicial
        const unidad = await pool.query("SELECT * FROM unidades_residenciales LIMIT 1");
        const requiereConfiguracion = unidad.rows.length === 0;

        // 5. ÚNICA RESPUESTA FINAL
        return res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            },
            requiereConfiguracion
        });

    } catch (error) {
        console.error(error);
        // Evitamos enviar respuesta si ya se enviaron cabeceras
        if (!res.headersSent) {
            return res.status(500).json({ error: "Error en el servidor" });
        }
    }
};

// export const registrarAdmin = async (req, res) => {
//     const { nombre_completo, email, password, identificacion, rol } = req.body;
//     const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;
  

//     try {
//         // 1. Verificar si el usuario ya existe
//         const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
//         if (existe.rows.length > 0) {
//             return res.status(400).json({ error: "El correo ya está registrado" });
//         }

//         // 2. Encriptar la contraseña
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Guardar en la DB
//         const nuevoUsuario = await pool.query(
//             // "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre_completo, identificacion, email, rol",
//             "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
//             [nombre_completo, identificacion, email, hashedPassword, rol || 'admin', fotoPath]
//         );

//         res.status(201).json({
//             mensaje: "Administrador registrado con éxito",
//             usuario: nuevoUsuario.rows[0]
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error al registrar"});
//     }


// };


export const registrarAdmin = async (req, res) => {
    const { nombre_completo, identificacion, email, password, rol, casa_id, familia, vehiculos } = req.body;
    const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const client = await pool.connect(); // Usamos un cliente para la transacción

    try {
        await client.query('BEGIN'); // Iniciamos la transacción

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Insertar el Usuario Principal
        const userRes = await client.query(
            "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [nombre_completo, identificacion, email, hashedPassword, rol, fotoPath]
        );
        const nuevoUsuarioId = userRes.rows[0].id;

        // 2. Si es Propietario, insertar datos extra
        if (rol === 'propietario') {
            // Insertar familiares
            if (familia) {
                const miembros = JSON.parse(familia);
                for (let m of miembros) {
                    await client.query(
                        "INSERT INTO familiares (usuario_id, nombre, identificacion, relacion) VALUES ($1, $2, $3, $4)",
                        [nuevoUsuarioId, m.nombre, m.identificacion, m.relacion]
                    );
                }
            }

            // Insertar vehículos
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

        await client.query('COMMIT'); // Guardamos todo
        res.status(201).json({ message: "Usuario y datos adicionales registrados con éxito" });

    } catch (error) {
        await client.query('ROLLBACK'); // Si algo falla, deshacemos todo
        console.error(error);
        res.status(500).json({ error: "Error en el registro completo" });
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

