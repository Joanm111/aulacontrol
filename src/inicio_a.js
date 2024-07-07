import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos.css';

const InicioA = ({ email, setLoggedIn }) => {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const studentsResponse = await axios.get('https://localhost:44311/Padres');
        const teachersResponse = await axios.get('https://localhost:44311/Profesors');

        const studentCount = studentsResponse.data.length;
        const teacherCount = teachersResponse.data.length;

        setStudentsCount(studentCount);
        setTeachersCount(teacherCount);
        setUsersCount(studentCount + teacherCount);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const onLogout = () => {
    localStorage.removeItem('user');
    setLoggedIn(false);
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-panel">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <button className={`toggle-button ${isSidebarOpen ? 'open' : 'closed'}`} onClick={toggleSidebar}>
          {isSidebarOpen ? '<<' : '>>'}
        </button>
        <div className="sidebar-content">
          <h2>Admin Panel</h2>
          <button onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/admin/users')}>Padres</button>
          <button onClick={() => navigate('/admin/settings')}>Profesores</button>
          <button onClick={onLogout}>Log out</button>
          <div className="user-info">
            <p>{email}</p>
          </div>
        </div>
      </div>
      <div className={`content ${isSidebarOpen ? 'shifted' : ''}`}>
        <h1>Bienvenido ADMINISTRADOR</h1>
        <div className="statistics">
          <div className="stat-item">
            <h3>Padres</h3>
            <p>{studentsCount}</p>
          </div>
          <div className="stat-item">
            <h3>Profesores</h3>
            <p>{teachersCount}</p>
          </div>
          <div className="stat-item">
            <h3>Usuarios</h3>
            <p>{usersCount}</p>
          </div>
        </div>
        <p>Select an option from the sidebar.</p>
      </div>
    </div>
  );
};

export default InicioA;
