
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // const name = localStorage.getItem('username');
  // const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="text-xl font-bold text-blue-600">OLX </Link>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* admin navbar */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/" className="hover:text-blue-600">Products</Link>
          {role === 'admin' && (
            <>
              <Link to="/" className="hover:text-blue-600">Users</Link>
              <Link to="/" className="hover:text-blue-600">Statistics</Link>
            </>
          )}

          {role == 'buyer' && (
            <Link to="/" className="hover:text-blue-600">order</Link>

            )}

          {role === 'seller' && (
            <>
              <Link to="/" className="hover:text-blue-600">Add Product</Link>
              <Link to="/" className="hover:text-blue-600">Manage Product</Link>
            </>
          )}


          {token ? (
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">Login</Link>
              <Link to="/register" className="hover:text-blue-600">Register</Link>
            </>
          )}


        </div>
      </div>

      {/* Mobile Menu */}
      
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          <Link to="/" className="block hover:text-blue-600">Home</Link>
          <Link to="/" className="hover:text-blue-600">Products</Link>
          {role === 'admin' && (
            <>
              <Link to="/" className="block hover:text-blue-600">Users</Link>
              <Link to="/admin/stats" className="hover:text-blue-600">Statistics</Link>
            </>
          )}

          {role == 'buyer' && (
            <Link to="/" className="hover:text-blue-600">order</Link>
            )}

            {role === 'seller' && (
            <>
              <Link to="/" className="hover:text-blue-600">Add Product</Link>
              <Link to="/" className="hover:text-blue-600">Manage Product</Link>
            </>
          )}

          {token ? (
            <>
            <Link to="/admin/products" className="block hover:text-blue-600">Products</Link>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-blue-600">Login</Link>
              <Link to="/register" className="block hover:text-blue-600">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

