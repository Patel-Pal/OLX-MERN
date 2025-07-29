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
    }
  };

  //pdf generation function 
  const generateBill = (order: any, buyerData: any) => {
    const doc = new jsPDF();
    
    // Set font and colors
    doc.setFont("helvetica", "normal");
    const primaryColor = "#1E90FF"; // Blue for headers
    const textColor = "#333333"; // Dark gray for text

    // Header Section
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, "F"); // Header background
    doc.setFontSize(24);
    doc.setTextColor("#FFFFFF"); // White text for header
    doc.setFont("helvetica", "bold");
    doc.text("OLX Invoice", 20, 25);
    
    // Invoice Details Section
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 20, 50);
    
    doc.setDrawColor("#D3D3D3"); // Light gray for lines
    doc.line(20, 52, 190, 52); // Underline for section title
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const invoiceDetails = [
      `Invoice ID: ${order.billDetails?.invoiceId || "N/A"}`,
      `Invoice Date: ${
        order.billDetails?.paymentDate
          ? new Date(order.billDetails.paymentDate).toLocaleDateString()
          : "N/A"
      }`,
      `Order Status: ${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "N/A"}`,
    ];
    
    let yPos = 60;
    invoiceDetails.forEach((line) => {
      // Ensure line is a valid string
      const validLine = typeof line === "string" ? line : "N/A";
      doc.text(validLine, 20, yPos);
      yPos += 8;
    });

    // Product Details Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Product Details", 20, yPos + 10);
    doc.line(20, yPos + 12, 190, yPos + 12); // Underline
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 20;
    const productDetails = [
      { label: "Product", value: order.productId?.title || "N/A" },
      { label: "Price", value: order.billDetails ? `${order.billDetails.currency} ${order.billDetails.amount}` : "N/A" },
    ];
    
    // Table-like structure for product details
    doc.setFillColor("#F5F5F5"); // Light gray background for table
    doc.rect(20, yPos - 2, 170, 8 * productDetails.length + 4, "F");
    productDetails.forEach((item, index) => {
      const validLabel = typeof item.label === "string" ? item.label : "N/A";
      const validValue = typeof item.value === "string" ? item.value : "N/A";
      doc.text(validLabel, 25, yPos + 8 * index + 4);
      doc.text(":", 65, yPos + 8 * index + 4);
      doc.text(validValue, 70, yPos + 8 * index + 4);
    });
    yPos += 8 * productDetails.length + 10;

    // Buyer Details Section
    const buyerInfo = buyerData || order.buyerId || {};
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Buyer Details", 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2); // Underline
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 10;
    const buyerDetails = [
      { label: "Name", value: buyerInfo.name || "Unknown" },
      { label: "Email", value: buyerInfo.email || order.customer_email || "Unknown" },
      { label: "Phone", value: buyerInfo.phoneNumber || "Unknown" },
      { label: "Address", value: buyerInfo.address || "Unknown" },
    ];
    
    // Table-like structure for buyer details
    doc.setFillColor("#F5F5F5"); // Light gray background for table
    doc.rect(20, yPos - 2, 170, 8 * buyerDetails.length + 4, "F");
    buyerDetails.forEach((item, index) => {
      const validLabel = typeof item.label === "string" ? item.label : "N/A";
      const validValue = typeof item.value === "string" ? item.value : "N/A";
      doc.text(validLabel, 25, yPos + 8 * index + 4);
      doc.text(":", 65, yPos + 8 * index + 4);
      doc.text(validValue, 70, yPos + 8 * index + 4);
    });
    yPos += 8 * buyerDetails.length + 10;

    // Footer Section
    doc.setFontSize(10);
    doc.setTextColor("#808080"); // Gray for footer
    doc.text("Thank you for shopping with OLX!", 20, yPos);
    doc.text("For any queries, contact support@olx.com", 20, yPos + 8);
    
    // Save the PDF
    doc.save(`invoice_${order.billDetails?.invoiceId || "unknown"}.pdf`);
  };

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  if (!buyer) return <p className="text-center mt-10">Loading...</p>;

  // Handle /orders route (no product ID)
  if (!id) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-gray-200">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'accepted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
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
                        className={`text-sm font-medium ${
                          order.status === 'accepted'
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

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Details</h1>

      {currentOrder ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p
            className={`text-xl font-semibold ${
              currentOrder.status === 'accepted'
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
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Place Order Request
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Continue to Payment
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
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'accepted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
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
                        className={`text-sm font-medium ${
                          order.status === 'accepted'
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
                          onClick={handleProceedToPayment}
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
      )}
    </div>
  );
};

export default OrderPage;