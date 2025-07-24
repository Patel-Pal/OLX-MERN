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

export default function AppRoutes() {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const location = useLocation();

  // Paths where you want to hide header/footer
  const hideLayout = location.pathname === '/not-found';

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/add-product' element={role == "seller" ? <AddProduct /> : <Navigate to={"/not-found"} />} />


        <Route path="/chat/:productId/:buyerId/:sellerId" element={token ? <ChatPage /> : <Navigate to={"/login"} />} />

        <Route path="/manage-orders" element={role === 'seller' ? <ManageOrders /> : <Navigate to={"/not-found"} />} />
        <Route path="/order/:id" element={token ? <OrderPage /> : <Navigate to={"/login"} />} />
        <Route path="/orders" element={token && role === 'buyer' ? <OrderPage /> : <Navigate to={"/login"} />} />

        {/*  Admin Routes */}
        <Route path="/statistics" element={role === 'admin' ? <AdminStatistictics /> : <Navigate to={"/not-found"} />} />
        <Route path="/graph" element={role === 'admin' ? <AdminAnalytics /> : <Navigate to={"/not-found"} />} />


        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />


        <Route path="/not-found" element={<NotFound />} />
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}
