import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      const res = await axiosInstance.post('/auth/login', values);
      login(res.data.token);
      // console.log(res.data.user);

      sessionStorage.setItem('username', res.data.user.name);
      sessionStorage.setItem('email', res.data.user.email);
      sessionStorage.setItem('role', res.data.user.role);
      sessionStorage.setItem('userId', res.data.user._id);
      console.log('userId', res.data.user._id);

      setTimeout(() => navigate('/'), 100);

    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

 return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        {/* Logo or Heading */}
        <div className="flex flex-col items-center mb-6">
          
          <h2 className="text-2xl font-bold text-gray-800">Login to Your Account</h2>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email').required('Email is required'),
            password: Yup.string().required('Password is required'),
          })}
          onSubmit={handleSubmit}
        >
          <Form>
            <Field
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage name="email" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage name="password" component="div" className="text-sm text-red-500 mb-4" />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition mb-4"
            >
              Login
            </button>
          </Form>
        </Formik>

        {/* OR Divider */}
        <div className="flex items-center justify-between mb-4">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <hr className="w-full border-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition mb-2">
          <FcGoogle size={20} />
          Continue with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition mb-4">
          <FaGithub size={20} />
          Continue with GitHub
        </button>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?
          <Link to="/register" className="text-blue-600 hover:underline ml-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
