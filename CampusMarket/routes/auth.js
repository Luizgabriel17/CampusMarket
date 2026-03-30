const express = require("express");
const router = express.Router();
const db = require("../database/database");

function getHomeByTipo(tipo) {
  return tipo === "cliente" ? "/cliente" : "/dashboard";
}

// Página inicial: direciona para login ou dashboard correto
router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  return res.redirect(getHomeByTipo(req.session.user.tipo));
});

// 📄 TELA DE LOGIN
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect(getHomeByTipo(req.session.user.tipo));
  }

  res.render("login");
});

// 🔐 PROCESSA LOGIN
router.post("/login", (req, res) => {
  const { email, senha, tipo } = req.body;

  if (!email || !senha || !tipo) {
    return res.status(400).send("Preencha email, senha e tipo de usuário.");
  }

  const tabela = tipo === "cliente" ? "cliente" : "vendedor";
  const sql = `SELECT id, nome, email FROM ${tabela} WHERE email = ? AND senha = ?`;

  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Erro no login");
    }

    if (results.length === 0) {
      return res.status(401).send("Usuário não encontrado");
    }

    const user = results[0];

    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo
    };

    req.session.save(() => {
      res.redirect(getHomeByTipo(tipo));
    });
  });
});

// 📄 TELA DE CADASTRO
router.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect(getHomeByTipo(req.session.user.tipo));
  }

  res.render("register");
});

// ➕ PROCESSA CADASTRO DE CLIENTE E VENDEDOR
router.post("/register", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).send("Preencha todos os campos de cadastro.");
  }

  const tabela = tipo === "cliente" ? "cliente" : "vendedor";

  const sqlVerifica = `SELECT id FROM ${tabela} WHERE email = ? LIMIT 1`;
  db.query(sqlVerifica, [email], (erroVerifica, rows) => {
    if (erroVerifica) {
      console.log(erroVerifica);
      return res.status(500).send("Erro ao validar cadastro");
    }

    if (rows.length > 0) {
      return res.status(409).send("Já existe uma conta com esse email");
    }

    const sqlCadastro = `INSERT INTO ${tabela} (nome, email, senha) VALUES (?, ?, ?)`;

    db.query(sqlCadastro, [nome, email, senha], (erroCadastro, result) => {
      if (erroCadastro) {
        console.log(erroCadastro);
        return res.status(500).send("Erro ao cadastrar usuário");
      }

      req.session.user = {
        id: result.insertId,
        nome,
        email,
        tipo
      };

      req.session.save(() => {
        res.redirect(getHomeByTipo(tipo));
      });
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
