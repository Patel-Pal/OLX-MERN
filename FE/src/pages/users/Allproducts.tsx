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
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/');
        setProducts(res.data.products);
        // console.log(res.data.products[0].sellerId.name);
      } catch (error) {
        console.error('Error fetching all products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white shadow-md rounded-xl overflow-hidden">
            <img src={product.imageURL} alt={product.title} className="w-full h-48 object-cover" />
            <div className="p-4 space-y-1">
              <h4 className="text-lg font-semibold">{product.title}</h4>
              {/* <p className="text-gray-600 text-sm truncate">{product.description}</p> */}
              <p className="text-blue-600 font-bold">₹ {product.price}</p>
              {/* <p className="text-xs text-gray-400">Category: {product.category}</p> */}
              <p className="text-xs text-gray-400">Seller Name: {product.sellerId?.name}</p>
              <div className='flex justify-center '>
                <Link to={`/product/${product._id}`} >
                  <button className="mt-2  bg-black border  text-white px-10 py-1 rounded " >
                    View Details
                  </button>
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;
