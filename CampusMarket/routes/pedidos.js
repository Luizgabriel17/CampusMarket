const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 🔹 Criar pedido com itens
router.post("/", (req, res) => {
  const { cliente_id, vendedor_id, itens } = req.body;

  // calcular total
  let total = 0;
  itens.forEach(item => {
    total += item.preco * item.quantidade;
  });

  const sqlPedido = `
    INSERT INTO pedidos (cliente_id, vendedor_id, valor_total)
    VALUES (?, ?, ?)
  `;

  db.query(sqlPedido, [cliente_id, vendedor_id, total], (err, result) => {
    if (err) return res.status(500).send(err);

    const pedidoId = result.insertId;

    // inserir itens
    const sqlItem = `
      INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
      VALUES ?
    `;

    const valores = itens.map(item => [
      pedidoId,
      item.produto_id,
      item.quantidade,
      item.preco
    ]);

    db.query(sqlItem, [valores], (err) => {
      if (err) return res.status(500).send(err);

      res.json({
        message: "Pedido criado com sucesso",
        pedidoId
      });
    });
  });
});

// 🔹 Listar pedidos (com cliente e vendedor)
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, c.nome AS cliente_nome, v.nome AS vendedor_nome
    FROM pedidos p
    JOIN cliente c ON p.cliente_id = c.id
    JOIN vendedor v ON p.vendedor_id = v.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 🔹 Buscar pedido com itens
router.get("/:id", (req, res) => {
  const pedidoId = req.params.id;

  const sqlPedido = `
    SELECT * FROM pedidos WHERE id = ?
  `;

  const sqlItens = `
    SELECT i.*, p.nome
    FROM itens_pedido i
    JOIN produtos p ON i.produto_id = p.id
    WHERE i.pedido_id = ?
  `;

  db.query(sqlPedido, [pedidoId], (err, pedido) => {
    if (err) return res.status(500).send(err);

    db.query(sqlItens, [pedidoId], (err, itens) => {
      if (err) return res.status(500).send(err);

      res.json({
        pedido: pedido[0],
        itens
      });
    });
  });
});

module.exports = router;