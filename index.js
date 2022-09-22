const express = require('express')
var morgan = require('morgan')
const app = express()

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())

// Create special logger
morgan.token('content', (req, res) => {
  return JSON.stringify({...req.body})
})
const logger = morgan((tokens, req, res) => {
  const method = tokens.method(req, res)
  const log = [
    method,
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]
  if (method === 'POST') {
    log.push(tokens.content(req, res))
  }
  return log.join(' ')
})
app.use(logger)

// Requests
app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end();
  }
})

app.get('/info', (request, response) => {
  const text = `Phonebook has info for ${persons.length} persons`
  const date = new Date()
  response.send(`<p>${text}</p><p>${date}</p>`)
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const id = Math.floor(Math.random() * 1000000000)
  const person = {
    id: id,
    name: body.name,
    number: body.number
  }
  persons.concat(person)
  response.json(person)
}) 

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const origLength = persons.length
  persons = persons.filter(p => p.id !== id)
  if (persons.length !== origLength) {
    console.log("works")
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

// Setup port
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)