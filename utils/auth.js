const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Router } = require('express');


const JWT_SECRET = process.env.JWT_SECRET;

//funcion para generar un token jwt
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'});
};

//middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  //console.log('Token recibido por el backend:', token);
  if (!token) { 
    return res.status(401).json({ message: 'No se recibe el token' });
  }
  try {
   
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = decoded; //añade la informacion del usuario a la peticion
    next(); //permite la peticion coninue
  } catch (error) {
    return res.status(401).json({ message: 'token no validos' });
  }
};

module.exports = {generateToken,verifyToken};
