const express = require("express");
const router = express.Router();
const db = require("../database/database");

// TELA
router.get("/", (req, res) => {
  res.render("register");
});

// CADASTRO
router.post("/", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  const tabela = tipo === "cliente" ? "cliente" : "vendedor";

  const sql = `INSERT INTO ${tabela} (nome, email, senha) VALUES (?, ?, ?)`;

  db.query(sql, [nome, email, senha], (err) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao cadastrar");
    }

    res.redirect("/login");
  });
});

module.exports = router;