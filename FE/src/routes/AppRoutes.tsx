import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';
import AddProduct from '../pages/seller/AddProduct';
import AllProducts from '../pages/users/Allproducts';
import ProductDetails from '../pages/users/ProductDetails';
import AdminStatistictics from '../pages/admin/AdminStatistictics';

export default function AppRoutes() {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  return (
    <Routes>
      <Route path="/" element={<Home /> } />
      <Route path="/all-products" element={<AllProducts />} />
      <Route
        path="/"
        element={token ? <Home /> : <Navigate to="/login" replace />}
      />  
      <Route path='/add-product'  element={role=="seller" ? <AddProduct /> : <Home />} />
      <Route path='/product/:id' element={<ProductDetails />} />
   
      <Route path="/statistics" element={role === 'admin' ? <AdminStatistictics /> : <Navigate to="/" replace />} />


      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
