require('dotenv').config();
const knex = require('knex');
const bookshelf = require('bookshelf');

const dbPath = process.env.DB_PATH || `${__dirname}/data/db.sqlite`;

ORM = bookshelf(knex({
  client: 'sqlite',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true,
}));


module.exports = ORM;