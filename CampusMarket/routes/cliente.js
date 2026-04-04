const express = require("express");
const router = express.Router();
const db = require("../database/database");

// Middleware de autenticação
function authCliente(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.redirect("/login");
  }
  next();
}

// PÁGINA PRINCIPAL DO CLIENTE
router.get("/", authCliente, (req, res) => {

  const sqlProdutos = `
    SELECT 
      p.id,
      p.nome,
      p.descricao,
      p.preco,
      p.estoque,
      p.vendedor_id,
      v.nome AS vendedor_nome,
      IFNULL(AVG(a.nota), 0) AS media_avaliacao
    FROM produtos p
    JOIN vendedor v ON p.vendedor_id = v.id
    LEFT JOIN avaliacoes a ON a.vendedor_id = v.id
    WHERE p.status = 'ATIVO'
    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  db.query(sqlProdutos, (err, produtos) => {
    if (err) return res.send(err);

    // LISTA DE VENDEDORES (para filtro)
    db.query("SELECT id, nome FROM vendedor", (err2, vendedores) => {
      if (err2) return res.send(err2);

      res.render("cliente", {
        user: req.session.user,
        produtos: produtos || [],
        vendedores: vendedores || []
      });
    });
  });
});

// VER PRODUTOS DE UM VENDEDOR ESPECÍFICO (opcional)
router.get("/vendedor/:id", authCliente, (req, res) => {

  const vendedorId = req.params.id;

  const sql = `
    SELECT 
      p.*,
      v.nome AS vendedor_nome
    FROM produtos p
    JOIN vendedor v ON p.vendedor_id = v.id
    WHERE v.id = ?
  `;

  db.query(sql, [vendedorId], (err, produtos) => {
    if (err) return res.send(err);

    res.render("cliente", {
      produtos,
      vendedores: [],
      user: req.session.user
    });
  });
});

module.exports = router;