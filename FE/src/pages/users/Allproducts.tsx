import { useEffect, useState } from 'react';
import axiosInstance from '../../../src/api/axiosInstance';
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
  isActive: boolean;
}

const ProductCardSkeleton = () => (
  <div className="bg-white shadow-md rounded-xl overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-300"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      <div className="mt-4 h-9 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axiosInstance.get('/products/');
        setProducts(res.data.products);
      } catch (error) {
        console.error('Error fetching all products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const filteredProducts = products.filter((product) => !product.isSold && product.isActive);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-10 text-center">All Products</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(itemsPerPage)].map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-20">No products available.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {paginatedProducts.map((product) => (
              <div key={product._id} className="bg-white shadow-md rounded-xl overflow-hidden flex flex-col">
                <img
                  src={product.imageURL}
                  alt={product.title}
                  className="w-full h-48 object-contain bg-gray-50 p-4"
                />
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div className="space-y-1 mb-3">
                    <h4 className="text-lg font-semibold capitalize">{product.title}</h4>
                    <p className="text-blue-600 font-bold">₹ {product.price}</p>
                    <p className="text-xs text-gray-500">Seller: {product.sellerId?.name}</p>
                  </div>
                  <Link
                    to={`/product/${product._id}`}
                    className="mt-auto bg-black text-white text-center py-2 rounded hover:bg-gray-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
};

export default AllProducts;
