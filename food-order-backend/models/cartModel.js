const db = require('../db/db');

const Cart = {
  getAll: (callback) => {
    db.query('SELECT * FROM cart', callback);
  },
  addItem: (item, callback) => {
    db.query('INSERT INTO cart (name, price, quantity, image) VALUES (?, ?, ?, ?)',
      [item.name, item.price, item.quantity, item.image], callback);
  },
  updateItem: (id, quantity, callback) => {
    db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], callback);
  },
  removeItem: (id, callback) => {
    db.query('DELETE FROM cart WHERE id = ?', [id], callback);
  }
};

module.exports = Cart;