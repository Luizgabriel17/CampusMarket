const express = require("express");
const router = express.Router();
const db = require("../database/database.js");
const bcrypt = require("bcrypt");


// ======================
// 🔓 LOGIN PAGE
// ======================
router.get("/login", (req, res) => {
  res.render("login");
});


// ======================
// 📝 REGISTER PAGE
// ======================
router.get("/register", (req, res) => {
  res.render("register");
});


// ======================
// 🔐 LOGIN
// ======================
router.post("/login", (req, res) => {

  const { email, senha, tipo } = req.body;

  const tabela = tipo === "vendedor" ? "vendedor" : "cliente";

  db.query(`SELECT * FROM ${tabela} WHERE email = ?`, [email], async (err, results) => {

    if (err) return res.send("Erro no servidor");

    if (results.length === 0) {
      return res.send("Usuário não encontrado");
    }

    const user = results[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.send("Senha incorreta");
    }

    // salvar sessão
    req.session.user = {
      id: user.id,
      tipo: tipo
    };

    // redirecionar
    if (tipo === "vendedor") {
      return res.redirect("/dashboard");
    } else {
      return res.redirect("/");
    }

  });

});


// ======================
// 📝 REGISTRAR
// ======================
router.post("/register", async (req, res) => {

  const { nome, email, senha, tipo } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  const tabela = tipo === "vendedor" ? "vendedor" : "cliente";

  const sql = `
    INSERT INTO ${tabela} (nome, email, senha)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nome, email, hash], (err) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao cadastrar");
    }

    res.redirect("/login");
  });

});


// ======================
// 🚪 LOGOUT
// ======================
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;