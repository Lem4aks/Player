import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../Layouts/AuthLayout/AuthLayout';
import MainLayout from '../Layouts/MainLayout/MainLayout';
import { Loading } from '../components';

const AppWithAuth = lazy(() => import('../AppWithAuth'));
const Login = lazy(() => import('../components/Login/Login'));
const Post = lazy(() => import('../components/Post/Post'));
const Register = lazy(() => import('../components/Register/Register'));

const Routs = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path='/' element={<AppWithAuth />} />
              <Route path='/post' element={<Post />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default Routs;
