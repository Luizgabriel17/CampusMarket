const express = require("express");
const router = express.Router();
const db = require("../database/database");

// Middleware cliente
function authCliente(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.redirect("/login");
  }
  next();
}

// LISTAR PEDIDOS DO CLIENTE
router.get("/", authCliente, (req, res) => {
  const clienteId = req.session.user.id;

  const sql = `
    SELECT 
      p.id,
      p.valor_total,
      p.status,
      p.data_pedido,
      MIN(pr.vendedor_id) AS vendedor_id,
      GROUP_CONCAT(pr.nome SEPARATOR ', ') AS itens
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    JOIN produtos pr ON pr.id = i.produto_id
    WHERE p.cliente_id = ?
    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  db.query(sql, [clienteId], (err, pedidos) => {
    if (err) return res.send(err);

    res.render("pedidos", {
      pedidos: pedidos || [],
      user: req.session.user
    });
  });
});

// FINALIZAR PEDIDO (SEPARADO POR VENDEDOR)
router.post("/finalizar", authCliente, (req, res) => {
  const clienteId = req.session.user.id;
  const carrinho = req.session.carrinho || [];

  if (carrinho.length === 0) {
    return res.redirect("/cliente");
  }

  // AGRUPAR POR VENDEDOR
  const pedidosPorVendedor = {};

  carrinho.forEach(item => {
    if (!pedidosPorVendedor[item.vendedor_id]) {
      pedidosPorVendedor[item.vendedor_id] = [];
    }
    pedidosPorVendedor[item.vendedor_id].push(item);
  });

  const vendedores = Object.keys(pedidosPorVendedor);

  vendedores.forEach(vendedorId => {
    const itens = pedidosPorVendedor[vendedorId];

    const total = itens.reduce((soma, item) => {
      return soma + item.preco * item.quantidade;
    }, 0);

    db.query(
      "INSERT INTO pedidos (cliente_id, valor_total, status) VALUES (?, ?, 'PENDENTE')",
      [clienteId, total],
      (err, result) => {
        if (err) return res.send(err);

        const pedidoId = result.insertId;

        itens.forEach(item => {
          db.query(
            "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
            [pedidoId, item.id, item.quantidade, item.preco]
          );
        });
      }
    );
  });

  // LIMPA CARRINHO
  req.session.carrinho = [];

  res.redirect("/pedidos");
});

module.exports = router;