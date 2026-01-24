const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registro unico
router.get('/:vehi_id', verifyToken,(req,res)=>{
    const {id} =req.params;//capturar el id desde los parametros de la url
    const query = 'SELECT * FROM `vehiculos` WHERE vehi_id = ?;';
    db.query(query, [id], (err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).json({error: 'Error al obtener el vehiculo'})
        } 
        if (results.length === 0) {
            return res.status(404).json({error:'Vehiculo no encontrado'})
        }
        res.json(results[0]);
    });
});

//Metodo Get paramultiples registos con paginacion
router.get('/', verifyToken, (req, res) =>{
    //obtener parametro url
    const page =parseInt(req.query.page) || 1;//pagina actual,por defecto
    const limit= parseInt(req.query.limit) ||11;//limite de registros,por defecto 10
    const offset=(page - 1) * limit;//el punto de inicio de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams=[];
    if (cadena) {
        whereClause = 'where vehi_placa like ? or vehi_marca like ? or vehi_modelo like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);

    }
    //consulta para optener total de registros
    const countQuery = `select count(*) as total from vehiculos ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult)=> {
        if (err) {
            console.error(err);
            return res.status(500).json({error: 'Error al obtener total de vehiculos'})
        }
        const totalVehuculos = countResult[0].total;
        const totalPages = Math.ceil(totalVehuculos / limit);
        //consulta para obtener los registros de la pagina
        //const vehiculosQuery = `select * from vehiculos ${whereClause}LIMIT ? OFFSET ? `;
        const vehiculosQuery = `SELECT v.vehi_id, v.vehi_placa, v.vehi_color, v.vehi_marca, v.vehi_modelo, v.vehi_anio, v.prop_id, p.prop_nombre FROM vehiculos v INNER JOIN propietarios p ON v.prop_id = p.prop_id ${whereClause}LIMIT ? OFFSET ? `;
        queryParams.push(limit,offset);
        db.query(vehiculosQuery, queryParams, (err,vehiculosResult) => {
            if (err) {
               console.error(err); 
               return res.status(500).json({error: 'Error al obtener los vehiculos'});
            }
            //Enviar respuesta con los datos y la informacion de paginacion
            res.json({
                totalItems: totalVehuculos,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: vehiculosResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken,(req,res)=>{
    //obtener los datos
    const {vehi_placa,vehi_color,vehi_marca,vehi_modelo,vehi_anio,prop_id}= req.body;
    const search_query = 'select count(*) as contador from vehiculos where vehi_placa = ?';
    db.query(search_query, [vehi_placa], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar el vehiculo' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El vehiculo con placa "+vehi_placa+" ya existe" });
        }
        const query = 'insert into vehiculos values(null, ?,?,?,?,?,?)';
        const values = [vehi_placa,vehi_color,vehi_marca,vehi_modelo,vehi_anio,prop_id];
        db.query(query,values,(err, result)=>{
            if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error al insertar vehiculos'});
            }
            res.status(201).json({
            message: 'Vehiculo insertado correctamente',
            vehi_id: result.insertId
            });
        });
    });

});

//Metodo PUT
router.put('/:id', verifyToken,(req,res)=>{
    const {id} =req.params;
    const {vehi_placa,vehi_color,vehi_marca,vehi_modelo,vehi_anio,prop_id}= req.body;
    const query = 'update vehiculos set vehi_placa = ?, vehi_color = ?,vehi_marca = ?,vehi_modelo = ?,vehi_anio = ?,prop_id = ? where vehi_id = ?;';
    const values = [vehi_placa,vehi_color,vehi_marca,vehi_modelo,vehi_anio,prop_id,id];
    db.query(query,values,(err, result)=>{
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error al editar vehiculos'});
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({menssaje: "Vehiculo no encontrado"})
        }
        res.status(200).json({
            menssaje: 'Vehiculo actualizado correctamente',
        });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const search_query = 'select count(*) as contador from mantenimientos where vehi_id = ?';
  db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar el mantenimiento' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El vehiculo no se puede elimiarporeque tiene un mantenimiento registrado" });
        }
         const query = 'DELETE FROM vehiculos WHERE vehi_id = ?';
         db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar vehiculo' });
            }
            if (result.affectedRows === 0) {
         return res.status(404).json({ menssaje: 'Vehiculo no encontrado' });
            }
         res.status(200).json({ menssaje: 'Vehiculo eliminado correctamente' });
        });
    }); 
});

module.exports = router;