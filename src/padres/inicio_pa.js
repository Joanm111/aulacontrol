import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LineChart from './LineChart';
import './padre.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InicioPa = ({ email, loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const [gradesCount, setGradesCount] = useState(0);
  const [activeForumsCount, setActiveForumsCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
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
          axios.get('https://localhost:44311/foroes'),
        ]);

        const user = usersResponse.data.find(u => u.correo === storedEmail);
        if (user) {
          const parent = parentsResponse.data.find(p => p.usuarioId === user.id);
          if (parent) {
            setParentName(parent.nombre);

            const parentStudents = studentsResponse.data.filter(student => student.padreId === parent.id);
            setStudents(parentStudents);
            setStudentsCount(parentStudents.length);

            const uniqueGradeIds = [...new Set(parentStudents.map(student => student.gradoId))];
            setGradesCount(uniqueGradeIds.length);

            const visibleForums = forumsResponse.data.filter(forum => uniqueGradeIds.includes(forum.gradoId));
            setActiveForumsCount(visibleForums.length);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [navigate]);

  const onLogout = () => {
    localStorage.removeItem('userEmail');
    setLoggedIn(false);
    navigate('/login');
  };

  const handleStudentClick = (student) => {
    console.log("Actualizando gráficas para el estudiante:", student);
    setSelectedStudent(student);
  };

  const handleCloseCharts = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div className="row">
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
                  <tr key={student.id} onClick={() => handleStudentClick(student)} className="student-row">
                    <td>{student.id}</td>
                    <td className="clickable">{student.nombre}</td>
                    <td>{student.apellido}</td>
                    <td>{student.fechaNacimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedStudent && (
            <div className="w-100 mt-4 d-flex flex-column align-items-start">
              <button className="btn btn-outline-danger mb-3" onClick={handleCloseCharts}>
                Cerrar Gráficas
              </button>
              <div className="w-100 d-flex justify-content-between">
                <div className="tardanzas-container">
                  <h2 className="text-dark">Ausencias por Mes</h2>
                  <LineChart 
                    endpoint={`https://localhost:44311/Asistenciums?estudianteId=${selectedStudent.id}`} 
                    type="ausencias" 
                    selectedStudentId={selectedStudent.id}
                  />
                </div>

                <div>
                  <h2 className="text-dark">Promedio de Exámenes</h2>
                  <LineChart 
                    endpoint={`https://localhost:44311/Calificacions?estudianteId=${selectedStudent.id}`} 
                    type="examenes" 
                    selectedStudentId={selectedStudent.id}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InicioPa;
