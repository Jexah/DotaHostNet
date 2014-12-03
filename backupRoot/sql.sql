-- Ensure the DB exists
CREATE DATABASE IF NOT EXISTS dotahost;

-- Use our DB
USE dotahost;

-- Ensure steamUsers exists
CREATE TABLE IF NOT EXISTS steamUsers (
	steamID INT UNSIGNED NOT NULL,
    avatar VARCHAR(2083) NOT NULL,
    personaname VARCHAR(32) NOT NULL,
    profileurl VARCHAR(2083) NOT NULL,
	PRIMARY KEY(steamID)
);

-- Ensure sessionKeys exist
CREATE TABLE IF NOT EXISTS sessionKeys (
    steamID INT UNSIGNED NOT NULL,
    token CHAR(32) NOT NULL,
    PRIMARY KEY(steamID),
    FOREIGN KEY (steamID)
        REFERENCES steamUsers(steamID)
        ON DELETE CASCADE
);
