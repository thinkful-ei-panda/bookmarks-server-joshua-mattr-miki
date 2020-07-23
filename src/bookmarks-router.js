const express = require('express');
const xss = require('xss');
const logger = require('./logger');
const validUrl = require('valid-url');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const BookmarksService = require('./bookmarks-service');

bookmarksRouter.use(bodyParser)

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)   
            })
            .catch(next)
    })
    .post((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { title, url, rating = 1, description } = req.body;

        // Condense this part without sacrificing readability
        if (!title && !url && !rating) {
            logger.error('Title, URL, & rating are required');
            return res.status(400).send('Title, URL, & rating are required');
        }; 

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

        // if (!description) {
        //     logger.error('Description is required');
        //     return res.status(400).send('Description is required');
        // };

        if(!rating) {
            logger.error('Rating is required');
            return res.status(400).send('Rating is required')
        }

        if (isNaN(Number(rating)) || rating < 0 || rating > 5) {
            logger.error('Rating must be a number');
            return res.status(400).send('Rating must be a number from 1-5');
        };
      
        const newBookmark = {
            title,
            url,
            rating,
            description,
        };
      
        BookmarksService.insertNewBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                logger.info(`Bookmark ID ${bookmark.id} created`);
                return res
                    .status(201)
                    .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
                    .json(bookmark);
            })
            .catch(next)
    });

bookmarksRouter
    .route('/:bookmark_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        const bookmarkID = req.params.bookmark_id;
        BookmarksService.getBookmarkByID(knexInstance, bookmarkID)
            .then(bookmark => {
                if(!bookmark) {
                    return res
                        .status(404)
                        .json({error: {message: 'Bookmark does not exist'}})
                }
            res.json(bookmark)
            })
            .catch(next)
    })
    .patch((req, res, next) => {
        const knexInstance = req.app.get('db');
        const bookmarkID = req.params.bookmark_id;
        const { title, url, rating, description } = req.body;
        const updateBookmark = { title, url, rating, description };

        // Taken from the checkpoint
        const numberOfValues = Object.values(updateBookmark).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).end();
        };
        BookmarksService.updateBookmark(knexInstance, bookmarkID, updateBookmark)
            .then(bookmark => {
                if(!bookmark) {
                    return res
                        .status(404)
                        .json({error: {message: 'Bookmark does not exist'}})
                };
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const bookmarkID = req.params.bookmark_id;
        BookmarksService.deleteNewBookmark(knexInstance, bookmarkID)
            .then(bookmark => {
                if(!bookmark) {
                    return res.status(404).end();
                };
                res.status(200).end();
            })
            .catch(next)
    });

module.exports = bookmarksRouter;