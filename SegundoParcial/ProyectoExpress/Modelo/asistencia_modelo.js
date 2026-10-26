const crypto = require('crypto');
const pool = require('../bd-local');

// Registrar a un alumno en un taller
async function registrarAsistencia({ taller_id, nombre_alumno, boleta }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta)
         VALUES (?, ?, ?, ?)`,
        [id, taller_id, nombre_alumno, boleta]
    );
    const [filas] = await pool.query(
        `SELECT id, taller_id, nombre_alumno, boleta, fecha_registro
         FROM asistencias WHERE id = ?`,
        [id]
    );
    return filas[0];
}

// Consultar las asistencias de un taller
async function consultarAsistenciaPorTaller(taller_id) {
    const [filas] = await pool.query(
        `SELECT id, taller_id, nombre_alumno, boleta, fecha_registro
         FROM asistencias
         WHERE taller_id = ?
         ORDER BY fecha_registro`,
        [taller_id]
    );
    return filas;
}

module.exports = { registrarAsistencia, consultarAsistenciaPorTaller };
