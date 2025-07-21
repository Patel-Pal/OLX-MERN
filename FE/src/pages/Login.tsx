import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

      setTimeout(() => navigate('/'), 1000);

    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

 return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={Yup.object({
            email: Yup.string().email().required('Email is required'),
            password: Yup.string().required('Password is required'),
          })}
          onSubmit={handleSubmit}
        >
          <Form>
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
            <ErrorMessage name="password" component="div" className="text-sm text-red-500 mb-4" />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Login
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default Login;
