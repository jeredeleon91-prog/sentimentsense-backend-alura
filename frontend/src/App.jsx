import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Libreria from './pages/Libreria';
import Zapateria from './pages/Zapateria';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Menu (Default) */}
            <Route path="/" element={<Landing />} />

            {/* Demos */}
            <Route path="/demo/libreria" element={<Libreria />} />
            <Route path="/demo/zapateria" element={<Zapateria />} />
            {/* Legacy Redirect */}
            <Route path="/demo" element={<Navigate to="/demo/libreria" replace />} />

            {/* Admin Portal */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Client/Manager Portal */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/dashboard" element={<ClientDashboard />} />

            {/* Catch-all: redirect to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
