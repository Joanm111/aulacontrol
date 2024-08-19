import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Materias.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faFingerprint, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const MisMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedMateriaId, setSelectedMateriaId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formType, setFormType] = useState('');
  const [attendanceState, setAttendanceState] = useState('Presente');
  const [gradeValues, setGradeValues] = useState({ valor1: '', valor2: '', valor3: '' });
  const [conductDescription, setConductDescription] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [existingGradeId, setExistingGradeId] = useState(null);
  const [existingConductId, setExistingConductId] = useState(null);
  const [existingReportId, setExistingReportId] = useState(null);
  const [conducts, setConducts] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const storedUserEmail = localStorage.getItem('userEmail');
        if (!storedUserEmail) {
          window.location.href = '/login';
          return;
        }

        const usersResponse = await axios.get('https://localhost:44311/usuarios');
        const user = usersResponse.data.find(u => u.correo === storedUserEmail);

        if (user) {
          const teachersResponse = await axios.get('https://localhost:44311/profesors');
          const teacher = teachersResponse.data.find(t => t.usuarioId === user.id);

          if (teacher) {
            const materiasResponse = await axios.get('https://localhost:44311/Materium');
            const filteredMaterias = materiasResponse.data.filter(materia => materia.profesorId === teacher.id);
            setMaterias(filteredMaterias);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const fetchStudents = async (gradoId) => {
    try {
      const estudiantesResponse = await axios.get(`https://localhost:44311/estudiantes?gradoId=${gradoId}`);
      return estudiantesResponse.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchConducts = async (estudianteId) => {
    try {
      const response = await axios.get(`https://localhost:44311/Conductums?estudianteId=${estudianteId}`);
      setConducts(response.data.filter(conduct => conduct.estudianteId === estudianteId));
    } catch (error) {
      console.error('Error fetching conducts:', error);
    }
  };

  const fetchReports = async (estudianteId) => {
    try {
      const response = await axios.get(`https://localhost:44311/Reportes?estudianteId=${estudianteId}`);
      setReports(response.data.filter(report => report.estudianteId === estudianteId));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleShowStudents = async (materiaId, gradoId) => {
    try {
      console.log(`Materia ID: ${materiaId}`);
      const students = await fetchStudents(gradoId);
      setStudents(students);
      setSelectedMateriaId(materiaId); // Asignar la materia seleccionada
      setFormType(''); // Clear form type when showing students
    } catch (error) {
      console.error('Error showing students:', error);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleAction = async (estudianteId, actionType) => {
    console.log(`Seleccionado Estudiante ID: ${estudianteId} para ${actionType}`);
    setSelectedStudent(estudianteId);
    setFormType(actionType);

    if (actionType === 'Asistencia') {
      setAttendanceState('Presente');
    } else if (actionType === 'Calificaciones') {
      try {
        const response = await axios.get(`https://localhost:44311/Calificacions?materiaId=${selectedMateriaId}&estudianteId=${estudianteId}`);
        const existingGrades = response.data.find(grade => grade.estudianteId === estudianteId);

        if (existingGrades) {
          setExistingGradeId(existingGrades.id);
          setGradeValues({
            valor1: existingGrades.valor1 || '',
            valor2: existingGrades.valor2 || '',
            valor3: existingGrades.valor3 || ''
          });
        } else {
          setExistingGradeId(null);
          setGradeValues({ valor1: '', valor2: '', valor3: '' });
        }

        console.log('Current grade data:', existingGrades);

      } catch (error) {
        console.error('Error fetching grades:', error);
        setExistingGradeId(null);
        setGradeValues({ valor1: '', valor2: '', valor3: '' });
      }
    } else if (actionType === 'Conducta') {
      setConductDescription('');
      await fetchConducts(estudianteId);
    } else if (actionType === 'Reporte') {
      setReportType('');
      setReportDescription('');
      await fetchReports(estudianteId);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];

      if (formType === 'Asistencia') {
        console.log(`Enviando asistencia para Estudiante ID: ${selectedStudent}`);
        const existingAttendanceResponse = await axios.get(`https://localhost:44311/Asistenciums?fecha=${today}&estudianteId=${selectedStudent}`);
        const existingAttendance = existingAttendanceResponse.data.find(attendance => attendance.estudianteId === selectedStudent);

        if (existingAttendance) {
          const attendanceId = existingAttendance.id;
          const updatedAttendance = {
            ...existingAttendance,
            descripcion: attendanceState,
          };
          await axios.put(`https://localhost:44311/Asistenciums/${attendanceId}`, updatedAttendance);
        } else {
          const newAttendance = {
            descripcion: attendanceState,
            fecha: today,
            estudianteId: selectedStudent,
          };
          await axios.post('https://localhost:44311/Asistenciums', newAttendance);
        }
      } else if (formType === 'Calificaciones') {
        const gradeData = {
          id: existingGradeId || 0,
          estudianteId: selectedStudent,
          materiaId: selectedMateriaId,
          valor1: gradeValues.valor1 || 0,
          valor2: gradeValues.valor2 || 0,
          valor3: gradeValues.valor3 || 0,
          calificacions: ["A"],
        };

        console.log('Sending grade data:', gradeData);

        if (existingGradeId) {
          await axios.put(`https://localhost:44311/Calificacions/${existingGradeId}`, gradeData);
        } else {
          await axios.post('https://localhost:44311/Calificacions', gradeData);
        }
      } else if (formType === 'Conducta') {
        const conductData = {
          id: existingConductId || 0,
          descripcion: conductDescription,
          fecha: today,
          estudianteId: selectedStudent,
          conductum: ["bien"], // Ejemplo de uso del array
        };

        console.log('Sending conduct data:', conductData);

        if (existingConductId) {
          await axios.put(`https://localhost:44311/Conductums/${existingConductId}`, conductData);
        } else {
          await axios.post('https://localhost:44311/Conductums', conductData);
        }

        await fetchConducts(selectedStudent); // Actualiza la lista de conductas
      } else if (formType === 'Reporte') {
        const reportData = {
          id: existingReportId || 0,
          estudianteId: selectedStudent,
          fecha: today,
          tipo: reportType,
          descripcion: reportDescription,
        };

        console.log('Sending report data:', reportData);

        if (existingReportId) {
          await axios.put(`https://localhost:44311/Reportes/${existingReportId}`, reportData);
        } else {
          await axios.post('https://localhost:44311/Reportes', reportData);
        }

        await fetchReports(selectedStudent); // Actualiza la lista de reportes
      }

      clearForm();
    } catch (error) {
      console.error(`Error al procesar ${formType.toLowerCase()}:`, error);
    }
  };

  const handleEditConduct = (conduct) => {
    setConductDescription(conduct.descripcion);
    setExistingConductId(conduct.id);
    setFormType('Conducta');
  };

  const handleEditReport = (report) => {
    setReportType(report.tipo);
    setReportDescription(report.descripcion);
    setExistingReportId(report.id);
    setFormType('Reporte');
  };

  const handleDeleteConduct = async (conductId) => {
    try {
      await axios.delete(`https://localhost:44311/Conductums/${conductId}`);
      setConducts(conducts.filter(conduct => conduct.id !== conductId));
    } catch (error) {
      console.error('Error deleting conduct:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`https://localhost:44311/Reportes/${reportId}`);
      setReports(reports.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const clearForm = () => {
    setAttendanceState('Presente');
    setGradeValues({ valor1: '', valor2: '', valor3: '' });
    setConductDescription('');
    setReportType('');
    setReportDescription('');
    setFormType('');
    setSelectedStudent(null);
    setExistingGradeId(null);
    setExistingConductId(null);
    setExistingReportId(null);
  };

  const handleSimulateFingerprintScan = async () => {
    if (students.length > 0) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      setSelectedStudent(randomStudent.id);
      alert(`Estudiante ${randomStudent.nombre} ha puesto su huella.`);

      const today = new Date().toISOString().split('T')[0];
      const existingAttendanceResponse = await axios.get(`https://localhost:44311/Asistenciums?fecha=${today}&estudianteId=${randomStudent.id}`);
      const existingAttendance = existingAttendanceResponse.data.find(attendance => attendance.estudianteId === randomStudent.id);

      if (existingAttendance) {
        const attendanceId = existingAttendance.id;
        const updatedAttendance = {
          ...existingAttendance,
          descripcion: 'Presente',
        };
        await axios.put(`https://localhost:44311/Asistenciums/${attendanceId}`, updatedAttendance);
      } else {
        const newAttendance = {
          descripcion: 'Presente',
          fecha: today,
          estudianteId: randomStudent.id,
        };
        await axios.post('https://localhost:44311/Asistenciums', newAttendance);
      }

      await handleFormSubmit(new Event('submit'));
    } else {
      alert('No hay estudiantes para registrar asistencia.');
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container">
      <button className="btn btn-secondary mt-4 mb-4" onClick={handleGoBack}>Regresar</button>
      <h1 className="mt-4 mb-4">Materias</h1>

      <h2>Lista de Materias</h2>
      {materias.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map(materia => (
              <tr key={materia.id}>
                <td>{materia.id}</td>
                <td>{materia.nombre}</td>
                <td>
                  <button className="btn btn-info" onClick={() => handleShowStudents(materia.id, materia.gradoId)}>Mostrar Estudiantes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay materias asignadas.</p>
      )}

      {students.length > 0 && selectedMateriaId !== null && (
        <div className="mt-4">
          <h2>Estudiantes del Grado {selectedMateriaId}</h2>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.nombre}</td>
                  <td>
                    <button className="btn btn-success mr-2" onClick={() => handleAction(student.id, 'Asistencia')}>
                      Registrar Asistencia
                    </button>
                    <button className="btn btn-warning mr-2" onClick={() => handleAction(student.id, 'Calificaciones')}>
                      Calificar
                    </button>
                    <button className="btn btn-danger mr-2" onClick={() => handleAction(student.id, 'Conducta')}>
                     Observación
                    </button>
                    <button className="btn btn-info mr-2" onClick={() => handleAction(student.id, 'Reporte')}>
                      Reporte
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formType && (
        <div className="mt-4">
          <div className="form-container">
            <h3>{formType === 'Conducta' ? 'Observaciones' : formType}</h3>
            <form onSubmit={handleFormSubmit}>
              {formType === 'Asistencia' && (
                <div className="form-group">
                  <label htmlFor="attendanceState">Estado de Asistencia:</label>
                  <select
                    id="attendanceState"
                    className="form-control"
                    value={attendanceState}
                    onChange={(e) => setAttendanceState(e.target.value)}
                  >
                    <option value="Presente">Presente</option>
                    <option value="Ausente">Ausente</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              )}

              {formType === 'Calificaciones' && (
                <>
                  <div className="form-group">
                    <label htmlFor="gradeValue1">Valor 1:</label>
                    <input
                      type="number"
                      id="gradeValue1"
                      className="form-control"
                      value={gradeValues.valor1}
                      onChange={(e) => setGradeValues({ ...gradeValues, valor1: e.target.value })}
                      placeholder="Ingrese Valor 1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gradeValue2">Valor 2:</label>
                    <input
                      type="number"
                      id="gradeValue2"
                      className="form-control"
                      value={gradeValues.valor2}
                      onChange={(e) => setGradeValues({ ...gradeValues, valor2: e.target.value })}
                      placeholder="Ingrese Valor 2"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gradeValue3">Valor 3:</label>
                    <input
                      type="number"
                      id="gradeValue3"
                      className="form-control"
                      value={gradeValues.valor3}
                      onChange={(e) => setGradeValues({ ...gradeValues, valor3: e.target.value })}
                      placeholder="Ingrese Valor 3"
                    />
                  </div>
                </>
              )}

              {formType === 'Conducta' && (
                <div className="form-group">
                  <label htmlFor="conductDescription">Descripción de observación:</label>
                  <textarea
                    id="conductDescription"
                    className="form-control"
                    value={conductDescription}
                    onChange={(e) => setConductDescription(e.target.value)}
                    placeholder="Ingrese la descripción de la observación"
                    required
                  />
                </div>
              )}

              {formType === 'Reporte' && (
                <>
                  <div className="form-group">
                    <label htmlFor="reportType">Asunto del Reporte:</label>
                    <input
                      type="text"
                      id="reportType"
                      className="form-control"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      placeholder="Ingrese el asunto del reporte"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reportDescription">Descripción del Reporte:</label>
                    <textarea
                      id="reportDescription"
                      className="form-control"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Ingrese la descripción del reporte"
                      required
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faSave} /> Guardar
              </button>
            </form>

            {formType === 'Asistencia' && (
              <div className="mt-4">
                <h2>Simulación de Huella Dactilar</h2>
                <button className="btn btn-dark" onClick={handleSimulateFingerprintScan}>
                  <FontAwesomeIcon icon={faFingerprint} /> Simular Huella Dactilar
                </button>
              </div>
            )}
          </div>

          {/* Mostrar la lista de observaciones existentes si se selecciona Observación */}
          {formType === 'Conducta' && conducts.length > 0 && (
            <div className="mt-4">
              <h4> Observaciones Anteriores</h4>
              <ul className="list-group">
                {conducts.map((conduct) => (
                  <li key={conduct.id} className="list-group-item">
                    <p>{conduct.fecha}: {conduct.descripcion}</p>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditConduct(conduct)}>
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteConduct(conduct.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mostrar la lista de reportes existentes si se selecciona Reporte */}
          {formType === 'Reporte' && reports.length > 0 && (
            <div className="mt-4">
              <h4>Reportes Anteriores</h4>
              <ul className="list-group">
                {reports.map((report) => (
                  <li key={report.id} className="list-group-item">
                    <p>{report.fecha}: {report.tipo} - {report.descripcion}</p>
                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditReport(report)}>
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReport(report.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MisMaterias;
