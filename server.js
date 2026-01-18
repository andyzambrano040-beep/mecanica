const express = require('express');
const app = express();

app.use(express.json());

// RUTA BASE
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// AUTH (COMÚN)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
