const asistenciaModelo = require('../Modelo/asistencia_modelo');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

// POST /api/asistencias
async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    try {
        const asistencia = await asistenciaModelo.registrarAsistencia({ taller_id, nombre_alumno, boleta });
        res.status(201).json(asistencia);
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: 'El alumno ya esta registrado en este taller' });
        }
        // Si el taller no existe, la llave foranea falla y cae aqui (500)
        res.status(500).json({ error: error.message });
    }
}

// GET /api/talleres/:id/asistencias
async function consultarAsistenciaPorTaller(req, res) {
    try {
        const asistencias = await asistenciaModelo.consultarAsistenciaPorTaller(req.params.id);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { registrarAsistencia, consultarAsistenciaPorTaller };
