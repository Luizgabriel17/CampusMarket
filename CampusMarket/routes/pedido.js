const express = require("express");
const router = express.Router();
const db = require("../database/database");

// FINALIZAR PEDIDO
router.post("/finalizar", (req, res) => {

  const carrinho = req.session.carrinho;
  const cliente_id = req.session.user.id;

  if (!carrinho || carrinho.length === 0) {
    return res.send("Carrinho vazio");
  }

  let total = 0;
  let vendedor_id = carrinho[0].vendedor_id;

  carrinho.forEach(item => {
    total += item.preco;
  });

  const sqlPedido = `
    INSERT INTO pedidos (cliente_id, vendedor_id, valor_total, status)
    VALUES (?, ?, ?, 'pendente')
  `;

  db.query(sqlPedido, [cliente_id, vendedor_id, total], (err, result) => {

    if (err) return res.send("Erro");

    const pedido_id = result.insertId;

    carrinho.forEach(item => {

      const sqlItem = `
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES (?, ?, 1, ?)
      `;

      db.query(sqlItem, [pedido_id, item.id, item.preco]);

    });

    req.session.carrinho = [];

    res.send("Pedido realizado com sucesso!");
  });

});

module.exports = router;