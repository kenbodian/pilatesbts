import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WaiverPage } from './pages/WaiverPage';
import { IntakeFormPage } from './pages/IntakeFormPage';
import { AdminPage } from './pages/AdminPage';
import { PasscodePage } from './pages/PasscodePage';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProductsPage } from './pages/ProductsPage';
import { SuccessPage } from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/passcode" element={<PasscodePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/waiver" element={
          <ProtectedRoute>
            <WaiverPage />
          </ProtectedRoute>
        } />
        <Route path="/intake" element={
          <ProtectedRoute>
            <IntakeFormPage />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;