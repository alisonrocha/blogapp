// Carregadno Módulos
const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
require('./config/auth')(passport)

const app = express()

//CONFIGURAÇÕES

//Sessão
app.use(
  session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true
  })
)

//Passport
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Middlewares
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

//Mongoose
mongoose.Promise = global.Promise
mongoose
  .connect('mongodb://localhost/blogapp')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.log('Error ao conectar: ' + err))

//PUBLIC
app.use(express.static(path.join(__dirname, 'public')))

//ROTAS
app.get('/', (req, res) => {
  Postagem.find()
    .populate('categoria')
    .sort({ data: 'desc' })
    .lean()
    .then(postagens => {
      res.render('index', { postagens: postagens })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then(postagem => {
      if (postagem) {
        res.render('postagem/index', { postagem: postagem })
      } else {
        req.flash('error_msg', 'Esta postagem não existe')
        res.redirect('/')
      }
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
  Categoria.find()
    .lean()
    .then(categorias => {
      res.render('categorias/index', { categorias: categorias })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias!')
      res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then(categoria => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then(postagens => {
            res.render('categorias/postagens', {
              postagens: postagens,
              categoria: categoria
            })
          })
          .catch(err => {
            req.flash('error_msg', 'Houve um erro ao listar os posts!')
            res.redirect('/')
          })
      } else {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/')
      }
    })
    .catch(err => {
      req.flash(
        'error_msg',
        'Houve um erro interno ao carregar a página desta categoria'
      )
      res.redirect('/')
    })
})

app.get('/404', (req, res) => {
  res.send('Erro 404')
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)

//OUTROS
const PORT = process.env.PORT || 8081
app.listen(PORT, () => console.log('Server Run!'))
