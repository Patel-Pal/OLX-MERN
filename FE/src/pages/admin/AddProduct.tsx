import { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setMessage('Please select an image');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('image', image);

    try {
      const token = sessionStorage.getItem('token'); // Or your auth state
      const response = await axios.post('http://localhost:5000/api/products/add', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('✅ Product added successfully!');
      setFormData({ title: '', description: '', price: '', category: '' });
      setImage(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Product</h2>

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
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
