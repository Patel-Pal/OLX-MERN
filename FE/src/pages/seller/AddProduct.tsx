import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  //add or update product
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
        await axios.put(`http://localhost:5000/api/products/${editingProductId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('✅ Product updated successfully!');
        setEditingProductId(null);
      } else {
        await axios.post('http://localhost:5000/api/products/add', data, {
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


  //fetch seller's products
  const fetchMyProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  //edit product
  const handleEdit = (prod: any) => {
    setEditingProductId(prod._id);
    setFormData({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      category: prod.category,
    });
  };

  //delete product
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyProducts();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  //call fetchMyProducts 
  useEffect(() => {
    fetchMyProducts();
  }, []);

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
            className="w-full text-sm file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-xl"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
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
                className="flex flex-col p-4 border rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow relative"
              >
                <img
                  src={prod.imageURL}
                  alt={prod.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-1">{prod.title}</h3>
                <p className="text-sm text-gray-700 mb-2 flex-1">{prod.description}</p>
                <div className="mt-auto text-sm text-gray-600 font-medium">
                  ₹{prod.price} | <span className="capitalize">{prod.category}</span>
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:text-blue-800">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(prod._id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
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
