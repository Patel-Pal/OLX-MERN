import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name required'),
    email: Yup.string().email('Invalid email').required('Email required'),
    password: Yup.string().min(6, 'Min 6 chars').required('Password required'),
    role: Yup.string().oneOf(['buyer', 'seller']).required(),
  });

  const handleSubmit = async (values: any) => {
    try {
      await axiosInstance.post('/auth/register', values);
      alert('Registration successful!');
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        <Form>
          <Field name="name" className="form-control my-2" placeholder="Name" />
          <ErrorMessage name="name" className="text-danger" component="div" />

          <Field name="email" className="form-control my-2" placeholder="Email" />
          <ErrorMessage name="email" className="text-danger" component="div" />

          <Field name="password" className="form-control my-2" placeholder="Password" type="password" />
          <ErrorMessage name="password" className="text-danger" component="div" />

          <Field as="select" name="role" className="form-control my-2">
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </Field>

          <button type="submit" className="btn btn-primary mt-2">Register</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Register;
