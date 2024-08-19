import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './padre.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InicioPA = ({ setLoggedIn }) => {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const [gradesCount, setGradesCount] = useState(0); // Estado para la cantidad de grados
  const [activeForumsCount, setActiveForumsCount] = useState(0); // Estado para foros activos
  const [students, setStudents] = useState([]);
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const fetchCounts = async () => {
      try {
        const [parentsResponse, gradesResponse, usersResponse, studentsResponse, forumsResponse] = await Promise.all([
          axios.get('https://localhost:44311/padres'),
          axios.get('https://localhost:44311/grado'),
          axios.get('https://localhost:44311/Usuarios'),
          axios.get('https://localhost:44311/estudiantes'),
          axios.get('https://localhost:44311/foroes'), // Asumiendo que hay un endpoint para los foros
        ]);

        const user = usersResponse.data.find(u => u.correo === userEmail);
        if (user) {
          const parent = parentsResponse.data.find(p => p.usuarioId === user.id);
          if (parent) {
            setParentName(parent.nombre);

            const parentStudents = studentsResponse.data.filter(student => student.padreId === parent.id);
            setStudents(parentStudents);
            setStudentsCount(parentStudents.length);

            // Obtener los IDs de los grados únicos
            const uniqueGradeIds = [...new Set(parentStudents.map(student => student.gradoId))];
            setGradesCount(uniqueGradeIds.length); // Contar los grados únicos

            // Filtrar los foros según los grados únicos
            const visibleForums = forumsResponse.data.filter(forum => uniqueGradeIds.includes(forum.gradoId));
            setActiveForumsCount(visibleForums.length); // Contar los foros visibles
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [userEmail, navigate]);

  const onLogout = () => {
    localStorage.removeItem('userEmail');
    setLoggedIn(false);
    navigate('/login');
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div className="row">
        {/* Sidebar fijo a la izquierda */}
        <nav className="col-md-2 d-md-block sidebar bg-dark">
          <div className="sidebar-content">
            <h2 className="text-white text-center mb-4">Panel de Padres</h2>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/padres/inicio_pa')}>
              Dashboard
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/padres/Mis_hijos')}>
              Mis hijos
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/padres/foroPa')}>
              Foro
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/padres/chatPRO')}>
              Chat profesores
            </button>
            <button className="btn btn-danger btn-block" onClick={onLogout}>
              Log out
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="col-md-10 d-flex flex-column align-items-start justify-content-start pt-3 pb-2 mb-3">
          <h1 className="text-dark mb-4 title">Bienvenido, {parentName}</h1>
          <div className="d-flex justify-content-between cards-container">
            <div className="card card-blue">
              <h3 className="card-title">Cantidad de Estudiantes</h3>
              <div className="card-content">{studentsCount}</div>
            </div>
            <div className="card card-orange">
              <h3 className="card-title">Cantidad de Grados</h3>
              <div className="card-content">{gradesCount}</div>
            </div>
            <div className="card card-green">
              <h3 className="card-title">Foros Activos</h3>
              <div className="card-content">{activeForumsCount}</div>
            </div>
          </div>

          {/* Tabla de estudiantes */}
          <div className="latest-tables w-100">
            <h2 className="text-dark">Mis Hijos</h2>
            <table className="table table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Fecha de Nacimiento</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.nombre}</td>
                    <td>{student.apellido}</td>
                    <td>{student.fechaNacimiento}</td>
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

export default InicioPA;
