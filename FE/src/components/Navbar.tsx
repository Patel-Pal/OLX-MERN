import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  phoneNumber: string;
  address: string;
  profileImage?: string;
}

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    phoneNumber: '',
    address: '',
    profileImage: '',
  });
  const [editData, setEditData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    profileImage: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const token = sessionStorage.getItem('token');

  // Decode token and fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // Decode token as initial data
      try {
        const decoded: JwtPayload = jwtDecode(token);
        setProfileData({
          name: decoded.name || '',
          email: decoded.email || '',
          role: decoded.role || '',
          phoneNumber: decoded.phoneNumber || '',
          address: decoded.address || '',
          profileImage: decoded.profileImage || '',
        });
        setEditData({
          name: decoded.name || '',
          phoneNumber: decoded.phoneNumber || '',
          address: decoded.address || '',
          profileImage: null,
        });
      } catch (err) {
        setError('Failed to decode token. Please log in again.');
        console.error('Token decode error:', err);
        return;
      }

      // Fetch latest profile data from API using axiosInstance
      setLoading(true);
      try {
        const response = await axiosInstance.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          profileImage: data.profileImage || '',
        });
        setEditData({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          profileImage: null,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Using token data.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfileData();
  }, [token]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const toggleProfile = () => setShowProfile((prev) => !prev);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profileImage') {
      const file = e.target.files?.[0] || null;
      console.log('Selected file:', file); // Debug: Log selected file
      setEditData({ ...editData, profileImage: file });
    } else {
      setEditData({ ...editData, [e.target.name]: e.target.value });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!editData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!editData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!/^\d{10}$/.test(editData.phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (!editData.address.trim()) {
      setError('Address is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('phoneNumber', editData.phoneNumber);
      formData.append('address', editData.address);
      if (editData.profileImage) {
        console.log('Appending file to FormData:', editData.profileImage); // Debug: Log file before sending
        formData.append('profileImage', editData.profileImage);
      }

      const response = await axiosInstance.put('/auth/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log('Profile update response:', data); // Debug: Log response
      setProfileData((prev) => ({
        ...prev,
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        profileImage: data.profileImage || prev.profileImage,
      }));
      setEditData({
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        profileImage: null,
      });
      setSuccess('Profile updated successfully');
      setTimeout(() => {
        setShowEditPopup(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again later.');
      console.error('Error updating profile:', err.response?.data || err);
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
          {profileData.role !== 'admin' && (
            <>
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <Link to="/all-products" className="hover:text-blue-600">Products</Link>
            </>
          )}
          {token && profileData.role === 'admin' && (
            <>
              <Link to="/statistics" className="hover:text-blue-600">Dashboard</Link>
              <Link to="/graph" className="hover:text-blue-600">Graph's</Link>
              <Link to="/sellers-detail" className="block hover:text-blue-600">Seller's detail</Link>
              <Link to="/buyers-detail" className="block hover:text-blue-600">Buyyer's detail</Link>
            </>
          )}
          {token && profileData.role === 'buyer' && (
            <Link to="/orders" className="hover:text-blue-600">Orders</Link>
          )}
          {token && profileData.role === 'seller' && (
            <>
              <Link to="/add-product" className="hover:text-blue-600">Add Product</Link>
              <Link to="/manage-orders" className="hover:text-blue-600">Manage Orders</Link>
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
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-700 hover:text-blue-600 transition" />
                )}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Profile</h3>
                  {loading ? (
                    <p className="text-sm text-gray-600">Loading profile...</p>
                  ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : (
                    <>
                      {profileData.profileImage && (
                        <img
                          src={profileData.profileImage}
                          alt="Profile"
                          className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                        />
                      )}
                      <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {profileData.name}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {profileData.email}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> {profileData.role}</p>
                    </>
                  )}
                  <button
                    onClick={() => setShowEditPopup(true)}
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

      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/" className="block hover:text-blue-600">Home</Link>
          <Link to="/all-products" className="block hover:text-blue-600">Products</Link>

          {token && profileData.role === 'admin' && (
            <>
              <Link to="/statistics" className="hover:text-blue-600">Dashboard</Link>
              <Link to="/graph" className="block hover:text-blue-600">Graph's</Link>
              <Link to="/sellers-detail" className="block hover:text-blue-600">Seller's detail</Link>
              <Link to="/buyers-detail" className="block hover:text-blue-600">Buyyer's detail</Link>
            </>
          )}
          {token && profileData.role === 'buyer' && (
            <Link to="/orders" className="block hover:text-blue-600">Orders</Link>
          )}
          {token && profileData.role === 'seller' && (
            <>
              <Link to="/add-product" className="block hover:text-blue-600">Add Product</Link>
              <Link to="/manage-orders" className="block hover:text-blue-600">Manage Orders</Link>
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
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-600" />
                )}
                <div>
                  {loading ? (
                    <p className="text-sm text-gray-600">Loading profile...</p>
                  ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">{profileData.name}</p>
                      <p className="text-xs text-gray-500">{profileData.email}</p>
                      <p className="text-xs text-gray-500">{profileData.role}</p>
                    </>
                  )}
                  <button
                    className="mt-1 w-full bg-black text-white rounded"
                    onClick={() => setShowEditPopup(true)}
                  >
                    Edit Profile
                  </button>
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
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Name"
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
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleEditChange}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPopup(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-4 py-1 bg-gray-300 text-sm rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1 bg-blue-600 text-white text-sm rounded">
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