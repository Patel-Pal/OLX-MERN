import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');

    const ProductSkeleton = () => (
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full md:w-1/2">
                    <div className="w-full aspect-[4/3] bg-gray-300 rounded-xl shadow-md"></div>
                </div>
                <div className="w-full lg:w-1/2 space-y-4">
                    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="flex gap-4 mt-10">
                        <div className="h-10 bg-gray-300 rounded w-32"></div>
                        <div className="h-10 bg-gray-300 rounded w-40"></div>
                    </div>
                </div>
            </div>
        </div>
    );



    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axiosInstance.get(`/products/product_desc/${id}`);
                setProduct(res.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChatClick = () => {
        const buyerId = sessionStorage.getItem('userId');
        const sellerId = product?.sellerId?._id;
        const productId = product?._id;

        if (!buyerId) {
            toast.error('Please Login In to chat');
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

    if (!product) return <ProductSkeleton />;


    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Product Image */}
                <div className="w-full md:w-1/2">
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                        <img
                            src={product.imageURL}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        <p className="text-2xl font-semibold text-green-600">₹ {product.price}</p>

                        <div className="text-sm text-gray-500 space-y-1">
                            <p>
                                <span className="font-medium text-gray-700">Category:</span> {product.category}
                            </p>
                            <p>
                                <span className="font-medium text-gray-700">Seller:</span>{' '}
                                {product.sellerId?.name} ({product.sellerId?.email})
                            </p>
                        </div>
                        {/* Action Buttons */}
                        {role !== 'seller' && (
                            <div className="flex flex-col sm:flex-row gap-4 mt-10">
                                <button
                                    onClick={() => navigate(`/order/${id}`)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition w-full sm:w-auto"
                                >
                                    Place Order
                                </button>

                                <button
                                    onClick={handleChatClick}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-green-600 transition w-full sm:w-auto"
                                >
                                    Chat with {product.sellerId?.name}
                                </button>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
