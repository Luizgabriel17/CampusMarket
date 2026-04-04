const express = require("express");
const router = express.Router();

// Middleware
function authCliente(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.redirect("/login");
  }
  next();
}

// VER CARRINHO
router.get("/", authCliente, (req, res) => {
  res.render("carrinho", {
    carrinho: req.session.carrinho || []
  });
});

// ADICIONAR
router.post("/add", authCliente, (req, res) => {
  const { id, nome, preco, vendedor_id } = req.body;

  if (!req.session.carrinho) req.session.carrinho = [];

  const item = req.session.carrinho.find(p => p.id == id);

  if (item) {
    item.quantidade++;
  } else {
    req.session.carrinho.push({
      id,
      nome,
      preco: parseFloat(preco),
      vendedor_id,
      quantidade: 1
    });
  }

  res.redirect("/cliente");
});

// ALTERAR QUANTIDADE
router.post("/update", authCliente, (req, res) => {
  const { id, acao } = req.body;

  const carrinho = req.session.carrinho;

  const item = carrinho.find(p => p.id == id);

  if (!item) return res.redirect("/cliente");

  if (acao === "mais") item.quantidade++;
  if (acao === "menos") item.quantidade--;

  if (item.quantidade <= 0) {
    req.session.carrinho = carrinho.filter(p => p.id != id);
  }

  res.redirect("/cliente");
});

// REMOVER
router.post("/remove", authCliente, (req, res) => {
  const { id } = req.body;

  req.session.carrinho = req.session.carrinho.filter(p => p.id != id);

  res.redirect("/cliente");
});

module.exports = router;