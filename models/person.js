const mongoose = require('mongoose');

const url = process.env.MONGO_URI;

console.log("Connecting to MongoDB...")

mongoose.connect(url)
    .then(result => {
        console.log("Connected to MongoDB")
    })
    .catch(error => {
        console.log("Error connecting to MongoDB ", error.message)
    });

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        required: true
    }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {  
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Person = mongoose.model("Person", personSchema);

module.exports = mongoose.model("Person", personSchema);