import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem('jwt_token') ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route
          path="/signup"
          element={
            <Layout>
              <Signup />
            </Layout>
          }
        />
        <Route
          path="/signin"
          element={
            <Layout>
              <Signin />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            localStorage.getItem('jwt_token') ? (
              <Dashboard />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);