const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// ✅ Serve static images from the 'public' folder
app.use('/images', (req, res, next) => {
  console.log(`Image request received: ${req.url}`);
  next();
}, express.static(path.join(__dirname, 'public', 'images')));

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change if needed
  password: '',
  database: 'food_ordering'
});

db.connect(err => {
  if (err) {
    console.error('Database Connection Failed:', err);
    return;
  }
  console.log('✅ MySQL Connected...');
});

// ✅ Fetch food items for the menu
app.get('/api/menu', (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Modify image paths to include the full URL
    results = results.map(item => ({
      ...item,
      image: `http://localhost:5004/images/${item.image}`
    }));

    res.json(results);
  });
});

// ✅ Add item to cart
app.post('/api/cart/add', (req, res) => {
  const { id, name, price, image } = req.body;

  db.query('SELECT * FROM cart WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      db.query('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', [id], err => {
        if (err) return res.status(500).json({ error: err.message });
        io.emit('cartUpdated');
        res.json({ message: 'Quantity increased' });
      });
    } else {
      db.query(
        'INSERT INTO cart (id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?)',
        [id, name, price, 1, image],
        err => {
          if (err) return res.status(500).json({ error: err.message });
          io.emit('cartUpdated');
          res.json({ message: 'Item added to cart' });
        }
      );
    }
  });
});

// ✅ Get cart items
app.get('/api/cart', (req, res) => {
  db.query('SELECT * FROM cart', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Modify image paths
    results = results.map(item => ({
      ...item,
      image: `http://localhost:5004/images/${item.image}`
    }));

    res.json(results);
  });
});

// ✅ Increase item quantity
app.put('/api/cart/increase/:id', (req, res) => {
  db.query('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT * FROM cart', (err, updatedCart) => {
      if (err) return res.status(500).json({ error: err.message });

      io.emit('cartUpdated', updatedCart);
      res.json({ message: 'Quantity increased' });
    });
  });
});

// ✅ Decrease item quantity
app.put('/api/cart/decrease/:id', (req, res) => {
  db.query('UPDATE cart SET quantity = quantity - 1 WHERE id = ? AND quantity > 1', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT * FROM cart', (err, updatedCart) => {
      if (err) return res.status(500).json({ error: err.message });

      io.emit('cartUpdated', updatedCart);
      res.json({ message: 'Quantity decreased' });
    });
  });
});

// ✅ Remove item from cart
app.delete('/api/cart/remove/:id', (req, res) => {
  db.query('DELETE FROM cart WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT * FROM cart', (err, updatedCart) => {
      if (err) return res.status(500).json({ error: err.message });

      io.emit('cartUpdated', updatedCart);
      res.json({ message: 'Item removed' });
    });
  });
});

// ✅ Fetch cart total price
app.get('/api/cart/total', (req, res) => {
  db.query('SELECT SUM(price * quantity) AS total FROM cart', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total || 0 });
  });
});

// ✅ Place an order
app.post('/api/orders', (req, res) => {
  const { name, address, phone, paymentMethod } = req.body;

  db.query('SELECT SUM(price * quantity) AS total FROM cart', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = results[0].total || 0;

    if (total === 0) {
      return res.status(400).json({ error: 'Cart is empty. Add items before placing an order.' });
    }

    db.query(
      'INSERT INTO orders (name, address, phone, payment_method, total) VALUES (?, ?, ?, ?, ?)',
      [name, address, phone, paymentMethod, total],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;

        db.query('SELECT * FROM cart', (err, cartItems) => {
          if (err) return res.status(500).json({ error: err.message });

          const orderItems = cartItems.map(item => [orderId, item.name, item.price, item.quantity]);

          db.query(
            'INSERT INTO order_items (order_id, item_name, price, quantity) VALUES ?',
            [orderItems],
            err => {
              if (err) return res.status(500).json({ error: err.message });

              db.query('DELETE FROM cart', deleteErr => {
                if (deleteErr) return res.status(500).json({ error: deleteErr.message });

                io.emit('cartUpdated', []);
                res.json({ message: 'Order placed successfully', orderId });
              });
            }
          );
        });
      }
    );
  });
});

// ✅ Fetch all orders
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ Fetch specific order details
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, orderResults) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, itemsResults) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ order: orderResults[0], items: itemsResults });
    });
  });
});

// ✅ WebSocket connection
io.on('connection', socket => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ✅ Start server
server.listen(5004, () => {
  console.log('✅ Server running on http://localhost:5004');
});