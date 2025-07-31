import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';
import AddProduct from '../pages/seller/AddProduct';
import AllProducts from '../pages/users/Allproducts';
import ProductDetails from '../pages/users/ProductDetails';
import AdminStatistictics from '../pages/admin/AdminStatistictics';
import ChatPage from '../pages/ChatPage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NotFound from '../pages/NotFound';
import ManageOrders from '../pages/seller/ManageOrders';
import OrderPage from '../pages/users/OrderPage';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminBuyers from '../pages/admin/BuyersDetail';
import AdminSellers from '../pages/admin/SellerDetails';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

export default function AppRoutes() {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const location = useLocation();

  // Paths where you want to hide header/footer
  const hideLayout = location.pathname === '/not-found';
  const forgerpass = location.pathname === '/forgot-password';
  const resetpass = location.pathname === '/reset-password';
  const chatPath = location.pathname.startsWith('/chat/');

  return (
    <>
      {!hideLayout && !chatPath && !resetpass && !forgerpass && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path='/product/:id' element={<ProductDetails />} />

        {/* Seller Routes */}
        <Route path='/add-product' element={role == "seller" ? <AddProduct /> : <Navigate to={"/not-found"} />} />
        <Route path="/manage-orders" element={role === 'seller' ? <ManageOrders /> : <Navigate to={"/not-found"} />} />

        {/*  Admin Routes */}
        <Route path="/statistics" element={role === 'admin' ? <AdminStatistictics /> : <Navigate to={"/not-found"} />} />
        <Route path="/graph" element={role === 'admin' ? <AdminAnalytics /> : <Navigate to={"/not-found"} />} />
        <Route path="/buyers-detail" element={role === 'admin' ? <AdminBuyers /> : <Navigate to={"/not-found"} />} />
        <Route path="/sellers-detail" element={role === 'admin' ? <AdminSellers /> : <Navigate to={"/not-found"} />} />

        {/* Common Routes */}
        <Route path="/order/:id" element={token ? <OrderPage /> : <Navigate to={"/login"} />} />
        <Route path="/orders" element={token && role === 'buyer' ? <OrderPage /> : <Navigate to={"/login"} />} />
        <Route path="/chat/:productId/:buyerId/:sellerId" element={token ? <ChatPage /> : <Navigate to={"/login"} />} />

        {/* Authentication Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword/>} />

        <Route path="/not-found" element={<NotFound />} />
      </Routes>
      {!hideLayout && !chatPath && !resetpass && !forgerpass && <Footer />}
    </>
  );
}
