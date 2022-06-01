const {nanoid} = require('nanoid');
const morgan = require('morgan');
const express = require('express');
const app = express();

app.use(express.json());
morgan.token('content', (req, res) => {
    return JSON.stringify(req.body);
});
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req,res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.content(req, res)
    ].join(' ');
}));

let persons = [
    { 
      id: nanoid(3),
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: nanoid(3),
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: nanoid(3),
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: nanoid(3),
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
];

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people.</p>
        <p>${new Date}</p>
    `);
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(p => p.id === id);

    if(person){
        response.json(person);
    }
    else{
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(p => p.id !== id);

    response.status(204).end();
});

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if(!body.name || !body.number){
        return response.status(400).json({error: "Name or number must not be empty."});
    }
    else if(persons.find(p => p.name === body.name)){
        return response.status(400).json({error: "Name must be unique."});
    }

    const person = {
        id: nanoid(3),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(person);
    response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}.`);
});