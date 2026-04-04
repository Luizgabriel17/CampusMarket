const express = require("express");
const router = express.Router();
const db = require("../database/database");

function authCliente(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// AVALIAR
router.post("/avaliar", authCliente, (req, res) => {

  const { vendedor_id, pedido_id, nota, comentario } = req.body;
  const cliente_id = req.session.user.id;

  // EVITA DUPLICAR AVALIAÇÃO
  db.query(
    "SELECT * FROM avaliacoes WHERE pedido_id = ?",
    [pedido_id],
    (err, result) => {

      if (result.length > 0) {
        return res.send("Pedido já avaliado");
      }

      db.query(
        "INSERT INTO avaliacoes (cliente_id, vendedor_id, pedido_id, nota, comentario) VALUES (?, ?, ?, ?, ?)",
        [cliente_id, vendedor_id, pedido_id, nota, comentario],
        (err2) => {
          if (err2) return res.send(err2);

          res.redirect("/pedidos");
        }
      );

    }
  );

});

module.exports = router;