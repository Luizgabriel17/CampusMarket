const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 🔹 Criar produto (VENDEDOR)
router.post("/", (req, res) => {
  const { nome, descricao, preco, estoque, vendedor_id } = req.body;

  const sql = `
    INSERT INTO produtos (nome, descricao, preco, estoque, vendedor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, descricao, preco, estoque, vendedor_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Produto criado com sucesso");
  });
});

// 🔹 Listar produtos (com nome do vendedor)
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, v.nome AS vendedor_nome
    FROM produtos p
    JOIN vendedor v ON p.vendedor_id = v.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 🔹 Buscar produto por ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM produtos WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// 🔹 Atualizar produto
router.put("/:id", (req, res) => {
  const { nome, descricao, preco, estoque, status } = req.body;

  const sql = `
    UPDATE produtos 
    SET nome=?, descricao=?, preco=?, estoque=?, status=? 
    WHERE id=?
  `;

  db.query(sql, [nome, descricao, preco, estoque, status, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Produto atualizado");
  });
});

// 🔹 Deletar produto
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM produtos WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Produto removido");
  });
});

module.exports = router;