const express = require("express");
const router = express.Router();
const db = require("../database/database");

function authCliente(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// ⭐ AVALIAR
router.post("/avaliar", authCliente, (req, res) => {

  const { vendedor_id, pedido_id, nota, comentario } = req.body;
  const cliente_id = req.session.user.id;

  // 🔒 VALIDAÇÃO BÁSICA
  if (!pedido_id || !vendedor_id || !nota) {
    return res.redirect("/pedidos?erro=Dados inválidos");
  }

  if (nota < 1 || nota > 5) {
    return res.redirect("/pedidos?erro=Nota inválida");
  }

  // 🔍 VERIFICA SE O PEDIDO É DO CLIENTE
  db.query(
    "SELECT * FROM pedidos WHERE id = ? AND cliente_id = ?",
    [pedido_id, cliente_id],
    (err, pedidoResult) => {

      if (err) {
        console.error(err);
        return res.redirect("/pedidos?erro=Erro no servidor");
      }

      if (pedidoResult.length === 0) {
        return res.redirect("/pedidos?erro=Pedido não encontrado");
      }

      // 🔒 VERIFICA SE JÁ FOI AVALIADO
      db.query(
        "SELECT id FROM avaliacoes WHERE pedido_id = ? LIMIT 1",
        [pedido_id],
        (err2, avaliacaoResult) => {

          if (err2) {
            console.error(err2);
            return res.redirect("/pedidos?erro=Erro ao verificar avaliação");
          }

          if (avaliacaoResult.length > 0) {
            return res.redirect("/pedidos?erro=Pedido já avaliado");
          }

          // 💾 INSERE AVALIAÇÃO
          db.query(
            `INSERT INTO avaliacoes 
            (cliente_id, vendedor_id, pedido_id, nota, comentario) 
            VALUES (?, ?, ?, ?, ?)`,
            [cliente_id, vendedor_id, pedido_id, nota, comentario || null],
            (err3) => {

              if (err3) {
                console.error(err3);
                return res.redirect("/pedidos?erro=Erro ao salvar avaliação");
              }

              // ✅ OPCIONAL: MARCAR PEDIDO COMO AVALIADO
              db.query(
                "UPDATE pedidos SET avaliado = 1 WHERE id = ?",
                [pedido_id],
                () => {
                  return res.redirect("/pedidos?sucesso=Avaliação enviada");
                }
              );

            }
          );

        }
      );

    }
  );

});

module.exports = router;