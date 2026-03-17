const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 🔐 PROTEÇÃO
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.redirect("/login");
  }
  next();
});

// 🏠 DASHBOARD DO CLIENTE
router.get("/", (req, res) => {

  const sql = `
    SELECT p.*, v.nome AS vendedor_nome
    FROM produtos p
    JOIN vendedor v ON p.vendedor_id = v.id
  `;

  db.query(sql, (err, produtos) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao carregar produtos");
    }

    res.render("cliente-dashboard", {
      produtos,
      user: req.session.user
    });
  });

});

module.exports = router;