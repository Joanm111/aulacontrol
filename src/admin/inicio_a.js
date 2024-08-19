import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos.css'; // Asegúrate de que estilos.css esté en la misma ubicación que este archivo
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
        const [studentsResponse, teachersResponse, coursesResponse, usersResponse] = await Promise.all([
          axios.get('https://localhost:44311/padres'),
          axios.get('https://localhost:44311/Profesors'),
          axios.get('https://localhost:44311/grado'),
          axios.get('https://localhost:44311/Usuarios')
        ]);

        const studentCount = studentsResponse.data.length;
        const teacherCount = teachersResponse.data.length;
        const courseCount = coursesResponse.data.length;

        setStudentsCount(studentCount);
        setTeachersCount(teacherCount);
        setUsersCount(studentCount + teacherCount);
        setCoursesCount(courseCount);

        const usersData = usersResponse.data;
        const usersCombined = [];

        // Obtener padres y sus correos correspondientes
        const parentsResponse = await axios.get('https://localhost:44311/padres');
        parentsResponse.data.forEach(parent => {
          const user = usersData.find(u => u.id === parent.usuarioId);
          if (user) {
            usersCombined.push({
              id: user.id,  // Cambia a user.id
              nombre: parent.nombre,
              correo: user.correo,
              role: 'Padre'
            });
          }
        });

        // Obtener profesores y sus correos correspondientes
        const teachersDataResponse = await axios.get('https://localhost:44311/profesors');
        teachersDataResponse.data.forEach(teacher => {
          const user = usersData.find(u => u.id === teacher.usuarioId);
          if (user) {
            usersCombined.push({
              id: user.id,  // Cambia a user.id
              nombre: teacher.nombre,
              correo: user.correo,
              role: 'Profesor'
            });
          }
        });

        setUsers(usersCombined.slice(0, 5));
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
    <div className="container-fluid" style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div className="row">
        {/* Sidebar fijo a la izquierda */}
        <nav className="col-md-2 d-md-block sidebar bg-dark">
          <div className="sidebar-content">
            <h2 className="text-white text-center mb-4">Admin Panel</h2>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/admin/inicio_a')}>
              Dashboard
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/admin/padres')}>
              Padres
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/admin/profesores')}>
              Profesores
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/admin/cursos')}>
              Grados
            </button>
            <button className="btn btn-danger btn-block" onClick={onLogout}>
              Log out
            </button>
            <div className="user-info mt-4">
              <p className="text-light text-center">{email}</p>
            </div>
          </div>
        </nav>
        
        {/* Contenido principal */}
        <main className="col-md-10 d-flex flex-column align-items-start justify-content-start pt-3 pb-2 mb-3">
          <h1 className="text-dark mb-4 title">Bienvenido ADMINISTRADOR</h1>
          <div className="d-flex justify-content-between cards-container">
            <div className="card card-blue">
              <h3 className="card-title">Cantidad de Padres</h3>
              <div className="card-content">{studentsCount}</div>
            </div>
            <div className="card card-green">
              <h3 className="card-title">Cantidad de Profesores</h3>
              <div className="card-content">{teachersCount}</div>
            </div>
            <div className="card card-orange">
              <h3 className="card-title">Cantidad de Usuarios</h3>
              <div className="card-content">{usersCount}</div>
            </div>
            <div className="card card-red">
              <h3 className="card-title">Cantidad de Grados</h3>
              <div className="card-content">{coursesCount}</div>
            </div>
          </div>
          
          {/* Tabla de usuarios */}
          <div className="latest-tables w-100">
            <h2 className="text-dark">Últimos Usuarios Agregados</h2>
            <table className="table table-striped">
              <thead className="thead-dark">
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
