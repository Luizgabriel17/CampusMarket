# PASSO A PASSO

## 1. PLANEJAMENTO (Base do sistema) - CUMPRIDO TOTALMENTE
- Definir objetivo do sistema (Marketplace de lanches entre alunos) 
- Definir tipos de usuários:
  - Cliente
  - Vendedor
  - Administrador
- Definir funcionalidades principais:
  - Cadastro/Login
  - Cadastro de produtos (lanches)
  - Listagem de produtos
  - Carrinho de compras
  - Pedidos
- Definir tecnologias:
  - Backend: Node.js + Express
  - Banco: MySQL
  - Frontend: HTML, CSS, Bootstrap, JavaScript

---

## 2. MODELAGEM DO BANCO DE DADOS - CUMPRIDO TOTALMENTE
- Criar banco de dados
- Criar tabelas:
  - `usuarios` (id, nome, email, senha, tipo)
  - `produtos` (id, nome, descricao, preco, id_vendedor)
  - `pedidos` (id, id_cliente, data)
  - `itens_pedido` (id, id_pedido, id_produto, quantidade)

- Inserir dados fictícios (seed inicial)
- Criar relacionamentos (FOREIGN KEY)

---

## 3. BACKEND (API + CRUD) - CUMPRIDO PARCIALMENTE

### Autenticação
- Criar rotas:
  - `POST /register` (cadastro)
  - `POST /login` (login)
- Criptografar senha (bcrypt) - (URGENTE)
- Criar sessão (express-session)

### 👤 Usuários
- `GET /usuarios`
- `GET /usuarios/:id`

### 🥪 Produtos
- `POST /produtos` (vendedor cadastra)
- `GET /produtos` (listar todos)
- `GET /produtos/:id`
- `PUT /produtos/:id`
- `DELETE /produtos/:id`

### 🛒 Pedidos
- `POST /pedidos`
- `GET /pedidos`
- `GET /pedidos/:id`

---

## 4. FRONTEND (Interface) - CUMPRIDO TOTALMENTE

### Telas principais:
- Tela de Login
- Tela de Registro
- Tela de Home (lista de produtos)
- Tela de Produto (detalhes)
- Tela do Vendedor (gerenciar produtos)
- Tela de Carrinho
- Tela de Pedidos

### Funcionalidades:
- Consumir API com `fetch`
- Exibir produtos dinamicamente
- Botão "Adicionar ao carrinho"
- Feedback visual (alertas) - (URGENTE)

---

## 5. DIFERENCIAIS (Sistema avançado) - CUMPRIDO PARCIALMENTE
- Filtro de produtos (vendedor)
- Upload de imagem do lanche - (URGENTE)
- Sistema de avaliações ⭐
- Dashboard do vendedor
- Controle de estoque - (URGENTE)
- Notificações (pedido realizado) - (URGENTE)
- Responsividade (mobile) - (PODE ESPERAR)

---

## 6. SEGURANÇA - CUMPRIDO PARCIALMENTE
- Hash de senha (bcrypt) - (URGENTE)
- Proteção de rotas (middleware)
- Validação de dados (backend)
- Prevenção contra SQL Injection

---

## 7. TESTES - NÃO CUMPRIDO
- Testar todas as rotas no Postman
- Testar fluxo completo:
  - Cadastro → Login → Compra
- Corrigir bugs
- Testes com usuários reais

---

## 8. DEPLOY (Modo Beta) - NÃO CUMPRIDO
- Backend: Render / Railway
- Banco: Railway / PlanetScale
- Frontend: Vercel / Netlify
- Testar sistema online

---

## 9. FINALIZAÇÃO - NÃO CUMPRIDO
- Ajustar layout
- Melhorar UX
- Documentar projeto:
  - Tecnologias usadas
  - Estrutura do sistema
  - Prints das telas
- Preparar apresentação

---

## FLUXO FINAL DO SISTEMA
1. Usuário se cadastra - OK!
2. Faz login - OK!
3. Navega pelos lanches - OK! 
4. Adiciona ao carrinho - OK!
5. Finaliza pedido - OK!
6. Vendedor recebe pedido - OK!
7. Vendedor registra pedido entregue - OK!
8. Venda é registrada no sistema - OK!
9. Avaliação é habilitada - OK!
10. Cliente avalia - OK!