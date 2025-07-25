import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const token = sessionStorage.getItem('token');
  const currentUserId = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Add or update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image && !editingProductId) {
      setMessage('Please select an image');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    if (image) data.append('image', image);

    try {
      if (editingProductId) {
        await axiosInstance.put(`/products/${editingProductId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('✅ Product updated successfully!');
        setEditingProductId(null);
      } else {
        await axiosInstance.post('/products/add', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('✅ Product added successfully!');
      }

      setFormData({ title: '', description: '', price: '', category: '' });
      setImage(null);
      fetchMyProducts();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Fetch seller's products and check for chats
  const fetchMyProducts = async () => {
    try {
      const res = await axiosInstance.get('/products/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = res.data;

      // Check for chats for each product
      const productsWithChatStatus:any = await Promise.all(
        products.map(async (product: any) => {
          try {
            const chatRes = await axiosInstance.get(`/chat/${product._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const hasChat = chatRes.data.messages.some((msg: any) => msg.senderId._id !== currentUserId);
            return { ...product, hasChat };
          } catch (error) {
            console.error(`Error checking chat for product ${product._id}:`, error);
            return { ...product, hasChat: false };
          }
        })
      );

      setProducts(productsWithChatStatus);
    } catch (err) {
      console.error('Error fetching products:', err);
      setMessage('Error fetching products');
    }
  };

  // Edit product
  const handleEdit = (prod: any) => {
    setEditingProductId(prod._id);
    setFormData({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      category: prod.category,
    });
  };

  // Delete product
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyProducts();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage('Error deleting product');
    }
  };

  // Fetch buyerId for a product's chat
  const handleChatClick = async (productId: string) => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    try {
      const res = await axiosInstance.get(`/chat/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const message = res.data.messages.find((msg: any) => msg.senderId._id !== currentUserId);
      const buyerId = message ? message.senderId._id : null;

      if (buyerId) {
        console.log('Navigating to chat:', { productId, buyerId, sellerId: currentUserId });
        navigate(`/chat/${productId}/${buyerId}/${currentUserId}`);
      } else {
        setMessage('No chat initiated for this product yet');
      }
    } catch (error) {
      console.error('Error fetching chat for product:', error);
      setMessage('Error accessing chat');
    }
  };

  // Call fetchMyProducts
  useEffect(() => {
    if (currentUserId && token) {
      fetchMyProducts();
    } else {
      navigate('/login');
    }
  }, [navigate, currentUserId, token]);

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {editingProductId ? 'Edit Product' : 'Add Product'}
        </h2>

        {message && (
          <div className="mb-4 text-sm text-center text-red-500">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            type="text"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none"
            required
          />
          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none"
            required
          ></textarea>
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none"
            required
          />
          <input
            name="category"
            type="text"
            placeholder="Category (e.g., mobile, laptop)"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm file:bg-black file:text-white file:px-4 file:py-2 file:rounded-xl"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {editingProductId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Products</h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products added yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod: any) => (
              <li
                key={prod._id}
                className="flex flex-col p-4 border rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <img
                  src={prod.imageURL}
                  alt={prod.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                {/* Product title + buttons in same line */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{prod.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(prod._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                    {prod.hasChat && (
                      <button
                        onClick={() => handleChatClick(prod._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 flex-1">{prod.description}</p>
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  ₹{prod.price} | <span className="capitalize">{prod.category}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AddProduct;