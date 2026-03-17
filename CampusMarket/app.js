var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session"); // ✅ IMPORTAR UMA VEZ SÓ

// ROTAS
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dashboardRouter = require("./routes/dashboard");
const authRoutes = require("./routes/auth");

var app = express();

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 SESSÃO (ANTES DAS ROTAS)
app.use(session({
  secret: "segredo_tcc",
  resave: false,
  saveUninitialized: false
}));

// ROTAS
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/", authRoutes);
app.use("/dashboard", dashboardRouter);

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