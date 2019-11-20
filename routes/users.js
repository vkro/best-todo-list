/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const { getBook, getRestaurants, getMovie, getTvShow } = require('../lib/util/api_helpers');

module.exports = (helpers) => {
  router.get('/items', (req, res) => {
    helpers.getItems()
    .then((products) => {
      res.send(products)
    })
  });

  router.post('/', (req, res) => {
    const query = req.body.todo;
    const location = req.body.location;
    console.log('location is', location)
    getBook(query, (err, book) => {
      helpers.addBook(book)
      .then(() => { res.json(query) });
    })
  });

  return router;
};





