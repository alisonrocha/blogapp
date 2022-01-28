const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
  res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
  const { nome, email, senha, senha2 } = req.body

  var erros = []

  if (!nome || typeof nome == undefined || nome == null) {
    erros.push({ texto: 'Nome inválido' })
  }

  if (!email || typeof email == undefined || email == null) {
    erros.push({ texto: 'Email inválido' })
  }

  if (senha.length < 4) {
    erros.push({ texto: 'Senha muito curta' })
  }

  if (senha != senha2) {
    erros.push({ texto: 'As senhas são diferentes, tente novamente' })
  }

  if (erros.length > 0) {
    res.render('usuarios/registro', { erros: erros })
  } else {
    Usuario.findOne({ email: req.body.email })
      .then(usuario => {
        if (usuario) {
          req.flash(
            'error_msg',
            'Já existe uma conta com este e-mail no nosso sistema'
          )
          res.redirect('usuarios/registro')
        } else {
          const { nome, email, senha } = req.body

          const novoUsuario = new Usuario({
            nome: nome,
            email: email,
            senha: senha
          })

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  'error_msg',
                  'Houve um erro durante o salvamneto do usuário'
                )
                res.redirect('/')
              }

              novoUsuario.senha = hash

              novoUsuario
                .save()
                .then(() => {
                  req.flash('success_msg', 'Usuário criado com sucesso!')
                  res.redirect('/')
                })
                .catch(err => {
                  req.flash(
                    'error_msg',
                    'Houve um erro ao criar o usuário, tente novamente!'
                  )
                  res.redirect('/')
                })
            })
          })
        }
      })
      .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
      })
  }
})

router.get('/login', (req, res) => {
  res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Deslogado com sucesso!')
  res.redirect('/')
})

module.exports = router
