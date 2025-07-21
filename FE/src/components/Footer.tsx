import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { token } = useAuth();
  const role = sessionStorage.getItem('role');

  return (
    <footer className="bg-gray-100 text-gray-700 py-6  border-t">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Section 1: Branding */}
        <div>
          <h2 className="text-xl font-bold text-blue-600">OLX </h2>
          <p className="text-sm mt-2">Buy, sell, and discover amazing deals with our OLX-style platform.</p>
        </div>

        {/* Section 2: Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li><Link to="/" className="hover:text-blue-600">Products</Link></li>
            {role === 'buyer' && <li><Link to="/" className="hover:text-blue-600">Orders</Link></li>}
            {role === 'seller' && (
              <>
                <li><Link to="/" className="hover:text-blue-600">Add Product</Link></li>
                <li><Link to="/" className="hover:text-blue-600">Manage Product</Link></li>
              </>
            )}
            {role === 'admin' && (
              <>
                <li><Link to="/admin/users" className="hover:text-blue-600">User Management</Link></li>
                <li><Link to="/admin/stats" className="hover:text-blue-600">Statistics</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Section 3: Auth or Contact */}
        <div>
          <h3 className="font-semibold mb-2">Get In Touch</h3>
          <ul className="space-y-1 text-sm">
            <li>Email: support@olxclone.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>
              {token ? (
                <span className="text-green-600">Logged in as {role}</span>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-600">Login</Link> |{' '}
                  <Link to="/register" className="hover:text-blue-600">Register</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        &copy; {new Date().getFullYear()} OLX Clone. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
