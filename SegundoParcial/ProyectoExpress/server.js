const express = require('express');

const talleres = require('./Controlador/controlador_talleres');
const asistencias = require('./Controlador/asistencia_controlador');
const usuarios = require('./Controlador/usuario_controlador');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4000;

// Prueba de vida
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Registro de Asistencia - CECyT 9 funcionando correctamente' });
});

// Ejemplos de clase
app.get('/saludo', (req, res) => {
    res.json({ mensaje: 'Hola esto es una prueba en GET' });
});

app.post('/eco', (req, res) => {
    const { texto } = req.body || {};
    if (!texto) {
        return res.status(400).json({ error: 'El texto es obligatorio' });
    }
    res.status(201).json({ eco: texto });
});

// Talleres
app.get('/api/talleres', talleres.listarTalleres);
app.get('/api/talleres/:id/asistencias', asistencias.consultarAsistenciaPorTaller);
app.get('/api/talleres/:id', talleres.verTaller);
app.post('/api/talleres', talleres.crearTaller);

// Asistencias
app.post('/api/asistencias', asistencias.registrarAsistencia);

// Usuarios (CRUD)
app.get('/api/usuarios', usuarios.listarUsuarios);
app.get('/api/usuarios/:id', usuarios.obtenerUsuario);
app.post('/api/usuarios', usuarios.crearUsuario);
app.put('/api/usuarios/:id', usuarios.actualizarUsuario);
app.delete('/api/usuarios/:id', usuarios.eliminarUsuario);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});
