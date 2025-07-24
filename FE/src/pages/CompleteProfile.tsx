import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct import

interface ProfileValues {
  name: string;
  phoneNumber: string;
  address: string;
  role: 'buyer' | 'seller';
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setEmail(decoded.email);
        login(token);
      } catch (err) {
        toast.error('Invalid token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  const initialValues: ProfileValues = {
    name: '',
    phoneNumber: '',
    address: '',
    role: 'buyer',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name required'),
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be 10 digits')
      .required('Phone number required'),
    address: Yup.string().required('Address required'),
    role: Yup.string().oneOf(['buyer', 'seller']).required(),
  });

  const handleSubmit = async (values: ProfileValues) => {
  try {
    const payload = {
      ...values,
      email, // Include email so backend knows which user to update
    };

    const res = await axiosInstance.put('http://localhost:5000/api/auth/update-profile', payload, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    });

    login(res.data.token);
    sessionStorage.setItem('username', res.data.user.name);
    sessionStorage.setItem('email', res.data.user.email);
    sessionStorage.setItem('role', res.data.user.role);
    sessionStorage.setItem('userId', res.data.user._id);

    toast.success('Profile completed successfully!');

    if (res.data.user.role === 'admin') {
      navigate('/statistics');
    } else {
      navigate('/');
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Profile completion failed');
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-14">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Complete Your Profile</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            {/* Disabled email field - not part of Formik */}
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 bg-gray-100 cursor-not-allowed"
              placeholder="Email"
            />

            <Field
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Name"
            />
            <ErrorMessage name="name" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="phoneNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Phone Number (10 digits)"
            />
            <ErrorMessage name="phoneNumber" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              as="textarea"
              name="address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Address"
            />
            <ErrorMessage name="address" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              as="select"
              name="role"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </Field>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4"
            >
              Complete Profile
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default CompleteProfile;
