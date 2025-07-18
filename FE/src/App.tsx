import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
      <Footer />
    </AuthProvider>
  );
}

export default App;
