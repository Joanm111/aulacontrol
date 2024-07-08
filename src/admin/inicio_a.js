import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const InicioA = ({ email, setLoggedIn }) => {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const studentsResponse = await axios.get('https://localhost:44311/padres');
        const teachersResponse = await axios.get('https://localhost:44311/Profesors');
        const coursesResponse = await axios.get('https://localhost:44311/Cursoes');
        const usersResponse = await axios.get('https://localhost:44311/Usuarios');

        const studentCount = studentsResponse.data.length;
        const teacherCount = teachersResponse.data.length;
        const courseCount = coursesResponse.data.length;

        setStudentsCount(studentCount);
        setTeachersCount(teacherCount);
        setUsersCount(studentCount + teacherCount);
        setCoursesCount(courseCount);

        const combinedUsers = usersResponse.data.map(user => ({
          id: user.id,
          nombre: user.correo, // Aquí tomamos el correo para mostrar como nombre
          correo: user.correo,
          role: user.rol.nombre
        }));

        setUsers(combinedUsers.slice(0, 5));
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

  return (
    <div className="container-fluid" style={{ backgroundColor: '#2bb89e', minHeight: '100vh' }}>
      <div className="row">
        {/* Sidebar fijo a la izquierda */}
        <nav className="col-md-2 d-md-block sidebar">
          <div className="sidebar-content">
            <h2 className="text-white text-center mb-4">Admin Panel</h2>
            <button className="btn btn-primary btn-block mb-3" onClick={() => navigate('/admin/inicio_a')}>
              Dashboard
            </button>
            <button className="btn btn-primary btn-block mb-3" onClick={() => navigate('/admin/users')}>
              Padres
            </button>
            <button className="btn btn-primary btn-block mb-3" onClick={() => navigate('/admin/settings')}>
              Profesores
            </button>
            <button className="btn btn-primary btn-block mb-3" onClick={() => navigate('/admin/courses')}>
              Cursos
            </button>
            <button className="btn btn-danger btn-block" onClick={onLogout}>
              Log out
            </button>
            <div className="user-info mt-4">
              <p className="text-white text-center">{email}</p>
            </div>
          </div>
        </nav>
        
        {/* Contenido principal */}
        <main className="col-md-10 d-flex flex-column align-items-start justify-content-start pt-3 pb-2 mb-3">
          <h1 className="text-white mb-4 title">Bienvenido ADMINISTRADOR</h1>
          <div className="d-flex flex-wrap justify-content-end w-100 cards-container">
            <div className="card-container mb-4">
              <div className="card bg-primary text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <h3 className="card-title">Padres</h3>
                  <p className="card-text">{studentsCount}</p>
                </div>
              </div>
            </div>
            <div className="card-container mb-4">
              <div className="card bg-success text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <h3 className="card-title">Profesores</h3>
                  <p className="card-text">{teachersCount}</p>
                </div>
              </div>
            </div>
            <div className="card-container mb-4">
              <div className="card bg-info text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <h3 className="card-title">Usuarios</h3>
                  <p className="card-text">{usersCount}</p>
                </div>
              </div>
            </div>
            <div className="card-container mb-4">
              <div className="card bg-warning text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <h3 className="card-title">Cursos</h3>
                  <p className="card-text">{coursesCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabla de usuarios */}
          <div className="latest-tables w-100">
            <h2 className="text-white">Últimos Usuarios Agregados</h2>
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.correo}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
        </main>
      </div>
    </div>
  );
};

export default InicioA;
