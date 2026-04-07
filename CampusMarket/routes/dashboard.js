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
  const hoje = new Date().toISOString().slice(0, 10);

  // PRODUTOS
  db.query(
    "SELECT * FROM produtos WHERE vendedor_id = ?",
    [vendedorId],
    (err, produtos) => {
      if (err) return res.send(err);

      // PEDIDOS (AGORA COM CLIENTE CORRETO)
      db.query(
        `
        SELECT 
          p.id,
          p.valor_total,
          p.status,
          p.data_pedido,
          c.nome AS cliente_nome,
          COUNT(i.id) as quantidade,
          GROUP_CONCAT(pr.nome SEPARATOR ', ') AS itens
        FROM pedidos p
        JOIN itens_pedido i ON i.pedido_id = p.id
        JOIN produtos pr ON pr.id = i.produto_id
        JOIN cliente c ON c.id = p.cliente_id
        WHERE pr.vendedor_id = ?
        GROUP BY p.id
        ORDER BY p.id DESC
        `,
        [vendedorId],
        (err2, pedidos) => {
          if (err2) return res.send(err2);

          // MÉTRICAS DO DIA
          db.query(
            `
            SELECT 
              COUNT(*) as pedidosHoje,
              SUM(valor_total) as faturamentoHoje
            FROM pedidos
            WHERE DATE(data_pedido) = ?
            `,
            [hoje],
            (err3, hojeData) => {
              if (err3) return res.send(err3);

              const pedidosHoje = hojeData[0].pedidosHoje || 0;
              const faturamentoHoje = hojeData[0].faturamentoHoje || 0;

              // FATURAMENTO DA SEMANA
              db.query(
                `
                SELECT 
                  DATE(data_pedido) as dia,
                  SUM(valor_total) as total
                FROM pedidos
                GROUP BY DATE(data_pedido)
                ORDER BY dia DESC
                LIMIT 7
                `,
                (err4, faturamentoSemana) => {
                  if (err4) return res.send(err4);

                  // PRODUTOS MAIS VENDIDOS
                  db.query(
                    `
                    SELECT pr.nome, COUNT(i.produto_id) as total
                    FROM itens_pedido i
                    JOIN produtos pr ON pr.id = i.produto_id
                    WHERE pr.vendedor_id = ?
                    GROUP BY pr.id
                    ORDER BY total DESC
                    LIMIT 5
                    `,
                    [vendedorId],
                    (err5, maisVendidos) => {
                      if (err5) return res.send(err5);

                      // RENDER FINAL
                      res.render("dashboard", {
                        user: req.session.user,
                        produtos: produtos || [],
                        pedidos: pedidos || [],
                        pedidosHoje,
                        faturamentoHoje,
                        vendasHoje: faturamentoHoje,
                        faturamentoSemana: faturamentoSemana || [],
                        maisVendidos: maisVendidos || []
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

/* =========================
   NOVO PRODUTO
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
   EDITAR PRODUTO
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
   ATUALIZAR STATUS PEDIDO
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

/* =========================
   LISTAR PRODUTOS
========================= */
router.get("/produtos", authVendedor, (req, res) => {
  const vendedorId = req.session.user.id;

  db.query(
    "SELECT * FROM produtos WHERE vendedor_id = ?",
    [vendedorId],
    (err, produtos) => {
      if (err) return res.send(err);

      res.render("dashboard-produtos", {
        produtos: produtos || [],
        user: req.session.user
      });
    }
  );
});

/* =========================
   LISTAR PEDIDOS
========================= */
router.get("/pedidos", authVendedor, (req, res) => {
  const vendedorId = req.session.user.id;

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
    (err, pedidos) => {
      if (err) return res.send(err);

      res.render("dashboard-pedidos", {
        pedidos: pedidos || [],
        user: req.session.user
      });
    }
  );
});

module.exports = router;