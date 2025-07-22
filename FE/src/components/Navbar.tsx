import { useState  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';



const Navbar = () => {
  const {  logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const role = sessionStorage.getItem('role') || '';
  const name = sessionStorage.getItem('username') || ''; 
  const email = sessionStorage.getItem('email') || '';  
  const token = sessionStorage.getItem('token');


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

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/all-products" className="hover:text-blue-600">Products</Link>

          {token && role === 'admin' && <Link to="/Statistics" className="hover:text-blue-600">Statistics</Link>}
          {token && role === 'buyer' && <Link to="/orders" className="hover:text-blue-600">Orders</Link>}
          {token && role === 'seller' && (
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

          {/* Profile */}
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
                  {/* <button onClick={() => setShowEditPopup(true)}
                    className="mt-4 w-full bg-black text-white py-1 rounded hover:bg-red-600 transition">
                    Edit Profile
                  </button> */}
                </div>
              )}
            </div>
          )}

          {/* {showEditPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-80">
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <input
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Name"
                  />
                  <input
                    value={editData.email}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
                  />
                  <select
                    name="role"
                    value={editData.role}
                    className="w-full px-3 py-2 border rounded cursor-not-allowed"
                    disabled
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowEditPopup(false)} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )} */}
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
                  {/* <button className="mt-1 w-full bg-black text-white rounded" onClick={() => setShowEditPopup(true)}>Edit Profile</button> */}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* {showEditPopup && (
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
              <select
                name="role"
                value={editData.role}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed text-sm"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
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
      )} */}

    </nav>
  );
};

export default Navbar;
