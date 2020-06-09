const mongoose = require('mongoose');

const uri = 'mongodb+srv://model-c:WJjXpccO4VZRHxbj@modeld-pyohw.mongodb.net/configServer';

mongoose.connection.openUri(uri, (err, res) => {
    if (err) throw err;
    console.log('Base de datos \x1b[36m%s\x1b[0m', 'Conectada!');
});