const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.send("Preencha todos os campos");
  }

  const sqlCliente = "SELECT * FROM cliente WHERE email = ? AND senha = ?";
  const sqlVendedor = "SELECT * FROM vendedor WHERE email = ? AND senha = ?";

  db.query(sqlCliente, [email, senha], (err, resultCliente) => {
    if (err) return res.status(500).send("Erro no servidor");

    if (resultCliente.length > 0) {
      const cliente = resultCliente[0];

      req.session.user = {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        tipo: "cliente"
      };

      return req.session.save(() => {
        res.redirect("/cliente");
      });
    }

    db.query(sqlVendedor, [email, senha], (err, resultVendedor) => {
      if (err) return res.status(500).send("Erro no servidor");

      if (resultVendedor.length > 0) {
        const vendedor = resultVendedor[0];

        req.session.user = {
          id: vendedor.id,
          nome: vendedor.nome,
          email: vendedor.email,
          tipo: "vendedor"
        };

        return req.session.save(() => {
          res.redirect("/dashboard");
        });
      }

      res.send("Email ou senha inválidos");
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