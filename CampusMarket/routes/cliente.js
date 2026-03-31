const express = require("express");
const router = express.Router();
const db = require("../database/database");

// Middleware correto
function verificarLogin(req, res, next) {
  console.log("SESSION NA ROTA CLIENTE:", req.session.user);

  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.redirect("/login");
  }

  next();
}

// Rota principal
router.get("/", verificarLogin, async (req, res) => {
  try {
    const cliente = req.session.user;

    // Buscar vendedores
    db.query("SELECT id, nome FROM vendedor", (err, vendedores) => {
      if (err) {
        console.error(err);
        return res.send("Erro ao buscar vendedores");
      }

      res.render("cliente", {
        cliente,
        vendedores
      });
    });

  } catch (error) {
    console.error(error);
    res.send("Erro no servidor");
  }
});

module.exports = router;