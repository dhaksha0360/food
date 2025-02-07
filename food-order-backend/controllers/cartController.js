const db = require('../db/db');

// Add to cart
const addToCart = (req, res) => {
    const { user_name, food_item, quantity } = req.body;
    const sql = "INSERT INTO cart (user_name, food_item, quantity) VALUES (?, ?, ?)";
    
    db.query(sql, [user_name, food_item, quantity], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Item added to cart!", cartId: result.insertId });
    });
};

// Get cart items
const getCart = (req, res) => {
    const sql = "SELECT * FROM cart";
    
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

module.exports = { addToCart, getCart };