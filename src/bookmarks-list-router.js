const bookmarksData = require('./bookmarks-data');
const logger = require('./logger');

const express = require('express');
const { v4: uuid } = require('uuid');
const validUrl = require('valid-url');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
      .json(bookmarksData);
  })
  .post(bodyParser, (req, res) => {
    const { title, desc,rating=1, url } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!desc) {
      logger.error('Description is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (rating && isNaN(Number(rating))) {
      logger.error('Rating must be a number');
      return res
        .status(400)
        .send('Invalid data');
    }


    if (!url) {
      logger.error('Description is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!validUrl.isUri(url) ) {
      logger.error('Valid is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    // get an id
    const id = uuid();
  
    const newBookmark = {
      id,
      title,
      desc,
      rating,
      url
    };
  
    bookmarksData.push(newBookmark);
  
    logger.info(`bookmarks with id ${id} created`);
  
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(newBookmark);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmarks = bookmarksData.find(li => li.id == id);

    if (!bookmarks) {
      logger.error(`bookmarks with id ${id} not found.`);
      return res
        .status(404)
        .send('bookmarks Not Found');
    }

    res.json(bookmarks);
  })


  .delete((req, res) => {
    const { id } = req.params;

    const bookmarksIndex = bookmarksData.findIndex(li => li.id == id);

    if (bookmarksIndex === -1) {
      logger.error(`bookmarks with id ${id} not found.`);
      return res
        .status(404)
        .send('Not Found');
    }

    bookmarksData.splice(bookmarksIndex, 1);

    logger.info(`bookmarks with id ${id} deleted.`);
    res
      .status(204)
      .end();
  });



module.exports = bookmarksRouter;