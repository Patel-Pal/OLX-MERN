import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState({
    name: sessionStorage.getItem('username') || '',
    email: sessionStorage.getItem('email') || '',
    phoneNumber: sessionStorage.getItem('phoneNumber') || '',
    address: sessionStorage.getItem('address') || '',
  });

  const role = sessionStorage.getItem('role') || '';
  const name = sessionStorage.getItem('username') || '';
  const email = sessionStorage.getItem('email') || '';
  const token = sessionStorage.getItem('token');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleProfile = () => setShowProfile(prev => !prev);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          phoneNumber: editData.phoneNumber,
          address: editData.address,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('username', editData.name);
        sessionStorage.setItem('phoneNumber', editData.phoneNumber);
        sessionStorage.setItem('address', editData.address);
        setShowEditPopup(false);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="text-xl font-bold text-blue-600">OLX</Link>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl text-gray-700">
            ☰
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {role !== 'admin' && (
            <>
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <Link to="/all-products" className="hover:text-blue-600">Products</Link>
            </>
          )}
          {token && role === 'admin' && <Link to="/Statistics" className="hover:text-blue-600">Statistics</Link>}
          {token && role === 'buyer' && <Link to="/orders" className="hover:text-blue-600">Orders</Link>}
          {token && role === 'seller' && (
            <>
              <Link to="/add-product" className="hover:text-blue-600">Add Product</Link>
              <Link to="/manage-product" className="hover:text-blue-600">Manage Orders</Link>
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
                  <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {editData.phoneNumber}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Address:</span> {editData.address}</p>
                  <button onClick={() => setShowEditPopup(true)}
                    className="mt-4 w-full bg-black text-white py-1 rounded hover:bg-red-600 transition">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/" className="block hover:text-blue-600">Home</Link>
          <Link to="/all-products" className="block hover:text-blue-600">Products</Link>

          {token && role === 'admin' && <Link to="/Statistics" className="block hover:text-blue-600">Statistics</Link>}
          {token && role === 'buyer' && <Link to="/orders" className="block hover:text-blue-600">Orders</Link>}
          {token && role === 'seller' && (
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

          {token && (
            <div className="mt-4 border-t pt-2">
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-2xl text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{name}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                  <p className="text-xs text-gray-500">{editData.phoneNumber}</p>
                  <p className="text-xs text-gray-500">{editData.address}</p>
                  <button className="mt-1 w-full bg-black text-white rounded" onClick={() => setShowEditPopup(true)}>Edit Profile</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:w-96">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Name"
              />
              <input
                value={editData.email}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed text-sm"
              />
              <input
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Phone Number"
              />
              <input
                name="address"
                value={editData.address}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Address"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  className="px-4 py-1 bg-gray-300 text-sm rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;