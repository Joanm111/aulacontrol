import React from 'react';
import { useNavigate } from 'react-router-dom';
import './estilos.css';

const InicioPA = ({ email, setLoggedIn }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem('user');
    setLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <button onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
        <button onClick={() => navigate('/admin/users')}>Cursos</button>
        <button onClick={() => navigate('/admin/settings')}>Opciones</button>
        <button onClick={onLogout}>Log out</button>
        <div className="user-info">
          <p>{email}</p>
        </div>
      </div>
      <div className="content">
        <h1>Bienvenido Profesor</h1>
        <p>Select an option from the sidebar.</p>
      </div>
    </div>
  );
};

export default InicioPA;
