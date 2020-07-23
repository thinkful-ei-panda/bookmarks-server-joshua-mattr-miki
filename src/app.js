require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./logger');
const bookmarksRouter = require('./bookmarks-router');
const { NODE_ENV, API_TOKEN } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const validateBearerToken = (req, res, next) => {
  const authToken = req.get('Authorization');
  const apiToken = API_TOKEN;

  if(!authToken || authToken.split(' ')[1] !== apiToken ) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'I don\'t like people who plagiarize' });
  };

  next();
};

app.use(validateBearerToken);
app.use('/bookmarks', bookmarksRouter);

app.use(function errorHandler(error, req, res, next) { 
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'Internal server error' } };
  } else {
    response = { message: error.message, error }
  }
  res.status(500).json(response);
});

module.exports = app;