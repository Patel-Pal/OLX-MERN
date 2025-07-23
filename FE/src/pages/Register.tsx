import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phoneNumber: '',
    address: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name required'),
    email: Yup.string().email('Invalid email').required('Email required'),
    password: Yup.string().min(6, 'Min 6 chars').required('Password required'),
    role: Yup.string().oneOf(['buyer', 'seller']).required(),
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be 10 digits')
      .required('Phone number required'),
    address: Yup.string().required('Address required'),
  });

  const handleSubmit = async (values: any) => {
    try {
      await axiosInstance.post('/auth/register', values);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-14">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register</h2>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          <Form>
            <Field
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Name"
            />
            <ErrorMessage name="name" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
            />
            <ErrorMessage name="email" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Password"
            />
            <ErrorMessage name="password" component="div" className="text-sm text-red-500 mb-2" />

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
              Register
            </button>
          </Form>
        </Formik>

        {/* Divider */}
        <div className="flex items-center justify-center my-4 text-sm text-gray-500">
          <span className="border-t border-gray-300 w-full"></span>
          <span className="px-2">OR</span>
          <span className="border-t border-gray-300 w-full"></span>
        </div>

        {/* OAuth buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-100 transition">
            <FcGoogle size={20} />
            <span className="text-sm text-gray-700">Google</span>
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-100 transition">
            <FaGithub size={20} />
            <span className="text-sm text-gray-700">GitHub</span>
          </button>
        </div>

        {/* Already have account */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;