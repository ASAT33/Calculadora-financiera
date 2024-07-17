const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, 'public')));
const datosDir = path.join(__dirname, 'public', 'datos');
app.get('/datos/:archivo', (req, res) => {
    const archivo = req.params.archivo;
    const filePath = path.join(datosDir, `${archivo}.json`);
    leerArchivoJSON(filePath, res);
});

// Función para leer y enviar un archivo JSON como respuesta
function leerArchivoJSON(filePath, res) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (error) {
            console.error('Error al parsear JSON:', error);
            res.status(500).json({ error: 'Error al parsear JSON' });
        }
    });
}

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
