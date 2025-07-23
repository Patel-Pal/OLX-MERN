import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();
  const buyerId = sessionStorage.getItem('userId');
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/product_desc/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      }
    };

    const fetchBuyer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/profile`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        setBuyer(res.data);
      } catch (error: any) {
        console.error('Error fetching buyer:', error);
        toast.error(error.response?.data?.message || 'Failed to load buyer details');
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/buyer`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        setOrders(res.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      }
    };

    if (!buyerId) {
      navigate('/login');
      return;
    }
    fetchProduct();
    fetchBuyer();
    fetchOrders();
  }, [id, buyerId, navigate]);

  const handlePlaceOrder = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/create`,
        { productId: id },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      toast.success(res.data.message);
      const ordersRes = await axios.get(`http://localhost:5000/api/orders/buyer`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      setOrders(ordersRes.data.orders);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const filteredOrders = orders.filter((order) => order.status === activeTab);
  const currentOrder = orders.find((order) => order.productId._id === id);

  if (!product || !buyer) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Details</h1>

      {/* Display only status if an order exists for the product */}
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Buyer Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {buyer.name}</p>
              <p><span className="font-medium">Email:</span> {buyer.email}</p>
              <p><span className="font-medium">Phone:</span> {buyer.phoneNumber}</p>
              <p><span className="font-medium">Address:</span> {buyer.address}</p>
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

      {/* Order History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mb-6 mt-3 justify-end  bg-black text-white px-6 py-2 rounded-md"
      >
        {showHistory ? 'Hide Order History' : 'Show Order History'}
      </button>

      {/* Order History Sections */}
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