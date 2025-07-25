import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {  ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';

interface BuyerStats {
  totalBuyers: number;
  totalRevenue: number;
}

interface Buyer {
  _id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  totalProducts: number;
  totalSpent: number;
  products: {
    _id: string;
    title: string;
    price: number;
    category: string;
    purchaseDate: Date;
  }[];
}

const AdminBuyers: React.FC = () => {
  const [stats, setStats] = useState<BuyerStats>({ totalBuyers: 0, totalRevenue: 0 });
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBuyer, setExpandedBuyer] = useState<string | null>(null);
  const itemsPerPage = 10;
  const token = sessionStorage.getItem('token');

  const fetchBuyerData = async () => {
    try {
      const res = await axiosInstance.get('/admin/buyers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuyers(res.data.buyers);
      setStats({ totalBuyers: res.data.totalBuyers, totalRevenue: res.data.totalRevenue });
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to fetch buyer data');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await axiosInstance.put(`/admin/user/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBuyerData();
      toast.success('Buyer status updated successfully');
    } catch (err) {
      toast.error('Failed to update buyer status');
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const totalPages = Math.ceil(buyers.length / itemsPerPage);
  const paginatedData = buyers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpand = (buyerId: string) => {
    // console.log('Toggling expand for buyer:', buyerId);
    setExpandedBuyer(expandedBuyer === buyerId ? null : buyerId);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Buyers Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Card label="Total Buyers" count={stats.totalBuyers} />
        <Card label="Total Revenue" count={stats.totalRevenue} prefix="₹" />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Buyers List</h2>

        <table className="w-full min-w-[800px] table-auto border text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left">Sr No</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Address</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Total Products</th>
              <th className="py-2 px-4 text-left">Total Spent</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((buyer, index) => (
              <React.Fragment key={buyer._id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 font-semibold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-2 px-4 text-center ">
                    <button
                      className="text-indigo-600 hover:underline"
                      onClick={() => toggleExpand(buyer._id)}
                    >
                      {buyer.name}
                    </button>
                  </td>
                  <td className="py-2 px-4">{buyer.email}</td>
                  <td className="py-2 px-4">{buyer.address}</td>
                  <td className="py-2 px-4">{buyer.phoneNumber}</td>
                  <td className="py-2 px-4">{buyer.totalProducts}</td>
                  <td className="py-2 px-4">₹{buyer.totalSpent}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs ${
                        buyer.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {buyer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => toggleStatus(buyer._id)}>
                      {buyer.isActive ? (
                        <ToggleRight className="text-green-500" />
                      ) : (
                        <ToggleLeft className="text-red-500" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedBuyer === buyer._id && buyer.totalProducts > 0 && (
                  <tr className="border-t">
                    <td colSpan={9} className="py-2 px-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-semibold mb-2">Purchased Products</h3>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-200 text-gray-700">
                              <th className="py-1 px-2 text-left">Title</th>
                              <th className="py-1 px-2 text-left">Category</th>
                              <th className="py-1 px-2 text-left">Price</th>
                              <th className="py-1 px-2 text-left">Purchase Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {buyer.products.map((product) => (
                              <tr key={product._id} className="border-t">
                                <td className="py-1 px-2">{product.title}</td>
                                <td className="py-1 px-2">{product.category}</td>
                                <td className="py-1 px-2">₹{product.price}</td>
                                <td className="py-1 px-2">
                                  {new Date(product.purchaseDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? 'bg-indigo-500 text-white' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CardProps {
  label: string;
  count: number;
  prefix?: string;
}

const Card: React.FC<CardProps> = ({ label, count, prefix = '' }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition">
    <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
    <p className="text-3xl font-bold text-indigo-600 mt-2">{prefix}{count}</p>
  </div>
);

export default AdminBuyers;