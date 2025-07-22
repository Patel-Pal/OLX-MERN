import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  sellerId: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  imageURL: string;
  isSold: boolean;
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/');
        setProducts(res.data.products);
      } catch (error) {
        console.error('Error fetching all products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  const filteredProducts = products.filter((product) => !product.isSold);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">All Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <div key={product._id} className="bg-white shadow-md rounded-xl overflow-hidden">
            <img src={product.imageURL} alt={product.title} className="w-full h-48 object-cover" />
            <div className="p-4 space-y-1">
              <h4 className="text-lg font-semibold">{product.title}</h4>
              <p className="text-blue-600 font-bold">₹ {product.price}</p>
              <p className="text-xs text-gray-400">Seller: {product.sellerId?.name}</p>
              <div className="flex justify-center">
                <Link to={`/product/${product._id}`}>
                  <button className="mt-2 bg-black text-white px-6 py-1 rounded hover:bg-gray-800">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-black text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
