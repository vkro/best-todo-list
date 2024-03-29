module.exports = (db) => {
  const register = function(user) {
    const createUser = `
    INSERT INTO users (full_name, email, pw, signup_date)
    VALUES ($1, $2, $3, now()::date)
    RETURNING *
    ;`;

    return db
    .query(createUser, [`${user.full_name}`, `${user.email}`, `${user.pw}`])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from createUser: ${err}`);
    });
  };

  const getItems = function(user) {
    const allItems =
    `
    SELECT
    todo_items.user_id AS userid,
    todo_items.id AS todo_id, todo_items.category_id,
    todo_items.title, todo_items.description, todo_items.url, todo_items.img,
    products.id AS product_id, products.brand, products.vendor, products.cost,
    books.id AS book_id, books.author, books.publication_date, books.page_length, books.genre AS books_genre,
    restaurants.id AS restaurant_id, restaurants.street_address, restaurants.city, restaurants.province_state, restaurants.country, restaurants.google_map_url,
    movies_tv.id AS movie_id, movies_tv.year, movies_tv.runtime, movies_tv.actors, movies_tv.genre AS movietv_genre
  FROM todo_items
  LEFT OUTER JOIN movies_tv ON todo_items.id = movies_tv.todo_item_id
  LEFT OUTER JOIN restaurants ON todo_items.id = restaurants.todo_item_id
  LEFT OUTER JOIN products ON todo_items.id = products.todo_item_id
  LEFT OUTER JOIN books ON todo_items.id = books.todo_item_id
  WHERE todo_items.archived = false
  AND todo_items.user_id = $1
  ;`

    return db
    .query(allItems, [user])
    .then(res => res.rows)
    .catch((err) => {
      console.error(`Error from getItems: ${err}`);
    });
  };

  const getCompleted = function(user) {
    const completedItems = `
    SELECT
    todo_items.user_id AS userid,
    todo_items.id AS todo_id, todo_items.category_id,
    todo_items.title, todo_items.description, todo_items.url, todo_items.img,
    products.id AS product_id, products.brand, products.vendor, products.cost,
    books.id AS book_id, books.author, books.publication_date, books.page_length, books.genre AS books_genre,
    restaurants.id AS restaurant_id, restaurants.street_address, restaurants.city, restaurants.province_state, restaurants.country, restaurants.google_map_url,
    movies_tv.id AS movie_id, movies_tv.year, movies_tv.runtime, movies_tv.actors, movies_tv.genre AS movietv_genre
  FROM todo_items
  LEFT OUTER JOIN movies_tv ON todo_items.id = movies_tv.todo_item_id
  LEFT OUTER JOIN restaurants ON todo_items.id = restaurants.todo_item_id
  LEFT OUTER JOIN products ON todo_items.id = products.todo_item_id
  LEFT OUTER JOIN books ON todo_items.id = books.todo_item_id
  WHERE todo_items.archived = true
  AND todo_items.user_id = $1
  ;`;

    return db
    .query(completedItems, [user])
    .then(res => res.rows)
    .catch((err) => {
      console.error(`Error from getCompleted: ${err}`);
    });
  };

  const archiveItem = function(user, todo) {
    const archive = `
    UPDATE todo_items
    SET archived = true
    WHERE user_id = $1 AND id = $2
    ;`;

    return db
    .query(archive, [user, todo])
    .then(res => res.rows)
    .catch((err) => {
      console.error(`Error from archiveItem: ${err}`);
    });
  }

  const unarchiveItem = function(user, todo) {
    const archive = `
    UPDATE todo_items
    SET archived = false
    WHERE user_id = $1 AND id = $2
    ;`;

    return db
    .query(archive, [user, todo])
    .then(res => res.rows)
    .catch((err) => {
      console.error(`Error from unarchiveItem: ${err}`);
    });
  }

  const addBook = function(book, user) {
    const newBook = `
    WITH new_todo AS (
      INSERT INTO todo_items (category_id, title, description, url, img, user_id)
      SELECT $1, $2, $3, $4, $5, $10
      WHERE NOT EXISTS (SELECT * FROM todo_items WHERE url = $4::varchar)
      RETURNING id
    )
    INSERT INTO books (todo_item_id, author, publication_date, page_length, genre)
    SELECT (SELECT id FROM new_todo), $6, $7, $8, $9
    WHERE EXISTS (SELECT * FROM new_todo)
    ;`;

    return db
    .query(newBook, [book.category_id, `${book.title}`, `${book.description}`, `${book.url}`, `${book.img}`, `${book.author}`, `${book.publication_date}`, book.page_length, `${book.genre}`, user])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from addBook: ${err}`);
    });

  }

  const addRestaurant = function(restaurant, user) {
    const newRestaurant = `
    WITH new_todo AS (
      INSERT INTO todo_items (category_id, title, description, url, img, user_id)
      SELECT $1, $2, $3, $4, $5, $11
      WHERE NOT EXISTS (SELECT * FROM todo_items WHERE url = $4::varchar)
      RETURNING id
    )
    INSERT INTO restaurants (todo_item_id, street_address, city, province_state, country, google_map_url)
    SELECT (SELECT id FROM new_todo), $6, $7, $8, $9, $10
    WHERE EXISTS (SELECT * FROM new_todo)
    ;`;

    return db
    .query(newRestaurant, [restaurant.category_id, `${restaurant.title}`, `${restaurant.description}`, `${restaurant.url}`, `${restaurant.img}`, `${restaurant.street_address}`, `${restaurant.city}`, `${restaurant.province_state}`, `${restaurant.country}`, `${restaurant.google_map_url}`, user])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from addRestaurant: ${err}`);
    })
  }

  const addMovie = function(movie, user) {
    const newMovie = `
    WITH new_todo AS (
      INSERT INTO todo_items (category_id, title, description, url, img, user_id)
      SELECT $1, $2, $3, $4, $5, $8
      WHERE NOT EXISTS (SELECT * FROM todo_items WHERE url = $4::varchar)
      RETURNING id
    )
    INSERT INTO movies_tv (todo_item_id, genre, year)
    SELECT (SELECT id FROM new_todo), $6, $7
    WHERE EXISTS (SELECT * FROM new_todo)
    ;`;
    return db
    .query(newMovie, [movie.category_id, `${movie.title}`, `${movie.description}`, `${movie.url}`, `${movie.img}`, `${movie.genre}`, movie.year, user])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from addMovie: ${err}`);
    })
  }

  const addTvShow = function(tv, user) {
    const newTvShow = `
    WITH new_todo AS (
      INSERT INTO todo_items (category_id, title, description, url, img, user_id)
      SELECT $1, $2, $3, $4, $5, $8
      WHERE NOT EXISTS (SELECT * FROM todo_items WHERE url = $4::varchar)
      RETURNING id
    )
    INSERT INTO movies_tv (todo_item_id, genre, year)
    SELECT (SELECT id FROM new_todo), $6, $7
    WHERE EXISTS (SELECT * FROM new_todo)
    ;`;
    return db
    .query(newTvShow, [tv.category_id, `${tv.title}`, `${tv.description}`, `${tv.url}`, `${tv.img}`, `${tv.genre}`, tv.year, user])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from addTvShow: ${err}`);
    })
  }

  const addProduct = function(product, user) {
    const newProduct = `
    WITH new_todo AS (
      INSERT INTO todo_items (category_id, title, description, url, img, user_id)
      SELECT $1, $2, $3, $4, $5, $8
      WHERE NOT EXISTS (SELECT * FROM todo_items WHERE url = $4::varchar)
      RETURNING id
    )
    INSERT INTO products (todo_item_id, cost, brand)
    SELECT (SELECT id FROM new_todo), $6, $7
    WHERE EXISTS (SELECT * FROM new_todo)
    ;`;

    return db
    .query(newProduct, [product.category_id, `${product.title}`, `${product.description}`, `${product.url}`, `${product.img}`, product.cost, `${product.brand}`, user])
    .then(res => res.rows[0])
    .catch((err) => {
      console.error(`Error from addProduct: ${err}`);
    })
  }

  const getUserId = function(email) {
    const userFromDatabase = `
    SELECT *
    FROM users
    WHERE email = $1::text
    ;
    `;
    return db
    .query(userFromDatabase, [`${email}`])
    .then(res => res.rows[0].id)
    .catch((err) => console.error(`Error from getUserId: ${err}`))
  };


  return { addBook, getItems, addRestaurant, archiveItem, getCompleted, unarchiveItem, register, getUserId, addProduct, addTvShow, addMovie };
};
