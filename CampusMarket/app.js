var createError = require('http-errors');
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");

// ROTAS
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dashboardRouter = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const carrinhoRouter = require("./routes/carrinho");
const clienteRouter = require("./routes/cliente");
const pedidoRouter = require("./routes/pedido");

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 SESSÃO
app.use(session({
  secret: "segredo_tcc",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // importante para localhost
}));

// 🔑 ROTAS PRINCIPAIS
app.use("/", authRoutes);          // login primeiro
app.use("/cliente", clienteRouter);
app.use("/dashboard", dashboardRouter);
app.use("/carrinho", carrinhoRouter);
app.use("/pedido", pedidoRouter);
app.use("/users", usersRouter);
app.use("/", indexRouter);         // sempre por último

// 404
app.use(function(req, res, next) {
  next(createError(404));
});

// ERRO
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;