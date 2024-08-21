import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profe.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InicioPro = () => {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');
  const [studentsCount, setStudentsCount] = useState(0);
  const [gradeName, setGradeName] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
   
    const storedUserEmail = localStorage.getItem('userEmail');
    if (!storedUserEmail) {
      navigate('/login'); 
      return;
    }

    setUserEmail(storedUserEmail); 

  
    const fetchData = async () => {
      try {
     
        const usersResponse = await axios.get('https://localhost:44311/usuarios');
        const user = usersResponse.data.find(u => u.correo === storedUserEmail);

        if (user) {
         
          const teachersResponse = await axios.get('https://localhost:44311/profesors');
          const teacher = teachersResponse.data.find(t => t.usuarioId === user.id);

          if (teacher) {
            setTeacherId(teacher.id);
            setTeacherName(teacher.nombre); 

         
            const studentsResponse = await axios.get('https://localhost:44311/estudiantes');
            const studentsInGrade = studentsResponse.data.filter(student => student.gradoId === teacher.gradoId);
            setStudentsCount(studentsInGrade.length);

          
            const gradesResponse = await axios.get('https://localhost:44311/grado');
            const gradeForTeacher = gradesResponse.data.find(grade => grade.id === teacher.gradoId);
            if (gradeForTeacher) {
              setGradeName(gradeForTeacher.nombre);
            }

            setStudents(studentsInGrade);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const onLogout = () => {
   
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div className="row">
      
        <nav className="col-md-2 d-md-block sidebar bg-dark">
          <div className="sidebar-content">
            <h2 className="text-white text-center mb-4">Profesor Panel</h2>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/profesores/inicio_pro')}>
              Dashboard
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/profesores/Mis_materias')}>
              Mis materias
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/profesores/foro')}>
              Foro
            </button>
            <button className="btn btn-outline-light btn-block mb-3" onClick={() => navigate('/profesores/chatPadres')}>
              Chat Padres
            </button>
            <button className="btn btn-danger btn-block" onClick={onLogout}>
              Log out
            </button>
          </div>
        </nav>

    
        <main className="col-md-10 d-flex flex-column align-items-start justify-content-start pt-3 pb-2 mb-3">
          <h1 className="text-dark mb-4 title">Bienvenido, {teacherName}</h1>
          <div className="d-flex justify-content-between cards-container">
            <div className="card card-blue">
              <h3 className="card-title">ID de Profesor</h3>
              <div className="card-content">{teacherId}</div>
            </div>
            <div className="card card-green">
              <h3 className="card-title">Cantidad de Estudiantes</h3>
              <div className="card-content">{studentsCount}</div>
            </div>
            <div className="card card-orange">
              <h3 className="card-title">Grado</h3>
              <div className="card-content">{gradeName}</div>
            </div>
          </div>

          <div className="latest-tables w-100">
            <h2 className="text-dark">Mis estudiantes</h2>
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

export default InicioPro;
