const crypto = require('crypto');
const pool = require('../bd-local');

// MySQL guarda asistio como 0 o 1; hacia afuera lo mandamos como true o false.
function normalizar(fila) {
    return fila ? { ...fila, asistio: Boolean(fila.asistio) } : fila;
}

const COLUMNAS = 'id, taller_id, nombre_alumno, boleta, asistio, fecha_registro';

// La tabla original no guarda si el alumno vino. Si falta la columna, se agrega sola.
async function prepararTabla() {
    const [columnas] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'asistencias'
           AND COLUMN_NAME = 'asistio'`
    );
    if (columnas.length === 0) {
        await pool.query(
            `ALTER TABLE asistencias ADD COLUMN asistio TINYINT(1) NOT NULL DEFAULT 0`
        );
        console.log('Columna asistio agregada a la tabla asistencias');
    }
}

// Obtener una asistencia por id (undefined si no existe)
async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS} FROM asistencias WHERE id = ?`,
        [id]
    );
    return normalizar(filas[0]);
}

// Saber si una boleta ya esta inscrita en un taller
async function existeInscripcion(taller_id, boleta) {
    const [filas] = await pool.query(
        `SELECT id FROM asistencias WHERE taller_id = ? AND boleta = ? LIMIT 1`,
        [taller_id, boleta]
    );
    return filas.length > 0;
}

// Registrar a un alumno en un taller (empieza como "no vino")
async function registrarAsistencia({ taller_id, nombre_alumno, boleta }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta)
         VALUES (?, ?, ?, ?)`,
        [id, taller_id, nombre_alumno, boleta]
    );
    return obtenerPorId(id);
}

// Consultar las asistencias de un taller
async function consultarAsistenciaPorTaller(taller_id) {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS}
         FROM asistencias
         WHERE taller_id = ?
         ORDER BY fecha_registro`,
        [taller_id]
    );
    return filas.map(normalizar);
}

// Consultar las asistencias de un alumno (por boleta), con los datos del taller
async function consultarAsistenciaPorBoleta(boleta) {
    const [filas] = await pool.query(
        `SELECT a.id, a.taller_id, t.nombre AS taller_nombre, t.fecha AS taller_fecha,
                a.nombre_alumno, a.boleta, a.asistio
         FROM asistencias a
         JOIN talleres t ON t.id = a.taller_id
         WHERE a.boleta = ?
         ORDER BY t.fecha, t.nombre`,
        [boleta]
    );
    return filas.map(normalizar);
}

// Marcar si el alumno vino (true) o no vino (false). Devuelve undefined si no existe.
async function marcarAsistio(id, asistio) {
    const existente = await obtenerPorId(id);
    if (!existente) return undefined;
    await pool.query(
        `UPDATE asistencias SET asistio = ? WHERE id = ?`,
        [asistio ? 1 : 0, id]
    );
    return obtenerPorId(id);
}

module.exports = {
    prepararTabla,
    obtenerPorId,
    existeInscripcion,
    registrarAsistencia,
    consultarAsistenciaPorTaller,
    consultarAsistenciaPorBoleta,
    marcarAsistio,
};
