const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 🔹 Criar avaliação
router.post("/", (req, res) => {
  const { cliente_id, vendedor_id, nota, comentario } = req.body;

  const sql = `
    INSERT INTO avaliacoes (cliente_id, vendedor_id, nota, comentario)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [cliente_id, vendedor_id, nota, comentario], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Avaliação enviada");
  });
});

// 🔹 Listar avaliações de um vendedor
router.get("/vendedor/:id", (req, res) => {
  const sql = `
    SELECT a.*, c.nome AS cliente_nome
    FROM avaliacoes a
    JOIN cliente c ON a.cliente_id = c.id
    WHERE vendedor_id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

module.exports = router;