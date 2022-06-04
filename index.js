require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const app = express();
const Person = require('./models/person');

app.use(express.static('build'));
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

app.get('/info', (request, response) => {
    Person.estimatedDocumentCount({})
        .then(result => {
            response.send(`
                <p>Phonebook has info for ${result} people.</p>
                <p>${new Date}</p>
            `)
        });
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                return response.json(person);
            }
            else{
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number
    };

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
    console.log(error.message);

    if(error.name === "CastError"){
        return response.status(400).send({error: "Malformed ID"});
    }
    else if(error.name === "ValidationError"){
        return response.status(400).json({error: error.message});
    }

    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}.`);
});