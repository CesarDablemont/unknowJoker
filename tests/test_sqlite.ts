/*
run it with :
node tests/test_sqlite.ts
*/
import { Database } from 'sqlite3'
const sqlite3 = require('sqlite3')

//const db = new Database(':memory:');
const db = new Database('tests/db.sqlite')

db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)', function (err) {
    if (err) {
        return console.error(err.message)
    }

    // Insert a row into the table
    db.run('INSERT INTO users (name) VALUES (?)', ['John Doe'], function (err) {
        if (err) {
            return console.error(err.message)
        }

        console.log(`A row has been inserted with id ${this.lastID}`)
    })

    // Read data from the table
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            throw err
        }

        console.log('Users:')
        rows.forEach((row: any) => {
            console.log(`ID: ${row.id}, Name: ${row.name}`)
        })

        // Close the database connection
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Database connection closed.')
        })
    })

})


console.log('Fin du test')
