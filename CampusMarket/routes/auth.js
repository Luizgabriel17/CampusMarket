const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 📄 TELA DE LOGIN
router.get("/login", (req, res) => {
  res.render("login");
});

// 🔐 PROCESSA LOGIN
router.post("/login", (req, res) => {
  const { email, senha, tipo } = req.body;

  let tabela = tipo === "cliente" ? "cliente" : "vendedor";

  const sql = `SELECT * FROM ${tabela} WHERE email = ? AND senha = ?`;

  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.log(err);
      return res.send("Erro no login");
    }

    if (results.length === 0) {
      return res.send("Usuário não encontrado");
    }

    const user = results[0];

    // ✅ SALVA NA SESSÃO
    req.session.user = {
      id: user.id,
      nome: user.nome,
      tipo: tipo
    };

    // ✅ GARANTE QUE SALVOU ANTES DE REDIRECIONAR
    req.session.save(() => {
      if (tipo === "cliente") {
        return res.redirect("/cliente");
      } else {
        return res.redirect("/dashboard");
      }
    });
  });
});

// 🚪 LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;