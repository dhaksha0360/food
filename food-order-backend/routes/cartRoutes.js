const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get all cart items
router.get('/', (req, res) => {
  db.query('SELECT * FROM cart', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add item to cart
router.post('/add', (req, res) => {
  const { name, price, image, quantity } = req.body;
  db.query('INSERT INTO cart (name, price, image, quantity) VALUES (?, ?, ?, ?)', 
    [name, price, image, quantity], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Item added successfully', id: result.insertId });
    });
});

// Update item quantity
router.put('/update/:id', (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Quantity updated' });
  });
});

// Remove item from cart
router.delete('/remove/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM cart WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item removed' });
  });
});

module.exports = router;