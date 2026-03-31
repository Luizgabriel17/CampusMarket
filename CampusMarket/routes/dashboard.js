const express = require("express");
const router = express.Router();
const db = require("../database/database");

// Middleware vendedor
function authVendedor(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== "vendedor") {
    return res.redirect("/login");
  }
  next();
}

// DASHBOARD
router.get("/", authVendedor, (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  res.render("dashboard", { user });
});

// LISTAR PRODUTOS
router.get("/", authVendedor, (req, res) => {
  const vendedorId = req.session.user.id;

  db.query(
    "SELECT * FROM produtos WHERE vendedor_id = ?",
    [vendedorId],
    (err, produtos) => {
      if (err) return res.send(err);

      res.render("dashboard", {
        user: req.session.user,
        produtos: produtos || [] // 🔥 importante
      });
    }
  );
});
// NOVO PRODUTO (FORM)
router.get("/produtos/novo", authVendedor, (req, res) => {
  res.render("novo-produto");
});

// CRIAR PRODUTO
router.post("/produtos", authVendedor, (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  const vendedorId = req.session.user.id;

  const sql = `
    INSERT INTO produtos (nome, descricao, preco, estoque, vendedor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, descricao, preco, estoque, vendedorId], (err) => {
    if (err) return res.send(err);
    res.redirect("/dashboard/produtos");
  });
});

// EDITAR FORM
router.get("/produtos/editar/:id", authVendedor, (req, res) => {
  db.query(
    "SELECT * FROM produtos WHERE id = ?",
    [req.params.id],
    (err, result) => {
      res.render("editar-produto", { produto: result[0] });
    }
  );
});

// SALVAR EDIÇÃO
router.post("/produtos/editar/:id", authVendedor, (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;

  const sql = `
    UPDATE produtos 
    SET nome=?, descricao=?, preco=?, estoque=? 
    WHERE id=?
  `;

  db.query(sql, [nome, descricao, preco, estoque, req.params.id], (err) => {
    if (err) return res.send(err);
    res.redirect("/dashboard/produtos");
  });
});

// DELETAR
router.post("/produtos/deletar/:id", authVendedor, (req, res) => {
  db.query(
    "DELETE FROM produtos WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.redirect("/dashboard/produtos");
    }
  );
});

module.exports = router;