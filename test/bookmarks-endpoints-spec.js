const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');

const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks-fixtures')

// Things to do
// POST test with data
// PATCH test with no bookmark found
// PATCH test with bookmark found
// Sanitation

describe(`Bookmarks Endpoints`, function() {
    let db;

    before(`Make a connection`, () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('Destroy connection', () => db.destroy(() => {console.log('Meow')}));

    before(`Clear bookmarks table`, () => db('bookmarks').truncate());
    
    afterEach('Clear bookmarks table', () => db('bookmarks').truncate());

    context(`Given there is no data in database`, () => {
        it(`GET /bookmarks responds with 200 and an empty array`, () => {
            return supertest(app)
                .get(`/bookmarks`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .expect(200, [])
        });

        it(`POST /bookmarks responds with 201 and the new bookmark`, () => {
            const newBookmark = {
                title: 'Some New Title',
                url: 'https://newurl.com',
                rating: 5,
                description: 'Some new description.'
            };
            return supertest(app)
                .post(`/bookmarks`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    // Do something about this
                    expect(res.body[0].title).to.eql(newBookmark.title);
                    expect(res.body[0].url).to.eql(newBookmark.url);
                    expect(res.body[0].rating).to.eql(newBookmark.rating);
                    expect(res.body[0].description).to.eql(newBookmark.description);
                    expect(res.body[0].id).to.exist;
                    expect('location', `/bookmarks/${res.body[0].id}`);
                })
                .then(res =>
                    supertest(app)
                        .get(`/bookmarks/${res.body[0].id}`)
                        .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                        .expect(res.body[0])
                );
        });
    });

    context(`Given there is data in database`, () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('Insert dummy bookmarks into table', () => {
            return db('bookmarks')
                .insert(testBookmarks)
        });

        it(`GET /bookmarks responds with 200 and all bookmarks in database`, () => {
            return supertest(app)
                .get('/bookmarks')
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .expect(200, testBookmarks)
                .then(res => {
                    // expect(res.body).to.be.an('array')
                    // expect(res.body).to.have.length(4)
                    expect(res.body).to.eql(testBookmarks);
                    res.body.forEach(bookmark => {
                        expect(bookmark).to.be.an('object');
                        expect(bookmark).to.include.keys('id', 'title', 'rating', 'description');
                    })
                });
        });

        it(`GET /bookmarks/:bookmark_id responds with 200 and the requested bookmark`, () => {
            const bookmarkID = 1;
            return supertest(app)
                .get(`/bookmarks/${bookmarkID}`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .expect(200)
                .then(res => {
                    expect(res.body.title).to.eql(testBookmarks[0].title);
                    expect(res.body.url).to.eql(testBookmarks[0].url);
                    expect(res.body.rating).to.eql(testBookmarks[0].rating);
                    // Description is not required so you may have to change this later on
                    expect(res.body.description).to.eql(testBookmarks[0].description);
                    expect(res.body).to.exist;
                });
        });

        it(`GET /bookmarks/:bookmark_id responds with 404 and an error object`, () => {
            const bookmarksID = 12345;
            return supertest(app)
                .get(`/bookmarks/${bookmarksID}`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .expect(404, {error: {message: 'Bookmark does not exist'}})
        });

        it(`PATCH /bookmarks/:bookmark_id responds with 204 when there is a bookmark match`, () => {
            const bookmarkID = 1;
            const updateBookmark = {
                title: 'Some Updated Title',
                url: 'https://first-bookmark.com',
                rating: 5,
                description: 'Some new description'
            };
            // Taken from the checkpoint
            // Interesting way to merge
            // Alternatively, try using Object.assign
            const expectedBookmark = {
                ...testBookmarks[bookmarkID-1],
                ...updateBookmark
            };
            return supertest(app)
                .patch(`/bookmarks/${bookmarkID}`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .send(updateBookmark)
                .expect(204)
        });

        // it(`PATCH /bookmarks/:bookmark_id responds with 404 when there is no bookmark match`, () => {
        //     const bookmarkID = 12345;
        //     return supertest(app)
        //         .patch(`/bookmarks/${bookmarkID}`)
        //         .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
        //         .expect(404, () => console.log('hello'))
        // });

        it(`DELETE /bookmarks/:bookmark_id responds with 200`, () => {
            const bookmarkID = 1;
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkID}`)
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .expect(200)
                    .then(res => {
                        const testBookmarksLessOne = testBookmarks.filter(bookmark => bookmark.id !== bookmarkID);
                        return supertest(app)
                            .get(`/bookmarks`)
                            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                            .expect(200, testBookmarksLessOne)
                    });
        });

        it(`DELETE /bookmarks/:bookmark_id responds with 404 when there is no bookmark match`, () => {
            const bookmarkID = 12345;
            return supertest(app)
                .delete(`/bookmarks/${bookmarkID}`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .expect(404)
        });

    });
});