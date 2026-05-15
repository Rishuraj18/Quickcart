/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable preserve-caught-error */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { IMG_BASE } from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

// Image URL helper - EXACT same logic as Home component
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.png';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Use IMG_BASE exactly like Home component
  // Home component uses: `${IMG_BASE}${cat.image}`
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${IMG_BASE}${cleanPath}`;
};

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, fetchCart, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [newAddr, setNewAddr] = useState({ 
    street: '', 
    city: '', 
    state: '', 
    zipCode: '', 
    country: 'India' 
  });
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => { 
    fetchCart(); 
    loadAddresses();
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
      if (!loaded) {
        console.error('Razorpay script failed to load');
      }
    });
    
    // Set user's phone if available
    if (user?.phone) {
      setContactNumber(user.phone);
    }
  }, []);

  const loadAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses');
      setAddresses(data);
      if (data.length > 0) setSelectedAddr(data[0].id);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/addresses', { 
        ...newAddr, 
        isDefault: addresses.length === 0 
      });
      await loadAddresses();
      setShowNewAddr(false);
      setNewAddr({ 
        street: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        country: 'India' 
      });
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${addressId}`);
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const items = cart?.items || [];
  const total = getTotal();

  const createOrderAfterPayment = async (paymentId, orderId = null) => {
    try {
      const orderData = {
        items: items.map(i => ({ 
          productId: i.product.id, 
          quantity: i.quantity, 
          price: i.product.price * (1 - i.product.discount / 100) 
        })),
        totalAmount: total,
        paymentId: paymentId,
        razorpayOrderId: orderId,
        addressId: selectedAddr,
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        await clearCart();
        navigate('/orders', { 
          state: { 
            orderSuccess: true, 
            orderId: response.data.orderId 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const handlePayment = async () => {
    if (!selectedAddr) {
      alert('Please select a delivery address');
      return;
    }
    
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    // Check if contact number is provided
    if (!contactNumber || contactNumber.length < 10) {
      setShowContactModal(true);
      return;
    }

    setProcessing(true);
    
    try {
      const amountInRupees = parseFloat(total);
      
      console.log('Processing payment for amount (₹):', amountInRupees);
      
      const { data: paymentOrder } = await api.post('/dashboard/payment/create-order', { 
        amount: amountInRupees,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });

      console.log('Payment order response:', paymentOrder);

      if (!paymentOrder || !paymentOrder.id) {
        throw new Error('Failed to create payment order');
      }

      if (paymentOrder.mock === true) {
        console.log('Using mock payment mode');
        await createOrderAfterPayment('mock_payment_' + Date.now(), paymentOrder.id);
        setProcessing(false);
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SpbinXFPAyihte";
      
      const userEmail = user?.email || '';
      const userName = user?.name || '';
      
      const options = {
        key: razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Your Store Name',
        description: `Order Payment - ${new Date().toLocaleDateString()}`,
        order_id: paymentOrder.id,
        handler: async (response) => {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            
            const { data: verificationResult } = await api.post('/dashboard/payment/verify', verificationData);
            
            if (verificationResult.success) {
              await createOrderAfterPayment(
                response.razorpay_payment_id, 
                response.razorpay_order_id
              );
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: contactNumber
        },
        notes: {
          address: "User's delivery address",
          user_id: user?.id || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        let errorMessage = 'Payment failed. ';
        if (response.error.description) {
          errorMessage += response.error.description;
        } else if (response.error.reason) {
          errorMessage += response.error.reason;
        } else {
          errorMessage += 'Please try again.';
        }
        alert(errorMessage);
        setProcessing(false);
      });

      razorpay.open();
      
    } catch (err) {
      console.error('Payment initialization error:', err);
      alert('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  const handleImageError = (productId) => {
    if (!imageErrors[productId]) {
      console.log(`Image failed to load for product ${productId}`);
      setImageErrors(prev => ({ ...prev, [productId]: true }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Checkout</h1>
      
      {/* Contact Number Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Mobile Number Required</h2>
            <p className="text-gray-600 mb-4">Please enter your mobile number for payment</p>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (contactNumber && contactNumber.length === 10) {
                    setShowContactModal(false);
                    handlePayment();
                  } else {
                    alert('Please enter a valid 10-digit mobile number');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* Contact Information Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mobile Number</p>
                  {contactNumber ? (
                    <p className="text-sm font-medium">{contactNumber}</p>
                  ) : (
                    <p className="text-sm text-red-500">Not provided</p>
                  )}
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {contactNumber ? 'Edit' : 'Add'}
                </button>
              </div>
              {user?.email && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Delivery Address</h2>
                <button 
                  onClick={() => setShowNewAddr(!showNewAddr)} 
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add New
                </button>
              </div>
              
              {showNewAddr && (
                <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-2 mb-3">
                  <input 
                    value={newAddr.street} 
                    onChange={e => setNewAddr({...newAddr, street: e.target.value})} 
                    placeholder="Street Address" 
                    required 
                    className="col-span-2 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                  <input 
                    value={newAddr.city} 
                    onChange={e => setNewAddr({...newAddr, city: e.target.value})} 
                    placeholder="City" 
                    required 
                    className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                  <input 
                    value={newAddr.state} 
                    onChange={e => setNewAddr({...newAddr, state: e.target.value})} 
                    placeholder="State" 
                    required 
                    className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                  <input 
                    value={newAddr.zipCode} 
                    onChange={e => setNewAddr({...newAddr, zipCode: e.target.value})} 
                    placeholder="Zip Code" 
                    required 
                    className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                  <input 
                    value={newAddr.country} 
                    onChange={e => setNewAddr({...newAddr, country: e.target.value})} 
                    placeholder="Country" 
                    className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                  <button 
                    type="submit" 
                    className="col-span-2 h-9 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                  >
                    Save Address
                  </button>
                </form>
              )}
              
              <div className="space-y-2">
                {addresses.map(addr => (
                  <div key={addr.id} className="relative">
                    <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer ${selectedAddr === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddr === addr.id} 
                        onChange={() => setSelectedAddr(addr.id)} 
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}</span>
                        {addr.isDefault && (
                          <span className="ml-2 text-xs text-green-600">(Default)</span>
                        )}
                      </div>
                    </label>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {addresses.length === 0 && !showNewAddr && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No addresses saved. Click "Add New" to add a delivery address.
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Items ({items.length})</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={getImageUrl(item.product.images?.[0]?.url || item.product.ProductImage?.[0]?.url || item.product.image)} 
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700">{item.product.title}</span>
                      <span className="text-gray-500 ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.product.price * (1 - item.product.discount / 100) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 h-fit sticky top-16">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={handlePayment} 
              disabled={processing || !selectedAddr || items.length === 0}
              className="w-full mt-4 h-10 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      )}
    </div>
  );
}