import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (values: any) => {
    if (loading) return; // prevent multiple rapid clicks
    setLoading(true);
    try {
      await axiosInstance.post('/auth/send-otp', { email: values.email });
      toast.success('OTP sent to your email');
      navigate('/reset-password', { state: { email: values.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Forgot Password</h2>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email').required('Email is required'),
          })}
          onSubmit={handleSendOtp}
        >
          {() => (
            <Form>
              <Field
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <ErrorMessage name="email" component="div" className="text-sm text-red-500 mb-4" />

              <button
                type="submit"
                className={`w-full bg-green-600 text-white py-2 rounded-md transition mb-4 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;
