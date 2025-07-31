// OrderPage.tsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import jsPDF from 'jspdf';

// Initialize Stripe with the publishable key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const role = sessionStorage.getItem('role');

const OrderPage = () => {
  const { id } = useParams(); // Product ID, undefined for /orders
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(true); // Default to true for /orders
  const [activeTab, setActiveTab] = useState('pending');
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const buyerId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');
  const [loading, setLoading] = useState(false);

  const BuyerSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 animate-pulse">
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3 h-48 bg-gray-300 rounded-md"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white shadow-md rounded-lg p-6 text-center animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto"></div>
  </div>
);





  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return; // Skip product fetch for /orders
      try {
        const res = await axiosInstance.get(`/products/product_desc/${id}`);
        setProduct(res.data);
      } catch (error: any) {
        // console.error('Error fetching product:', error);
        toast.error(error.response?.data?.message || 'Failed to load product details');
      }
    };

    const fetchBuyer = async () => {
      if (!token || !buyerId) {
        // console.error('No token or buyerId found in sessionStorage:', { token, buyerId });
        toast.error('Please log in again');
        navigate('/login');
        return null;
      }
      try {
        const res = await axiosInstance.get(`/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('Fetched buyer data:', res.data);
        setBuyer(res.data);
        setPhoneNumber(res.data.phoneNumber || '');
        setAddress(res.data.address || '');
        return res.data;
      } catch (error: any) {
        console.error('Error fetching buyer:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to load buyer details');
        return null;
      }
    };

    const fetchOrders = async () => {
      if (!token) {
        console.error('No token found for fetching orders');
        return;
      }
      try {
        const res = await axiosInstance.get(`/orders/buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('Fetched orders:', res.data.orders);
        setOrders(res.data.orders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error(error.response?.data?.message || 'Failed to load order history');
      }
    };

    const confirmPayment = async (sessionId: string) => {
      try {
        // console.log('Confirming payment with sessionId:', sessionId);
        const res = await axiosInstance.post(
          `/orders/confirm-payment`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log('Confirm payment response:', res.data);
        if (res.data.success && res.data.order) {
          await fetchOrders(); // Refresh orders
          toast.success(res.data.message);
        }
      } catch (error: any) {
        console.error('Error confirming payment:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to confirm payment');
      }
    };

    const initialize = async () => {
      if (!buyerId || !token) {
        console.error('Missing buyerId or token, redirecting to login');
        toast.error('Please log in');
        navigate('/login');
        return;
      }

      // Fetch all data concurrently, skip product fetch if no id
      await Promise.all([id ? fetchProduct() : Promise.resolve(), fetchBuyer(), fetchOrders()]);

      // Check for sessionId after data is fetched
      const query = new URLSearchParams(location.search);
      const sessionId = query.get('session_id');
      if (sessionId && id) {
        await confirmPayment(sessionId);
      }
    };

    initialize();
  }, [id, buyerId, navigate, location.search, token]);

  const handlePlaceOrder = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/orders/create`,
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      await axiosInstance.get(`/orders/buyer`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setOrders(res.data.orders));
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    // console.log('Proceeding to payment for product ID:');
    setShowPopup(true);
  };

  const handleUpdateBuyerDetails = async () => {
    try {
      await axiosInstance.put(
        `/auth/profile`,
        { phoneNumber, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Buyer details updated');
      setBuyer({ ...buyer, phoneNumber, address });
    } catch (error: any) {
      console.error('Error updating buyer details:', error);
      toast.error(error.response?.data?.message || 'Failed to update buyer details');
    }
  };

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const currentOrder = orders.find((order) => order.productId._id === id);
      if (!currentOrder) return toast.error('No order found for this product');
      // console.log('Sending orderId:', currentOrder._id);
      await handleUpdateBuyerDetails();
      const res = await axiosInstance.post(
        `/orders/checkout`,
        { orderId: currentOrder._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log('Checkout session response:', res.data);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      const { error } = await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
      if (error) {
        console.error('Stripe redirect error:', error);
        toast.error(error.message || 'Failed to redirect to checkout');
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  //pdf generation function 
  const generateBill = async (order: any, buyerData: any) => {
  const doc = new jsPDF();

  const primaryColor = "#1E90FF";
  const textColor = "#333333";
  const lightGray = "#F5F5F5";
  const startX = 20;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#FFFFFF");
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 30, "F");
  doc.text("OLX Invoice", startX, 20);

  // Invoice Section
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  y += 20;
  doc.text("Invoice Details", startX, y);
  doc.setDrawColor("#D3D3D3");
  doc.line(startX, y + 2, 190, y + 2);

  const invoiceDetails = [
    `Invoice ID: ${order.billDetails?.invoiceId || "N/A"}`,
    `Date: ${order.billDetails?.paymentDate ? new Date(order.billDetails.paymentDate).toLocaleDateString() : "N/A"}`,
    `Order Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  y += 10;
  invoiceDetails.forEach(line => {
    doc.text(line, startX, y);
    y += 8;
  });

  // Product Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Product Details", startX, y + 5);
  doc.line(startX, y + 7, 190, y + 7);
  y += 15;

  doc.setFillColor(lightGray);
  doc.rect(startX, y - 3, 170, 30, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Product:", startX + 5, y + 7);
  doc.text(order.productId?.title || "N/A", startX + 40, y + 7);
  doc.text("Price:", startX + 5, y + 17);
  doc.text(order.billDetails ? `${order.billDetails.currency} ${order.billDetails.amount}` : "N/A", startX + 40, y + 17);

  // Load image and insert
  const imgUrl = order.productId?.imageURL;
  if (imgUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;

    img.onload = () => {
      doc.addImage(img, "JPEG", 140, y, 40, 30);

      // Buyer Section (after image)
      addBuyerSection();
    };

    img.onerror = () => {
      console.warn("Image failed to load, generating without image");
      addBuyerSection(); // still generate without image
    };
  } else {
    addBuyerSection();
  }

  function addBuyerSection() {
    y += 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text("Buyer Details", startX, y);
    doc.line(startX, y + 2, 190, y + 2);
    y += 10;

    const buyer = buyerData || order.buyerId || {};
    const buyerDetails = [
      { label: "Name", value: buyer.name || "Unknown" },
      { label: "Email", value: buyer.email || order.customer_email || "Unknown" },
      { label: "Phone", value: buyer.phoneNumber || "Unknown" },
      { label: "Address", value: buyer.address || "Unknown" }
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setFillColor(lightGray);
    doc.rect(startX, y - 3, 170, 8 * buyerDetails.length + 4, "F");

    buyerDetails.forEach((item, i) => {
      doc.text(`${item.label}:`, startX + 5, y + 8 * i + 4);
      doc.text(item.value, startX + 40, y + 8 * i + 4);
    });

    y += 8 * buyerDetails.length + 10;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor("#808080");
    doc.text("Thank you for shopping with OLX!", startX, y);
    doc.text("For any queries, contact support@olx.com", startX, y + 8);

    doc.save(`invoice_${order.billDetails?.invoiceId || "unknown"}.pdf`);
  }
};
  const filteredOrders = orders.filter((order) => order.status === activeTab);

  if (!buyer) return <BuyerSkeleton />;


  // Handle /orders route (no product ID)
  if (!id) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-gray-200">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'accepted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected
            </button>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="text-gray-600 text-center">No {activeTab} orders found. Start shopping to place an order!</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order: any) => (
                <div key={order._id} className="border-b py-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={order.productId.imageURL}
                      alt={order.productId.title}
                      className="w-full sm:w-1/4 h-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-medium">{order.productId.title}</p>
                      <p className="text-sm text-gray-600">Price: ₹ {order.productId.price}</p>
                      <p className="text-sm text-gray-600">Seller: {order.sellerId.name}</p>
                      <p
                        className={`text-sm font-medium ${order.status === 'accepted'
                          ? 'text-green-600'
                          : order.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                          }`}
                      >
                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                      {order.status === 'accepted' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => navigate(`/order/${order.productId._id}`)}
                          className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition"
                        >
                          Proceed to Payment
                        </button>
                      )}
                      {order.paymentStatus === 'completed' && (
                        <button
                          onClick={() => generateBill(order, buyer)}
                          className="mt-2 bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 transition"
                        >
                          Download Bill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Existing logic for /order/:id
  const currentOrder = orders.find((order) => order.productId._id === id);

  if (!product) return <ProductSkeleton />;


  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Details</h1>

      {currentOrder ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p
            className={`text-xl font-semibold ${currentOrder.status === 'accepted'
              ? 'text-green-600'
              : currentOrder.status === 'rejected'
                ? 'text-red-600'
                : 'text-yellow-600'
              }`}
          >
            Your order is {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
          </p>
          {currentOrder.status === 'accepted' && currentOrder.paymentStatus === 'pending' && (
            <button
              onClick={handleProceedToPayment}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Proceed to Payment
            </button>
          )}
          {currentOrder.paymentStatus === 'completed' && (
            <button
              onClick={() => generateBill(currentOrder, buyer)}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
            >
              Download Bill
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Details</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src={product.imageURL}
                alt={product.title}
                className="w-full sm:w-1/3 h-48 object-cover rounded-md"
              />
              <div className="space-y-2">
                <p className="text-lg font-medium">{product.title}</p>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-xl font-semibold text-blue-600">₹ {product.price}</p>
                <p className="text-sm text-gray-500">Category: {product.category}</p>
                <p className="text-sm text-gray-500">Seller: {product.sellerId?.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {buyer.name || 'Unknown'}</p>
              <p><span className="font-medium">Email:</span> {buyer.email || 'Unknown'}</p>
              <p><span className="font-medium">Phone:</span> {buyer.phoneNumber || 'Unknown'}</p>
              <p><span className="font-medium">Address:</span> {buyer.address || 'Unknown'}</p>
            </div>
            {role !== 'seller' && !product.isSold && (
              <button
                onClick={handlePlaceOrder}
                disabled={loading} // 🧊 Disable while loading
                className={`mt-4 px-6 py-2 rounded-md transition ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
              >
                {loading ? 'Processing...' : 'Place Order Request'}
              </button>
            )}
            {product.isSold && (
              <p className="mt-4 text-red-600 font-medium">This product is already sold</p>
            )}
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Details</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Product: {product.title}</p>
                <p>Price: ₹ {product.price}</p>
                <p>Seller: {product.sellerId?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading} // 🧊 Prevent multiple checkout
                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Redirecting...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mb-6 mt-3 justify-end bg-black text-white px-6 py-2 rounded-md"
      >
        {showHistory ? 'Hide Order History' : 'Show Order History'}
      </button>

      {showHistory && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Order History</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-gray-200">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'accepted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected
            </button>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="text-gray-600">No {activeTab} orders found</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order: any) => (
                <div key={order._id} className="border-b py-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={order.productId.imageURL}
                      alt={order.productId.title}
                      className="w-full sm:w-1/4 h-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-medium">{order.productId.title}</p>
                      <p className="text-sm text-gray-600">Price: ₹ {order.productId.price}</p>
                      <p className="text-sm text-gray-600">Seller: {order.sellerId.name}</p>
                      <p
                        className={`text-sm font-medium ${order.status === 'accepted'
                          ? 'text-green-600'
                          : order.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                          }`}
                      >
                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                      {order.status === 'accepted' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => !loading && handleProceedToPayment()} 
                          disabled={loading}
                          className={`mt-2 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {loading ? 'Loading...' : 'Proceed to Payment'}
                        </button>
                      )}
                      {order.paymentStatus === 'completed' && (
                        <button
                          onClick={() => generateBill(order, buyer)}
                          className="mt-2 bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 transition"
                        >
                          Download Bill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderPage;