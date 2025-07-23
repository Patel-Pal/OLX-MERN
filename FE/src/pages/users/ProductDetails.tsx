import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/product_desc/${id}`);
                setProduct(res.data);
                // console.log('Fetched product:', res.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [id]);

    if (!product) return <p className="text-center mt-10">Loading...</p>;

    const handleChatClick = () => {
        const buyerId = sessionStorage.getItem('userId');
        const sellerId = product.sellerId._id;
        const productId = product._id;

        if (!buyerId) {
            navigate('/login');
            return;
        }

        if (buyerId === sellerId) {
            console.warn('Seller cannot chat with themselves');
            return;
        }


        if (buyerId && sellerId && productId) {
            navigate(`/chat/${productId}/${buyerId}/${sellerId}`);
        } else {
            console.error('Missing required IDs for chat');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row items-start gap-10">
                {/* Product Image */}
                <div className="w-full md:w-1/2">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                        <img
                            src={product.imageURL}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full md:w-1/2 space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
                    <p className="text-md text-gray-600">{product.description}</p>
                    <p className="text-2xl font-semibold text-blue-600">₹ {product.price}</p>

                    <div className="text-sm text-gray-500 space-y-1">
                        <p><span className="font-medium text-gray-700">Category:</span> {product.category}</p>
                        <p><span className="font-medium text-gray-700">Seller:</span> {product.sellerId?.name} ({product.sellerId?.email})</p>
                    </div>

                    {/* Buttons */}
                    {role !== 'seller' &&
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            
                            <button
                                onClick={() => navigate(`/order/${id}`)}
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                            >
                                Place Order
                            </button>

                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                onClick={handleChatClick}
                            >
                                Chat with {product.sellerId?.name}
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;