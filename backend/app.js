const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');
const dotenv = require('dotenv').config({path: "./config/.env"});

const limiter = require('./middleware/rateLimit');

// Apply the rate limiting middleware to all requests



mongoose.connect(`mongodb+srv://${process.env.DB_LOGINS}@hottakesdb.d6d7a.mongodb.net/htdb?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
  useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
  const app = express();
  
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', limiter, saucesRoutes);
app.use('/api/auth', limiter, userRoutes);
module.exports = app;
