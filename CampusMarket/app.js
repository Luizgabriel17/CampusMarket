const express = require("express");
const app = express();

const path = require("path");
const session = require("express-session");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

// ROTAS
const authRoutes = require("./routes/auth");
const registerRoutes = require("./routes/register");
const clienteRoutes = require("./routes/cliente");
const dashboardRoutes = require("./routes/dashboard");
const pedidosRoutes = require("./routes/pedidos");
const produtosRoutes = require("./routes/produtos");
const avaliacoesRoutes = require("./routes/avaliacoes");

// CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARES
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// SESSÃO
app.use(session({
  secret: "tcc_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

// DISPONIBILIZA USER GLOBALMENTE NAS VIEWS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ROTAS
app.use("/", authRoutes);
app.use("/register", registerRoutes);
app.use("/cliente", clienteRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/produtos", produtosRoutes);
app.use("/avaliacoes", avaliacoesRoutes);

// START
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});