BEGIN;

INSERT INTO bookmarks (title, url, rating, description)
VALUES
    ('First Bookmark', 'https://www.first-bookmark.com', 5, 'First bookmark description'),
    ('Second Bookmark', 'https://www.second-bookmark.com', 4, 'Second bookmark description'),
    ('Third Bookmark', 'https://www.third-bookmark.com', 3, 'Third bookmark description'),
    ('Fourth Bookmark', 'https://www.fourth-bookmark.com', 2, 'Fourth bookmark description'),
    ('Fifth Bookmark', 'https://www.fifth-bookmark.com', 1, 'Fifth bookmark description'),
    ('Sixth Bookmark', 'https://www.sixth-bookmark.com', 5, 'Sixth bookmark description'),
    ('Seventh Bookmark', 'https://www.seventh-bookmark.com', 4, 'Seventh bookmark description'),
    ('Eighth Bookmark', 'https://www.eighth-bookmark.com', 3, 'Eighth bookmark description'),
    ('Ninth Bookmark', 'https://www.ninth-bookmark.com', 2, 'Ninth bookmark description'),
    ('Tenth Bookmark', 'https://www.tenth-bookmark.com', 1, 'Tenth bookmark description');

COMMIT;