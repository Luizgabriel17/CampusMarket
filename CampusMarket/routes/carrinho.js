const express = require("express");
const router = express.Router();
const db = require("../database/database");

// ============================
// 🛒 VER CARRINHO
// ============================
router.get("/", (req, res) => {

  if (!req.session.carrinho) {
    req.session.carrinho = [];
  }

  res.render("carrinho", {
    carrinho: req.session.carrinho
  });

});

// ============================
// ➕ ADICIONAR PRODUTO
// ============================
router.post("/add/:id", (req, res) => {

  const id = req.params.id;

  const sql = "SELECT * FROM produtos WHERE id = ?";

  db.query(sql, [id], (err, result) => {

    if (err) return res.send("Erro");

    const produto = result[0];

    if (!req.session.carrinho) {
      req.session.carrinho = [];
    }

    req.session.carrinho.push(produto);

    res.redirect("/carrinho");
  });

});

// ============================
// ❌ REMOVER ITEM
// ============================
router.get("/remove/:index", (req, res) => {

  req.session.carrinho.splice(req.params.index, 1);

  res.redirect("/carrinho");

});

module.exports = router;