import pool from '../backend/src/config/db.js'; // Ajusta la ruta a tu config de DB
import bcrypt from 'bcryptjs';

const crearUsuarioReferencia = async () => {
    const nombre = "Admin de Referencia";
    const email = "admin@adccess.com";
    const passwordClaro = "admin123"; // La contraseña que usarás para loguearte
    const identificacion = "99999999";
    const rol = "admin";

    try {
        // 1. Encriptamos la contraseña tal cual lo hace tu backend
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordClaro, salt);

        // 2. Limpiamos si ya existe (opcional, para evitar errores de duplicado)
        await pool.query("DELETE FROM usuarios WHERE email = $1", [email]);

        // 3. Insertamos el usuario "plantilla"
        await pool.query(
            "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol) VALUES ($1, $2, $3, $4, $5)",
            [nombre, identificacion, email, hashedPassword, rol]
        );

        console.log("-----------------------------------------");
        console.log("✅ Usuario de referencia creado con éxito");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${passwordClaro}`);
        console.log("-----------------------------------------");

        process.exit();
    } catch (error) {
        console.error("❌ Error al crear el usuario:", error);
        process.exit(1);
    }
};

crearUsuarioReferencia();