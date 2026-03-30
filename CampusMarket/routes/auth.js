const express = require("express");
const router = express.Router();
const db = require("../database/database");

// TELA
router.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const sqlCliente = "SELECT * FROM cliente WHERE email = ? AND senha = ?";
  const sqlVendedor = "SELECT * FROM vendedor WHERE email = ? AND senha = ?";

  db.query(sqlCliente, [email, senha], (err, resultCliente) => {
    if (resultCliente.length > 0) {
      req.session.user = { tipo: "cliente", ...resultCliente[0] };
      return res.redirect("/cliente");
    }

    db.query(sqlVendedor, [email, senha], (err, resultVendedor) => {
      if (resultVendedor.length > 0) {
        req.session.user = { tipo: "vendedor", ...resultVendedor[0] };
        return res.redirect("/dashboard");
      }

      res.send("Usuário não encontrado");
    });
  });
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;