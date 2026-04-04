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

/* =========================
   DASHBOARD PRINCIPAL
========================= */
router.get("/", authVendedor, (req, res) => {
  const vendedorId = req.session.user.id;

  // PRODUTOS
  db.query(
    "SELECT * FROM produtos WHERE vendedor_id = ?",
    [vendedorId],
    (err, produtos) => {
      if (err) return res.send(err);

      // PEDIDOS
      db.query(
        `
        SELECT 
          p.id,
          p.valor_total,
          p.status,
          p.data_pedido,
          GROUP_CONCAT(pr.nome SEPARATOR ', ') AS itens
        FROM pedidos p
        JOIN itens_pedido i ON i.pedido_id = p.id
        JOIN produtos pr ON pr.id = i.produto_id
        WHERE pr.vendedor_id = ?
        GROUP BY p.id
        ORDER BY p.id DESC
        `,
        [vendedorId],
        (err2, pedidos) => {
          if (err2) return res.send(err2);

          // MÉTRICAS
          const totalPedidos = pedidos.length;

          const faturamento = pedidos.reduce(
            (soma, p) => soma + parseFloat(p.valor_total),
            0
          );

          res.render("dashboard", {
            user: req.session.user,
            produtos: produtos || [],
            pedidos: pedidos || [],
            totalPedidos,
            totalVendas: faturamento,
            faturamento
          });
        }
      );
    }
  );
});

/* =========================
   NOVO PRODUTO (FORM)
========================= */
router.get("/produtos/novo", authVendedor, (req, res) => {
  res.render("novo-produto");
});

/* =========================
   CRIAR PRODUTO
========================= */
router.post("/produtos", authVendedor, (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  const vendedorId = req.session.user.id;

  const sql = `
    INSERT INTO produtos (nome, descricao, preco, estoque, vendedor_id, status)
    VALUES (?, ?, ?, ?, ?, 'ATIVO')
  `;

  db.query(sql, [nome, descricao, preco, estoque, vendedorId], (err) => {
    if (err) return res.send(err);
    res.redirect("/dashboard");
  });
});

/* =========================
   EDITAR PRODUTO (FORM)
========================= */
router.get("/produtos/editar/:id", authVendedor, (req, res) => {
  db.query(
    "SELECT * FROM produtos WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.send(err);
      res.render("editar-produto", { produto: result[0] });
    }
  );
});

/* =========================
   SALVAR EDIÇÃO
========================= */
router.post("/produtos/editar/:id", authVendedor, (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;

  const sql = `
    UPDATE produtos 
    SET nome=?, descricao=?, preco=?, estoque=? 
    WHERE id=?
  `;

  db.query(sql, [nome, descricao, preco, estoque, req.params.id], (err) => {
    if (err) return res.send(err);
    res.redirect("/dashboard");
  });
});

/* =========================
   DELETAR PRODUTO
========================= */
router.post("/produtos/deletar/:id", authVendedor, (req, res) => {
  db.query(
    "DELETE FROM produtos WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.redirect("/dashboard");
    }
  );
});

/* =========================
   ATUALIZAR STATUS PEDIDO RECEBIDO
========================= */
router.post("/pedidos/status/:id", authVendedor, (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE pedidos SET status = ? WHERE id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.redirect("/dashboard");
    }
  );
});

module.exports = router;