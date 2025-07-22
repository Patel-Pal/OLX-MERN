import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalBuyers: number;
  totalSellers: number;
}

interface Product {
  _id: string;
  title: string;
  category: string;
  isSold: boolean;
  sellerId?: {
    name?: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
}

type ViewType = 'products' | 'buyer' | 'seller' | null;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalBuyers: 0,
    totalSellers: 0,
  });
  const [view, setView] = useState<ViewType>(null);
  const [tableData, setTableData] = useState<(Product | User)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = sessionStorage.getItem('token');

  const fetchStats = async () => {
    const res = await axios.get<Stats>('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(res.data);
  };

  const fetchTable = async (type: ViewType) => {
    if (!type) return;
    const url = type === 'products'
      ? 'products'
      : `users/${type}`;
    const res = await axios.get<(Product | User)[]>(`http://localhost:5000/api/admin/${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTableData(res.data);
    setCurrentPage(1); // Reset to first page
    setView(type);
  };

  const deleteItem = async (type: 'products' | 'users', id: string) => {
    // const confirmed = window.confirm('Are you sure you want to delete this item?');
    // if (!confirmed) return;

    const url = type === 'products'
      ? `product/${id}`
      : `user/${id}`;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (view) fetchTable(view);
      fetchStats();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete');
    }
  };


  const toggleStatus = async (type: 'products' | 'users', id: string) => {
    const url = type === 'products'
      ? `product/${id}/toggle`
      : `user/${id}/toggle`;
    await axios.put(`http://localhost:5000/api/admin/${url}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (view) fetchTable(view);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card label="Total Products" count={stats.totalProducts} onClick={() => fetchTable('products')} />
        <Card label="Total Buyers" count={stats.totalBuyers} onClick={() => fetchTable('buyer')} />
        <Card label="Total Sellers" count={stats.totalSellers} onClick={() => fetchTable('seller')} />
      </div>

      {view && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 capitalize">Showing {view}</h2>

          <table className="w-full min-w-[800px] table-auto border text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">Sr No</th>
                {view === 'products' ? (
                  <>
                    <th className="py-2 px-4 text-left">Title</th>
                    <th className="py-2 px-4 text-left">Category</th>
                    <th className="py-2 px-4 text-left">Seller</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Action</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Address</th>
                    <th className="py-2 px-4 text-left">Mno</th>
                    <th className="py-2 px-4 text-left">Role</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Action</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 font-semibold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  {view === 'products' ? (
                    <>
                      <td className="py-2 px-4">{(item as Product).title}</td>
                      <td className="py-2 px-4">{(item as Product).category}</td>
                      <td className="py-2 px-4">{(item as Product).sellerId?.name || '-'}</td>
                      <td className="py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs ${(item as Product).isSold ? 'bg-red-500' : 'bg-green-500'}`}>
                          {(item as Product).isSold ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleStatus('products', item._id)}>
                            {(item as Product).isSold
                              ? <ToggleLeft className="text-red-500" />
                              : <ToggleRight className="text-green-500" />}
                          </button>

                          <button onClick={() => deleteItem('products', item._id)}>
                            <Trash2 className="text-gray-500 hover:text-red-600" />
                          </button>
                        </div>
                      </td>

                    </>
                  ) : (
                    <>
                      <td className="py-2 px-4">{(item as User).name}</td>
                      <td className="py-2 px-4">{(item as User).email}</td>
                      <td className="py-2 px-4">{(item as User).address}</td>
                      <td className="py-2 px-4">{(item as User).phoneNumber}</td>
                      <td className="py-2 px-4 capitalize">{(item as User).role}</td>
                      <td className="py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs ${(item as User).isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                          {(item as User).isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button onClick={() => toggleStatus('users', item._id)}>
                          {(item as User).isActive ? <ToggleRight className="text-green-500" /> : <ToggleLeft className="text-red-500" />}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination UI */}
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
                  className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-indigo-500 text-white' : ''}`}
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
      )}
    </div>
  );
};

interface CardProps {
  label: string;
  count: number;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ label, count, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
  >
    <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
    <p className="text-3xl font-bold text-indigo-600 mt-2">{count}</p>
  </div>
);

export default AdminDashboard;
