const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

require('./routes')(app, {});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
