const express = require('express');
const { v4: uuid } = require('uuid');
const validUrl = require('valid-url');

const logger = require('./logger');
const bookmarks = require('./bookmarks-data');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
    .route('/')
    .get((req, res) => res.json(bookmarks))
    .post(bodyParser, (req, res) => {
      const { title, url, rating = 1, desc } = req.body;

      if (!title && !url && !desc) {
        logger.error('Title, URL, & description are required');
        return res.status(400).send('Title, URL, & description are required');
      } 

      if (!title) {
        logger.error('Title is required');
        return res.status(400).send('Title is required');
      };

      if (!url) {
        logger.error('URL is required');
        return res.status(400).send('URL is required');
      };

      if (!validUrl.isUri(url) ) {
        logger.error('URL is invalid');
        return res.status(400).send('Please enter a valid URL');
      };

      if (!desc) {
        logger.error('Description is required');
        return res.status(400).send('Description is required');
      };

      if (rating && isNaN(Number(rating))) {
        logger.error('Rating must be a number');
        return res.status(400).send('Rating must be a number');
      };

      const id = uuid();
    
      const newBookmark = {
        id,
        title,
        url,
        rating,
        desc,
      };
    
      bookmarks.push(newBookmark);
      
      logger.info(`Bookmark ID ${id} created`);
    
      res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json(newBookmark);
    });

bookmarksRouter
    .route('/:id')
    .get((req, res) => {
      const { id } = req.params;
      const bookmark = bookmarks.find(bookmark => bookmark.id == id);

      if (!bookmark) {
        logger.error(`Bookmark ID ${id} not found`);
        return res.status(404).send('Bookmark not found');
      }

      res.json(bookmark);
    })
    .delete((req, res) => {
      const { id } = req.params;
      const bookmarkIndex = bookmarks.findIndex(li => li.id == id);

      if (bookmarkIndex === -1) {
        logger.error(`Bookmarks ID ${id} not found`);
        return res.status(404).send('Not Found');
      }

      bookmarks.splice(bookmarkIndex, 1);

      logger.info(`Bookmark ID ${id} deleted`);
      
      res.status(204).end();
    });

module.exports = bookmarksRouter;