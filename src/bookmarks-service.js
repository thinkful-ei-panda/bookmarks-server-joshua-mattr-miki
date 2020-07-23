const BookmarksService = {
    getAllBookmarks(db) {
        return db('bookmarks')
            .select('*')
    },

    getBookmarkByID(db, id) {
        return db('bookmarks')
            .select('*')
            .where({id})
            .first()
    },

    insertNewBookmark(db, newBookmark) {
        return db('bookmarks')
            .insert(newBookmark, ['*'])
    },

    updateBookmark(db, id, updateBookmark) {
        return db('bookmarks')
            .where({id})
            .update(updateBookmark, ['*'])
    },

    deleteNewBookmark(db, id) {
        return db('bookmarks')
            .where({id})
            .del()
    },
};

module.exports = BookmarksService;