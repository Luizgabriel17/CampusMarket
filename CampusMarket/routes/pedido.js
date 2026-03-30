const express = require("express");
const router = express.Router();
const db = require("../database/database");

// FINALIZAR PEDIDO
router.post("/finalizar", (req, res) => {
  if (!req.session.user || req.session.user.tipo !== "cliente") {
    return res.status(401).send("Faça login como cliente para finalizar o pedido");
  }

  const carrinho = req.session.carrinho;
  const clienteId = req.session.user.id;

  if (!carrinho || carrinho.length === 0) {
    return res.status(400).send("Carrinho vazio");
  }

  let total = 0;
  const vendedorId = carrinho[0].vendedor_id;

  for (const item of carrinho) {
    total += Number(item.preco);
  }

  const sqlPedido = `
    INSERT INTO pedidos (cliente_id, vendedor_id, valor_total, status)
    VALUES (?, ?, ?, 'PENDENTE')
  `;

  db.query(sqlPedido, [clienteId, vendedorId, total], (pedidoErr, result) => {
    if (pedidoErr) {
      console.log(pedidoErr);
      return res.status(500).send("Erro ao criar pedido");
    }

    const pedidoId = result.insertId;
    const itens = carrinho.map((item) => [pedidoId, item.id, 1, item.preco]);

    const sqlItens = `
      INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
      VALUES ?
    `;

    db.query(sqlItens, [itens], (itensErr) => {
      if (itensErr) {
        console.log(itensErr);
        return res.status(500).send("Erro ao salvar itens do pedido");
      }

      req.session.carrinho = [];
      return res.redirect("/cliente");
    });
  });
});

module.exports = router;
