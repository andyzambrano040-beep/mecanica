const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/auth");
const db = require("../db");

router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  console.log('GET /api/propietarios/' + id + ' - params:', req.params);
  const query = "select * from propietarios where prop_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener el propietario" });
    }
    console.log('DB result length for GET /' + id + ':', result.length);
    if (result.length === 0) {
      return res.status(404).json({ error: "Este propietario no existe" });
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
    whereClause = "where prop_id like ? or prop_nombre like ?";
    const searchTerm = `%${cadena}%`;
    queryParams.push(searchTerm, searchTerm);
  }
  // consulta a la base de datos para obtener registros

  const countQuery = `select count(*) as total from propietarios ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: countQuery });
    }
    const totalPropietarios = countResult[0].total;
    const totalPages = Math.ceil(totalPropietarios / limit);


        //comsulta obtener los registros
        const propietariosQuery = 'select * from propietarios limit ? offset ?';

        db.query(propietariosQuery, [limit, offset], (err, propietariosResult)=>{
            if(err){
                console.error(err);
                return res.status(500).json({error: 'Error al obtener los propietarios'});
            }
            // respuesta con los datos y la paginacion
            res.json({
                totalItems: totalPropietarios,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: propietariosResult
            })
        });
    });
});


// METODO POST
router.post("/", verifyToken, (req, res) => {
  const { prop_cedula, prop_nombre, prop_telefono, prop_direccion, user_id } =
    req.body;
  const search_query = "select count(*) as contador from propietarios where prop_nombre = ?";
  db.query(search_query, [prop_nombre], (err, search_result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error interno al verificar el Propietario" });
    }
    if (search_result[0].contador > 0) {
      return res.status(400).json({ error: "El propietario con nombre '" + prop_nombre + "' ya existe" });
    }

    const query =
      "insert into propietarios (prop_cedula, prop_nombre, prop_telefono, prop_direccion, user_id) values (?, ?, ?, ?, ?)";
    const values = [
      prop_cedula,
      prop_nombre,
      prop_telefono,
      prop_direccion,
      user_id,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al crear el propietario " });
      }
      res.status(200).json({
        message: "El propietario con nombre: " + prop_nombre + " se creó exitosamente",
        prop_id: result.insertId,
      });
    });
  });
});

//metodo put para actualizar un registro
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  console.log('PUT /api/propietarios/' + id, { body: req.body });
  const { prop_cedula, prop_nombre, prop_telefono, prop_direccion  } =
    req.body;
  const query =
    "update propietarios set prop_cedula = ?, prop_nombre = ?, prop_telefono = ?, prop_direccion = ? where prop_id = ?";
  const values = [
    prop_cedula,
    prop_nombre,
    prop_telefono,
    prop_direccion,
    id
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al actualizar el propietario" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Propietario no encontrado" });
    }
    res.status(200).json({
      message: "Propietario con ID " + id + " modificado exitosamente ",
    });
  });
});
//Metodo delete para eliminar un registro
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const query = "delete from propietarios where prop_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al eliminar el propietario" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Propietario no encontrado" });
    }
    res.status(200).json({
      message: "Propietario con ID " + id + " eliminado exitosamente ",
    });
  });
});
module.exports = router;
