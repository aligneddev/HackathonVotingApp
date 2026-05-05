import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const path = window.location.pathname;
  if (path === '/admin') return <AdminPage />;
  return <HomePage />;
}
