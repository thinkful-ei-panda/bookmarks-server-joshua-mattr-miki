require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, API_TOKEN } = require('./config');

const bookmarksData = require('./bookmarks-data');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const logger = winston.createLogger({
    level: 'info', // Alternatively, silly, debug, verbose, info, warn, error
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log' })
    ]
});

if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
};

const validateBearerToken = (req, res, next) => {
    const apiToken = API_TOKEN;
    const authToken = req.get('authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken ) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({ error: 'Unauthorized request' });
    };

    next();
}

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

app.get('/bookmarks', (req, res) => {
    console.log(req.get('Authorization'))
    res.json(bookmarksData)
});

app.get('/bookmarks/:id', (req, res) => {
    const { id } = req.params
    let bookmarks = bookmarksData

    let bookmark = bookmarks.find(bookmark => bookmark.id == id);

    if(!bookmark) {
        return res.status(404).send('Bookmark not found')
    }

    res.json(bookmark);
});

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.use(function errorHandler(error, req, res, next) { /* eslint-disable-line no-unused-var */
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'Internal server error' } };
    } else {
        console.log(error);
        response = { message: error.message, error }
    };
    res.status(500).json(response);
});

module.exports = app;