import { Navigate, Route, Routes } from 'react-router';
import './index.css';
import Login from './pages/auth/Login';
import Registration from './pages/auth/Registration';
import NotFoundPage from './pages/notFound/NotFoundPage';
import Violations from './pages/violations/Violations';
import LayoutMenu from './components/layout/LayoutMenu';
import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return (
    <div className='app'>
      <Routes>
        <Route
          path='/'
          element={<Navigate to={'/login'} replace />}
        />
        <Route
          path='/login'
          element={<Login />}
        />
        <Route
          path='/registration'
          element={<Registration />}
        />
        <Route element={<LayoutMenu />}>
          <Route
            path='/violations'
            element={<Violations />}
          />
          <Route
            path='/dashboard'
            element={<Dashboard />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>

  )
}

export default App
