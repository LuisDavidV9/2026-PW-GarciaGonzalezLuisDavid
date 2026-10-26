const talleresModelo = require('../Modelo/talleres_modelo');

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

    try {
        const taller = await talleresModelo.crear({ nombre, instructor, fecha, cupo });
        res.status(201).json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { listarTalleres, verTaller, crearTaller };
