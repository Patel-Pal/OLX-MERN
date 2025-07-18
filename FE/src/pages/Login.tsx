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

      localStorage.setItem('username', res.data.user.name);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('role', res.data.user.role);

      setTimeout(() => navigate('/'), 1000); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={Yup.object({
          email: Yup.string().email().required(),
          password: Yup.string().required(),
        })}
        onSubmit={handleSubmit}
      >
        <Form>
          <Field name="email" className="form-control my-2" placeholder="Email" />
          <ErrorMessage name="email" className="text-danger" component="div" />

          <Field name="password" type="password" className="form-control my-2" placeholder="Password" />
          <ErrorMessage name="password" className="text-danger" component="div" />

          <button type="submit" className="btn btn-success mt-2">Login</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Login;
