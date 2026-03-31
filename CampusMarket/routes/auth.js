const express = require("express");
const router = express.Router();
const db = require("../database/database");

// =========================
// 🔐 TELA DE LOGIN
// =========================
router.get("/login", (req, res) => {
  res.render("login");
});

// =========================
// 🔐 PROCESSO DE LOGIN
// =========================
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.send("Preencha todos os campos");
  }

  const sqlCliente = "SELECT * FROM cliente WHERE email = ? AND senha = ?";
  const sqlVendedor = "SELECT * FROM vendedor WHERE email = ? AND senha = ?";

  // 🔹 Verifica CLIENTE
  db.query(sqlCliente, [email, senha], (err, resultCliente) => {
    if (err) {
      console.error("Erro ao buscar cliente:", err);
      return res.status(500).send("Erro no servidor");
    }

    if (resultCliente.length > 0) {
      const cliente = resultCliente[0];

      req.session.user = {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        tipo: "cliente"
      };
      console.log("LOGIN - sessão criada:", req.session.user);
      return res.redirect("/cliente");
    }

    // 🔹 Se não for cliente, verifica VENDEDOR
    db.query(sqlVendedor, [email, senha], (err, resultVendedor) => {
      if (err) {
        console.error("Erro ao buscar vendedor:", err);
        return res.status(500).send("Erro no servidor");
      }

      if (resultVendedor.length > 0) {
        const vendedor = resultVendedor[0];

        req.session.user = {
          id: vendedor.id,
          nome: vendedor.nome,
          email: vendedor.email,
          tipo: "vendedor"
        };

        return res.redirect("/dashboard");
      }

      // ❌ Nenhum encontrado
      return res.send("Email ou senha inválidos");
    });
  });
});

// =========================
// 🔓 LOGOUT
// =========================
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao destruir sessão:", err);
      return res.redirect("/cliente");
    }

    res.redirect("/login");
  });
});

module.exports = router;