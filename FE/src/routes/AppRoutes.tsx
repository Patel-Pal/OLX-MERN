import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';

export default function AppRoutes() {
  const token = sessionStorage.getItem('token');

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Home /> : <Navigate to="/login" replace />}
      />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
