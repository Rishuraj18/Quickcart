const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount provided' 
      });
    }

    // Convert amount to paise (Razorpay expects amount in paise)
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    
    console.log(`Creating order: ₹${amount} (${amountInPaise} paise)`);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    // Create order in Razorpay
    const order = await razorpayInstance.orders.create(options);
    
    console.log('Razorpay order created:', order.id);
    
    // Send response
    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status
    });
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Check if it's a key/configuration error
    if (error.message && (error.message.includes('key') || error.code === 'INVALID_KEY')) {
      // Return mock order for testing without Razorpay keys
      return res.json({
        success: true,
        id: `mock_order_${Date.now()}`,
        amount: Math.round(parseFloat(req.body.amount) * 100),
        currency: 'INR',
        status: 'created',
        mock: true,
      });
    }
    
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment verification details' 
      });
    }

    // For mock payments (testing without Razorpay)
    if (razorpay_order_id.startsWith('mock_order_')) {
      return res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    next(error);
  }
};