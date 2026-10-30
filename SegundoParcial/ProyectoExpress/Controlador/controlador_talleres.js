const talleresModelo = require('../Modelo/talleres_modelo');
const { validarNombreTaller, validarInstructor, validarFecha, validarCupo } = require('../validaciones');

// GET /api/talleres
async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModelo.consultarTodos();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// GET /api/talleres/:id
async function verTaller(req, res) {
    try {
        const taller = await talleresModelo.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
        res.json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// POST /api/talleres
async function crearTaller(req, res) {
    const { nombre, instructor, fecha, cupo } = req.body || {};

    if (!nombre || !fecha) {
        return res.status(400).json({ error: 'nombre y fecha son obligatorios' });
    }
    if (!validarNombreTaller(nombre)) {
        return res.status(400).json({ error: 'El nombre del taller debe tener de 3 a 100 caracteres' });
    }
    const hayInstructor = instructor !== undefined && instructor !== null && instructor !== '';
    if (hayInstructor && !validarInstructor(instructor)) {
        return res.status(400).json({ error: 'El instructor solo puede tener letras, espacios y puntos (de 3 a 100 caracteres)' });
    }
    if (!validarFecha(fecha)) {
        return res.status(400).json({ error: 'La fecha no es válida (usa el formato AAAA-MM-DD)' });
    }
    const hayCupo = cupo !== undefined && cupo !== null;
    if (hayCupo && !validarCupo(cupo)) {
        return res.status(400).json({ error: 'El cupo debe ser un número entero entre 1 y 500' });
    }

    try {
        const taller = await talleresModelo.crear({
            nombre: nombre.trim(),
            instructor: hayInstructor ? instructor.trim() : null,
            fecha,
            cupo: hayCupo ? Number(cupo) : 30,
        });
        res.status(201).json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { listarTalleres, verTaller, crearTaller };
