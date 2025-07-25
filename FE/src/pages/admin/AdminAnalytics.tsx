import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Stats {
  totalProducts: number;
  totalBuyers: number;
  totalSellers: number;
  totalRevenue: number;
}

interface SoldOrder {
  _id: string;
  productId: { title: string; price: number };
  billDetails: { amount: number; paymentDate: Date };
}

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalRevenue: 0,
  });
  const [soldOrders, setSoldOrders] = useState<SoldOrder[]>([]);
  const token = sessionStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get<Stats>('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to fetch analytics data');
    }
  };

  const fetchSoldOrders = async () => {
    try {
      const res = await axiosInstance.get<SoldOrder[]>('/admin/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSoldOrders(res.data);
    } catch (err) {
      toast.error('Failed to fetch revenue data');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSoldOrders();
  }, []);

  // Prepare data for charts
  const overviewData = {
    labels: ['Products', 'Buyers', 'Sellers'],
    datasets: [{
      label: 'Counts',
      data: [stats.totalProducts, stats.totalBuyers, stats.totalSellers],
      backgroundColor: ['#4f46e5', '#10b981', '#f97316'],
    }]
  };

  // Revenue by month
  const monthlyRevenue = soldOrders.reduce((acc, order) => {
    const month = new Date(order.billDetails.paymentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + order.billDetails.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [{
      label: 'Revenue (₹)',
      data: Object.values(monthlyRevenue),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      fill: true,
    }]
  };

  // Top products by revenue
  const productRevenue = soldOrders.reduce((acc, order) => {
    const title = order.productId?.title;
    acc[title] = (acc[title] || 0) + order.billDetails.amount;
    return acc;
  }, {} as Record<string, number>);

  const topProductsData = {
    labels: Object.keys(productRevenue).slice(0, 5),
    datasets: [{
      label: 'Revenue (₹)',
      data: Object.values(productRevenue).slice(0, 5),
      backgroundColor: ['#4f46e5', '#10b981', '#f97316', '#ef4444', '#8b5cf6'],
    }]
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <Bar
            data={overviewData}
            options={{
              plugins: { title: { display: true, text: 'Platform Overview' } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <Line
            data={revenueData}
            options={{
              plugins: { title: { display: true, text: 'Revenue Trend' } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Products by Revenue</h2>
          <Pie
            data={topProductsData}
            options={{
              plugins: { title: { display: true, text: 'Top 5 Products' } }
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-indigo-600">₹{stats.totalRevenue}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">{soldOrders.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;