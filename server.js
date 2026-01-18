const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Importar rutas
const authRoutes = require('./routes/auth');
const vehiculosRoutes = require('./routes/vehiculos');

//usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);

//Rutas de ejemplos
app.get('/', (req, res) => {
    res.send('Hola desde el servidor Express')
});

//Iniciar el servidor
app.listen(port,() => {
    console.log(`Servidor escuchando en el puerto ${port}`)
});
