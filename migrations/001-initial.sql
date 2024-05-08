-- Up
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT(6) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    category_id INTEGER REFERENCES categories ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX events_unique ON events(title, starts_at, ends_at);
CREATE INDEX event_dates ON events(starts_at, ends_at);

-- Down
DROP INDEX event_dates;

DROP TABLE events;
DROP TABLE categories;
