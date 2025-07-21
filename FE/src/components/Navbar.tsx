import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const name = sessionStorage.getItem('username') || 'John Doe';
  const email = sessionStorage.getItem('email') || 'john@example.com';
  const role = sessionStorage.getItem('role') || 'buyer';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleProfile = () => setShowProfile(prev => !prev);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="text-xl font-bold text-blue-600">OLX</Link>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl text-gray-700">
            ☰
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/all-products" className="hover:text-blue-600">Products</Link>

          {role === 'admin' && <Link to="/statistics" className="hover:text-blue-600">Statistics</Link>}
          {role === 'buyer' && <Link to="/orders" className="hover:text-blue-600">Orders</Link>}
          {role === 'seller' && (
            <>
              <Link to="/add-product" className="hover:text-blue-600">Add Product</Link>
              <Link to="/manage-product" className="hover:text-blue-600">Manage Product</Link>
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

          {/* Profile Icon */}
          {token && (
          <div className="relative">
            <button onClick={toggleProfile}>
              <FaUserCircle className="text-3xl text-gray-700 hover:text-blue-600 transition" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Profile</h3>
                <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {name}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {email}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> {role}</p>
                <button
                  className="mt-4 w-full bg-black text-white py-1 rounded hover:bg-red-600 transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/" className="block hover:text-blue-600">Home</Link>
          <Link to="/all-products" className="block hover:text-blue-600">Products</Link>

          {role === 'admin' && <Link to="/statistics" className="block hover:text-blue-600">Statistics</Link>}
          {role === 'buyer' && <Link to="/orders" className="block hover:text-blue-600">Orders</Link>}
          {role === 'seller' && (
            <>
              <Link to="/add-product" className="block hover:text-blue-600">Add Product</Link>
              <Link to="/manage-product" className="block hover:text-blue-600">Manage Product</Link>
            </>
          )}

          {token ? (
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
          ) : (
            <>
              <Link to="/login" className="block hover:text-blue-600">Login</Link>
              <Link to="/register" className="block hover:text-blue-600">Register</Link>
            </>
          )}

          {/* Profile Section in Mobile Menu */}
          {token && (
          <div className="mt-4 border-t pt-2">
            <div className="flex items-center space-x-2">
              <FaUserCircle className="text-2xl text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="text-xs text-gray-500">{email}</p>
                <button
                  className=" mt-1 w-full bg-black text-white  rounded"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
