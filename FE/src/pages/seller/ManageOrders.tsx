import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ManageOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    if (role !== 'seller') {
      toast.error('Unauthorized access');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get(`/orders/seller`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        setOrders(res.data.orders);
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        toast.error('Failed to load orders');
      }
    };

    fetchOrders();
  }, [role]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await axiosInstance.put(
        `/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      toast.success(res.data.message);
      const ordersRes = await axiosInstance.get(`/orders/seller`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      setOrders(ordersRes.data.orders);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(
    (order) => (activeTab === 'sold' ? order.paymentStatus === 'completed' : order.status === activeTab)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Orders</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Requests</h2>
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
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'sold' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('sold')}
          >
            Sold Products
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
                    <p className="text-sm text-gray-600">Buyer: {order.buyerId.name} ({order.buyerId.email})</p>
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
                    {order.paymentStatus && (
                      <p
                        className={`text-sm font-medium ${
                          order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}
                      >
                        Payment Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </p>
                    )}
                    {order.status === 'pending' && (
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'accepted')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
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
};

export default ManageOrders;