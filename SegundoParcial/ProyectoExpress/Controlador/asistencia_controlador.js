const asistenciaModelo = require('../Modelo/asistencia_modelo');
const talleresModelo = require('../Modelo/talleres_modelo');
const { validarBoleta, validarNombre, validarId } = require('../validaciones');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

// POST /api/asistencias  (inscribe a un alumno en un taller)
async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }
    if (!validarId(taller_id)) {
        return res.status(400).json({ error: 'taller_id no es válido' });
    }
    if (!validarNombre(nombre_alumno)) {
        return res.status(400).json({ error: 'El nombre solo puede tener letras y espacios (de 3 a 100 caracteres)' });
    }
    if (!validarBoleta(boleta)) {
        return res.status(400).json({ error: 'La boleta debe tener exactamente 10 dígitos' });
    }

    try {
        const taller = await talleresModelo.obtenerPorId(taller_id);
        if (!taller) {
            return res.status(404).json({ error: 'Taller no encontrado' });
        }
        if (taller.cupo !== null && Number(taller.asistentes) >= Number(taller.cupo)) {
            return res.status(409).json({ error: 'El taller ya no tiene lugares' });
        }
        if (await asistenciaModelo.existeInscripcion(taller_id, String(boleta))) {
            return res.status(409).json({ error: 'El alumno ya esta registrado en este taller' });
        }

        const asistencia = await asistenciaModelo.registrarAsistencia({
            taller_id,
            nombre_alumno: nombre_alumno.trim(),
            boleta: String(boleta),
        });
        res.status(201).json(asistencia);
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: 'El alumno ya esta registrado en este taller' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'Taller no encontrado' });
        }
        res.status(500).json({ error: error.message });
    }
}

// GET /api/talleres/:id/asistencias  (alumnos de un taller y si vinieron)
async function consultarAsistenciaPorTaller(req, res) {
    const { id } = req.params;
    if (!validarId(id)) {
        return res.status(400).json({ error: 'El id del taller no es válido' });
    }

    try {
        const taller = await talleresModelo.obtenerPorId(id);
        if (!taller) {
            return res.status(404).json({ error: 'Taller no encontrado' });
        }
        const asistencias = await asistenciaModelo.consultarAsistenciaPorTaller(id);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// GET /api/asistencias/boleta/:boleta  (talleres de un alumno y si vino)
async function consultarAsistenciaPorBoleta(req, res) {
    const { boleta } = req.params;
    if (!validarBoleta(boleta)) {
        return res.status(400).json({ error: 'La boleta debe tener exactamente 10 dígitos' });
    }

    try {
        const asistencias = await asistenciaModelo.consultarAsistenciaPorBoleta(boleta);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// PATCH /api/asistencias/:id  (marca si el alumno vino: { "asistio": true | false })
async function marcarAsistencia(req, res) {
    const { id } = req.params;
    const { asistio } = req.body || {};

    if (!validarId(id)) {
        return res.status(400).json({ error: 'El id de la asistencia no es válido' });
    }
    if (typeof asistio !== 'boolean') {
        return res.status(400).json({ error: 'asistio debe ser true o false' });
    }

    try {
        const asistencia = await asistenciaModelo.marcarAsistio(id, asistio);
        if (!asistencia) {
            return res.status(404).json({ error: 'Asistencia no encontrada' });
        }
        res.json(asistencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    registrarAsistencia,
    consultarAsistenciaPorTaller,
    consultarAsistenciaPorBoleta,
    marcarAsistencia,
};
