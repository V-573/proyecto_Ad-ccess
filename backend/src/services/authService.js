import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Genera un token JWT para un usuario
 * @param {Object} usuario - Objeto con id y rol del usuario
 * @returns {string} Token firmado
 */
export const generarToken = (usuario) => {
    return jwt.sign(
        { 
            id: usuario.id, 
            rol: usuario.rol 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '8h' // El token expira en 8 horas
        }
    );
};

/**
 * Compara una contraseña en texto plano con un hash de la base de datos
 * @param {string} password - Contraseña enviada por el usuario
 * @param {string} hash - Hash guardado en la BD
 * @returns {Promise<boolean>}
 */
export const compararPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Encripta una contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña encriptada (hash)
 */
export const encriptarPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};