import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HijosPa.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const HijosPa = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [conducts, setConducts] = useState([]);
  const [materias, setMaterias] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const storedUserEmail = localStorage.getItem('userEmail');
        if (!storedUserEmail) {
          window.location.href = '/login';
          return;
        }

        const usersResponse = await axios.get('https://localhost:44311/usuarios');
        const user = usersResponse.data.find(u => u.correo === storedUserEmail);

        if (user) {
          const parentResponse = await axios.get('https://localhost:44311/padres');
          const parent = parentResponse.data.find(padre => padre.usuarioId === user.id);

          if (parent) {
            const studentsResponse = await axios.get('https://localhost:44311/estudiantes');
            const filteredStudents = studentsResponse.data.filter(student => student.padreId === parent.id);
            setStudents(filteredStudents);

            const materiasResponse = await axios.get('https://localhost:44311/Materium');
            const materiasMap = {};
            materiasResponse.data.forEach(materia => {
              materiasMap[materia.id] = materia.nombre;
            });
            setMaterias(materiasMap);
          }
        }
      } catch (error) {
        console.error('Error fetching parent and student data:', error);
      }
    };

    fetchParentData();
  }, []);

  const fetchStudentDetails = async (studentId) => {
    console.log(`Estudiante ID seleccionado: ${studentId}`);
    try {
      setSelectedStudentId(studentId);

      const gradesResponse = await axios.get(`https://localhost:44311/Calificacions`);
      const filteredGrades = gradesResponse.data.filter(grade => grade.estudianteId === studentId);
      setGrades(filteredGrades);

      const attendanceResponse = await axios.get(`https://localhost:44311/Asistenciums`);
      const filteredAttendance = attendanceResponse.data.filter(att => att.estudianteId === studentId);
      setAttendance(filteredAttendance);

      const reportsResponse = await axios.get(`https://localhost:44311/Reportes`);
      const filteredReports = reportsResponse.data.filter(report => report.estudianteId === studentId);
      setReports(filteredReports);

      const conductsResponse = await axios.get(`https://localhost:44311/Conductums`);
      const filteredConducts = conductsResponse.data.filter(conduct => conduct.estudianteId === studentId);
      setConducts(filteredConducts);

    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const formatValue = (value) => {
    return value === 0 ? '' : value;
  };

  const calculateAverage = (valor1, valor2, valor3) => {
    if (valor1 === 0 || valor2 === 0 || valor3 === 0) {
      return '';
    }
    return ((valor1 + valor2 + valor3) / 3).toFixed(1);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.setMonth(prevMonth.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.setMonth(prevMonth.getMonth() + 1)));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    const firstDayIndex = new Date(year, month, 1).getDay();
    const calendarDays = [];

    
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(<td key={`empty-${i}`} className="empty"></td>);
    }

    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendanceRecord = attendance.find(att => att.fecha === date);

      let attendanceClass = '';
      if (attendanceRecord) {
        switch (attendanceRecord.descripcion.toLowerCase()) {
          case 'presente':
            attendanceClass = 'present';
            break;
          case 'tarde':
            attendanceClass = 'late';
            break;
          case 'ausente':
            attendanceClass = 'absent';
            break;
          default:
            attendanceClass = '';
        }
      }

      calendarDays.push(
        <td key={day} className={attendanceClass}>
          {day}
          {attendanceRecord && <div>{attendanceRecord.descripcion}</div>}
        </td>
      );
    }

   
    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(<td key={`empty-end-${calendarDays.length}`} className="empty"></td>);
    }

    
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(
        <tr key={`week-${i / 7}`}>
          {calendarDays.slice(i, i + 7)}
        </tr>
      );
    }

    return weeks;
  };

  const handleGoBack = () => {
    if (selectedStudentId) {
      setSelectedStudentId(null);
    } else {
      window.history.back();
    }
  };

  const handleDownloadPDF = () => {
    const selectedStudent = students.find(student => student.id === selectedStudentId);
    const input = document.getElementById('student-details');
    
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.text(`Reporte de calificaciones de: ${selectedStudent.nombre}`, 10, 10); 
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 10, position + 20, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;

          if (heightLeft > 0) {
            pdf.addPage();
          }
        }

   
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.text(`Página ${i} de ${pageCount}`, 180, 290);
          pdf.text(new Date().toLocaleDateString(), 10, 290);
        }

        pdf.save(`reporte_calificaciones_${selectedStudent.nombre}.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <div className="container">
      <h1 className="mt-4 mb-4">Mis Hijos</h1>

  
      <button className="btn btn-secondary mb-4" onClick={handleGoBack}>
        <FontAwesomeIcon icon={faChevronLeft} /> Regresar
      </button>

      {students.length > 0 ? (
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
                  <button className="btn btn-primary mr-2" onClick={() => fetchStudentDetails(student.id)}>
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay estudiantes relacionados.</p>
      )}

      {selectedStudentId && (
        <div id="student-details" className="mt-4">
          <h3>Detalles del Estudiante</h3>
          
          <h4>Calificaciones</h4>
          {grades.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>exam 1</th>
                  <th>exam 2</th>
                  <th>exam 3</th>
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => (
                  <tr key={grade.id}>
                    <td>{materias[grade.materiaId]}</td>
                    <td>{formatValue(grade.valor1)}</td>
                    <td>{formatValue(grade.valor2)}</td>
                    <td>{formatValue(grade.valor3)}</td>
                    <td>{calculateAverage(grade.valor1, grade.valor2, grade.valor3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay calificaciones registradas.</p>
          )}

          <h4>Asistencia</h4>
          <div className="calendar-container">
            <div className="calendar-header">
              <button className="btn btn-sm btn-primary" onClick={handlePrevMonth}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button className="btn btn-sm btn-primary" onClick={handleNextMonth}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <table className="table calendar-table">
              <thead>
                <tr>
                  <th>Dom</th>
                  <th>Lun</th>
                  <th>Mar</th>
                  <th>Mié</th>
                  <th>Jue</th>
                  <th>Vie</th>
                  <th>Sáb</th>
                </tr>
              </thead>
              <tbody>
                {renderCalendar()}
              </tbody>
            </table>
          </div>

          <h4>Reportes</h4>
          {reports.length > 0 ? (
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Asunto</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.fecha}</td>
                    <td>{report.tipo}</td>
                    <td>{report.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay reportes disponibles.</p>
          )}

          <h4>Observaciones</h4>
          {conducts.length > 0 ? (
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {conducts.map(conduct => (
                  <tr key={conduct.id}>
                    <td>{conduct.fecha}</td>
                    <td>{conduct.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay registros de conducta.</p>
          )}

         
          <button className="btn btn-secondary mt-4 mr-2" onClick={handleGoBack}>
            <FontAwesomeIcon icon={faChevronLeft} /> Regresar
          </button>

         
          <button className="btn btn-primary mt-4" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faDownload} /> Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default HijosPa;
