const express = require('express');
const { placeOrder, getOrderStatus } = require('../controllers/orderController');

const router = express.Router();

router.post('/', placeOrder);
router.get('/:orderId', getOrderStatus);

module.exports = router;