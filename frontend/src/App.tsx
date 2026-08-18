import { Navigate, Route, Routes } from 'react-router';
import './index.css';
import Login from './pages/auth/Login';
import Registration from './pages/auth/Registration';

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
      </Routes>
    </div>

  )
}

export default App
