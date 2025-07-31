import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = (location.state as any)?.email || '';

  const handleReset = async (values: any) => {
    if (loading) return; 
    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', values);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>

        <Formik
          initialValues={{ email: prefilledEmail, otp: '', newPassword: '' }}
          enableReinitialize
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email').required('Email is required'),
            otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
            newPassword: Yup.string().min(6, 'Min 6 characters').required('New Password is required'),
          })}
          onSubmit={handleReset}
        >
          <Form>
            <Field
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
              disabled 
            />
            <ErrorMessage name="email" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="otp"
              type="text"
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
            />
            <ErrorMessage name="otp" component="div" className="text-sm text-red-500 mb-2" />

            <Field
              name="newPassword"
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <ErrorMessage name="newPassword" component="div" className="text-sm text-red-500 mb-4" />

            <button
              type="submit"
              disabled={loading} 
              className={`w-full text-white py-2 rounded-md transition ${
                loading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'} {/* ✅ Dynamic button text */}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
