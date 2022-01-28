const router = require('express').Router()
const mongoose = require('mongoose')

require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
  res.render('admin/index')
})

router.get('/posts', eAdmin, (req, res) => {
  res.send(' Página de posts')
})

router.get('/categorias', eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: 'desc' })
    .then(categorias => {
      res.render('admin/categorias', {
        categorias: categorias.map(categorias => categorias.toJSON())
      })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um error ao listar as categorias ' + err)
      res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  const { nome, slug } = req.body
  var erros = []

  if (!nome || typeof nome == undefined || nome == null)
    erros.push({ texto: 'Nome Inválido' })

  if (!slug || typeof slug == undefined || slug == null)
    erros.push({ texto: 'Slug Inválido' })

  if (nome.length < 2)
    erros.push({ texto: 'Nome da categoria é muito pequeno' })

  if (erros.length > 0) {
    res.render('admin/addcategorias', { erros: erros })
  } else {
    new Categoria({
      nome: nome,
      slug: slug
    })
      .save()
      .then(() => {
        req.flash('success_msg', 'Categoria criada com sucesso!')
        res.redirect('/admin/categorias')
      })
      .catch(err => {
        req.flash(
          'error_msg',
          'Houve um erro ao salvar a categoria, tente novamente!'
        )
        res.redirect('/admin')
      })
  }
})

router.post('/categorias/edit', eAdmin, (req, res) => {
  const { id, nome, slug } = req.body

  Categoria.findOne({ _id: id })
    .then(categoria => {
      categoria.nome = nome
      categoria.slug = slug

      categoria
        .save()
        .then(() => {
          req.flash('success_msg', 'Categoria editada com sucesso!')
          res.redirect('/admin/categorias')
        })
        .catch(err => {
          req.flash(
            'error_msg',
            'Houve um erro interno ao salvar a edição da categoria'
          )
          res.redirect('/admin/categorias')
        })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao editar a categoria')
      res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
  Categoria.remove({ _id: req.body.id })
    .then(() => {
      req.flash('success_msg', 'Categoria deletada com sucesso!')
      res.redirect('/admin/categorias')
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao deletar a categoria')
      res.redirect('/admin/categorias')
    })
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then(categoria => {
      res.render('admin/editcategorias', { categoria: categoria })
    })
    .catch(err => {
      req.flash('error_msg', 'Esta categoria não existe')
      res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => {
  Postagem.find()
    .lean()
    .populate('categoria')
    .sort({ data: 'desc' })
    .then(postagens => {
      res.render('admin/postagens', { postagens: postagens })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao listar as postagens')
      res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .then(categorias => {
      res.render('admin/addpostagem', { categorias: categorias })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao carregar o formulário')
      res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
  const { titulo, descricao, conteudo, categoria, slug } = req.body

  var erros = []

  if (categoria == '0') {
    erros.push({ texto: 'Categoria inválida, registre uma categoria' })
  }

  if (erros.length > 0) {
    res.render('admin/addpostagem', { erros: erros })
  } else {
    const novaPostagem = {
      titulo: titulo,
      descricao: descricao,
      conteudo: conteudo,
      categoria: categoria,
      slug: slug
    }

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash('success_msg', 'Postagem criada com sucesso!')
        res.redirect('/admin/postagens')
      })
      .catch(err => {
        req.flash('error_msg', 'Houve um erro durante o salvamento da postagem')
        res.redirect('/admin/postagens')
      })
  }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .lean()
    .then(postagem => {
      Categoria.find()
        .lean()
        .then(categorias => {
          res.render('admin/editpostagens', {
            categorias: categorias,
            postagem: postagem
          })

          console.log(categorias)
        })
        .catch(err => {
          req.flash('error_msg', 'Houve um erro ao listar as categorias')
          res.redirect('/admin/postagens')
        })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias')
      res.redirect('/admin/postagens')
    })
})

router.post('/postagem/edit', eAdmin, (req, res) => {
  const { id, titulo, slug, descricao, conteudo, categoria } = req.body

  Postagem.findOne({ _id: id })
    .then(postagem => {
      postagem.titulo = titulo
      postagem.slug = slug
      postagem.descricao = descricao
      postagem.conteudo = conteudo
      postagem.categoria = categoria

      postagem.save().then(() => {
        req.flash('success_msg', 'Postagem editada com sucesso!')
        res.redirect('/admin/postagens')
      })
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro ao salvar a edição')
      res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Postagem deletada com sucesso!')
      res.redirect('/admin/postagens')
    })
    .catch(err => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/admin/postagens')
    })
})

module.exports = router
