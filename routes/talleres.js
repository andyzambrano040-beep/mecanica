const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/auth");
const db = require("../db");

//Metodo Get para multiples registros con paginacion

router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const query = "select * from talleres where tall_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener el taller" });
    }
    if (result.length === 0) {
      return res.status(409).json({ error: "Este Taller no existe" });
    }
    res.json(result[0]);
  });
});

router.get("/", verifyToken, (req, res) => {
  // obtener parametros para la URL
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const cadena = req.query.cadena;
  let whereClause = "";
  let queryParams = [];
  if (cadena) {
    whereClause = "where tall_id like ? or tall_nombre like ?";
    const searchTerm = `%${cadena}%`;
    queryParams.push(searchTerm, searchTerm);
  }
  // consulta a la base de datos para obtener registros

  const countQuery = `select count(*) as total from talleres ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: countQuery });
    }
    const totalTalleres = countResult[0].total;
    const totalPages = Math.ceil(totalTalleres / limit);

    //comsulta obtener los registros
    const talleresQuery = `select * from talleres ${whereClause} limit ? offset ?`;
    queryParams.push(limit, offset);
    db.query(talleresQuery, queryParams, (err, talleresResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener los talleres" });
      }
      // respuesta con los datos y la paginacion
      res.json({
        totalItems: totalTalleres,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        data: talleresResult,
      });
    });
  });
});

// METODO POST
router.post("/", verifyToken, (req, res) => {
  const { tall_nombre, tall_direccion, tall_telefono, tall_especialidad } =
    req.body;
  const search_query =
    "select count (*) as contador from talleres where tall_nombre = ?";
  db.query(search_query, [tall_nombre], (err, search_result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Error interno al verificar el Taller" });
    }
    if (search_result[0].contador > 0) {
      return res.status(400).json({ error: "El Taller con nombre " + tall_nombre + " ya existe" });
    }
  });
  const query =
    "insert into talleres (tall_nombre, tall_direccion, tall_telefono, tall_especialidad) values (?, ?, ?, ?)";
  const values = [
    tall_nombre,
    tall_direccion,
    tall_telefono,
    tall_especialidad,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al crear el taller " });
    }
    res.status(200).json({
      message: "El taller con nombre: " + tall_nombre + " se creó exitosamente",
      tall_id: result.insertId,
    });
  });
});

//metodo put para actualizar un registro
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { tall_nombre, tall_direccion, tall_telefono, tall_especialidad } =
    req.body;
  const query =
    "update talleres set tall_nombre = ?, tall_direccion = ?, tall_telefono = ?, tall_especialidad = ? where tall_id = ?";
  const values = [
    tall_nombre,
    tall_direccion,
    tall_telefono,
    tall_especialidad,
    id,
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al actualizar el taller" });
    }
    if (result.affectedRows === 0) {
      return res.status(409).json({ error: "Taller no encontrado" });
    }
    res.status(200).json({
      message: "Taller con ID " + id + " modificado exitosamente ",
    });
  });
});
//Metodo delete para eliminar un registro
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const search_query = "select count(*) as contador from talleres where tall_id = ?";
  db.query(search_query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al interno verificar el mantenimiento" });
    }
    if (result[0].contador > 0) {
      return res.status(409).json({ error: "El taller no se puede eliminar ya que mantiene un mantenimiento agregado" });
    }
  });
  const query = "delete from talleres where tall_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al eliminar" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }
    res.status(200).json({
      message: "Taller con ID " + id + " eliminado exitosamente ",
    });
  });
});
module.exports = router;