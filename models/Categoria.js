const mongoose = require('mongoose')

const Categoria = mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
})

mongoose.model('categorias', Categoria)
