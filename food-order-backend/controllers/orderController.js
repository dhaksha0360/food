const db = require('../db/db');

// Place an order
const placeOrder = (req, res) => {
    const { user_name, food_item } = req.body;
    const sql = "INSERT INTO orders (user_name, food_item) VALUES (?, ?)";
    
    db.query(sql, [user_name, food_item], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Order placed successfully!", orderId: result.insertId });
    });
};

// Get Order Status
const getOrderStatus = (req, res) => {
    const { orderId } = req.params;
    const sql = "SELECT status FROM orders WHERE id = ?";
    
    db.query(sql, [orderId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Order not found" });
        res.json({ status: result[0].status });
    });
};

module.exports = { placeOrder, getOrderStatus };