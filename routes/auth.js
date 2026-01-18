const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db =require('../db');
const { generateToken } = require("../utils/auth");


router.post('/login', (req, res) => {
  const { user_usuario, user_password } = req.body;
  db.query(
    'select * from usuarios where user_usuario = ?',[user_usuario],async (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
      const user = result[0];
      const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
      //console.log({id: user.user_id,user_usuario: user.user_usuario});
      const token = generateToken({id: user.user_id,user_usuario: user.user_usuario});
      res.json({ message: "Logeo exitoso", token });
    }
  );
});
module.exports = router;