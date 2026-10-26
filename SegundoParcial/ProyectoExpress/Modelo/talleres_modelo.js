const crypto = require('crypto');
const pool = require('../bd-local');

// Consultar todos los talleres
async function consultarTodos() {
    const [filas] = await pool.query(
        `SELECT id, nombre, instructor, fecha, cupo
         FROM talleres
         ORDER BY fecha, nombre`
    );
    return filas;
}

// Obtener un taller por id, con el numero de asistentes (undefined si no existe)
async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT t.id, t.nombre, t.instructor, t.fecha, t.cupo,
                COUNT(a.id) AS asistentes
         FROM talleres t
         LEFT JOIN asistencias a ON a.taller_id = t.id
         WHERE t.id = ?
         GROUP BY t.id, t.nombre, t.instructor, t.fecha, t.cupo`,
        [id]
    );
    return filas[0];
}

// Crear un taller nuevo
async function crear({ nombre, instructor, fecha, cupo }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO talleres (id, nombre, instructor, fecha, cupo)
         VALUES (?, ?, ?, ?, ?)`,
        [id, nombre, instructor ?? null, fecha, cupo ?? null]
    );
    const [filas] = await pool.query(
        `SELECT id, nombre, instructor, fecha, cupo FROM talleres WHERE id = ?`,
        [id]
    );
    return filas[0];
}

module.exports = { consultarTodos, obtenerPorId, crear };
