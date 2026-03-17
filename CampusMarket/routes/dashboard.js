const express = require("express");
const router = express.Router();
const db = require("../database/database");

// 🔐 Middleware simples (depois você pode trocar por sessão real)
function getVendedorId(req) {
  return req.session.user?.id;
}
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.tipo !== "vendedor") {
    return res.redirect("/login");
  }
  next();
});

// =============================
// 📊 DASHBOARD (LISTAR PRODUTOS)
// =============================
router.get("/", (req, res) => {
  const vendedorId = getVendedorId(req);

  const sql = "SELECT * FROM produtos WHERE vendedor_id = ?";

  db.query(sql, [vendedorId], (err, resultados) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao carregar dashboard");
    }

    res.render("dashboard", {
      produtos: resultados
    });
  });
});


// =============================
// ➕ FORMULÁRIO NOVO PRODUTO
// =============================
router.get("/novo", (req, res) => {
  res.render("novo-produto");
});


// =============================
// ➕ CADASTRAR PRODUTO
// =============================
router.post("/novo", (req, res) => {
  const vendedorId = getVendedorId(req);

  const { nome, preco, descricao, imagem_url } = req.body;

  const sql = `
    INSERT INTO produtos (nome, preco, descricao, imagem_url, vendedor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, preco, descricao, imagem_url, vendedorId], (err) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao cadastrar produto");
    }

    res.redirect("/dashboard");
  });
});


// =============================
// ✏️ FORMULÁRIO EDITAR PRODUTO
// =============================
router.get("/editar/:id", (req, res) => {
  const vendedorId = getVendedorId(req);
  const id = req.params.id;

  const sql = "SELECT * FROM produtos WHERE id = ? AND vendedor_id = ?";

  db.query(sql, [id, vendedorId], (err, resultados) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao carregar produto");
    }

    if (resultados.length === 0) {
      return res.send("Produto não encontrado ou sem permissão");
    }

    res.render("editar-produto", {
      produto: resultados[0]
    });
  });
});


// =============================
// ✏️ ATUALIZAR PRODUTO
// =============================
router.post("/editar/:id", (req, res) => {
  const vendedorId = getVendedorId(req);
  const id = req.params.id;

  const { nome, preco, descricao, imagem_url } = req.body;

  const sql = `
    UPDATE produtos 
    SET nome = ?, preco = ?, descricao = ?, imagem_url = ?
    WHERE id = ? AND vendedor_id = ?
  `;

  db.query(sql, [nome, preco, descricao, imagem_url, id, vendedorId], (err) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao atualizar produto");
    }

    res.redirect("/dashboard");
  });
});


// =============================
// ❌ EXCLUIR PRODUTO
// =============================
router.post("/deletar/:id", (req, res) => {
  const vendedorId = getVendedorId(req);
  const id = req.params.id;

  const sql = "DELETE FROM produtos WHERE id = ? AND vendedor_id = ?";

  db.query(sql, [id, vendedorId], (err) => {
    if (err) {
      console.log(err);
      return res.send("Erro ao deletar produto");
    }

    res.redirect("/dashboard");
  });
});


// =============================
// 📊 MÉTRICAS DO DASHBOARD (EXTRA)
// =============================
router.get("/stats", (req, res) => {
  const vendedorId = getVendedorId(req);

  const sqlProdutos = "SELECT COUNT(*) AS total FROM produtos WHERE vendedor_id = ?";
  const sqlPedidos = "SELECT COUNT(*) AS total FROM pedidos WHERE vendedor_id = ?";
  const sqlFaturamento = "SELECT SUM(valor_total) AS total FROM pedidos WHERE vendedor_id = ?";

  db.query(sqlProdutos, [vendedorId], (err, produtos) => {
    if (err) return res.send("Erro");

    db.query(sqlPedidos, [vendedorId], (err, pedidos) => {
      if (err) return res.send("Erro");

      db.query(sqlFaturamento, [vendedorId], (err, faturamento) => {
        if (err) return res.send("Erro");

        res.json({
          total_produtos: produtos[0].total,
          total_pedidos: pedidos[0].total,
          faturamento: faturamento[0].total || 0
        });
      });
    });
  });
});


// =============================
module.exports = router;