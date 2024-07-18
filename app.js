const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
const datosDir = path.join(__dirname, 'public', 'datos');
app.get('/datos/:archivo', (req, res) => {
    const archivo = req.params.archivo;
    const filePath = path.join(datosDir, `${archivo}.json`);
    leerArchivoJSON(filePath, res);
});

app.post('/ai_mistral', async (req, res) =>{
    let prompt = `En español, Actúa como un contador profesional. que está ocurriendo con la empresa tomando en cuenta el resultado y que medidas debería tomar con los siguientes datos dados. `
    prompt += req.body.question
    if(req.body.question_second){
      prompt += " Comparala con este año y mes "+req.body.question_second
    }
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer QkfU8NHwSTp4gW9ecdP4GVFSG0aQjkQ3`
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            top_p: 1,
            max_tokens: 2048,
            stream: false,
            safe_prompt: false,
            random_seed: 1337
          })
        });
        // req.body.message || 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return res.json({"response":data.choices[0].message.content});
      } catch (error) {
        console.error('Error calling Mistral AI API:', error);
        res.status(500).json({ error: 'Error processing your request' });
      }
})

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
