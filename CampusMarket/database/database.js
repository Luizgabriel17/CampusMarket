const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_market"
});

connection.connect((err) => {
  if (err) {
    console.log("Erro ao conectar ao banco");
  } else {
    console.log("Banco conectado");
  }
});

module.exports = connection;