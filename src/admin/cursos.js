import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CoursesManager = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [newCourse, setNewCourse] = useState({ nombre: '', descripcion: '' });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [studentsWithoutCourse, setStudentsWithoutCourse] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://localhost:44311/grado');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://localhost:44311/estudiantes');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:44311/grado', newCourse);
      fetchCourses();
      setNewCourse({ nombre: '', descripcion: '' });
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleUpdateCourse = async (id) => {
    try {
      await axios.put(`https://localhost:44311/grado/${id}`, newCourse);
      fetchCourses();
      setNewCourse({ nombre: '', descripcion: '' });
      setSelectedCourseId(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este grado?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`https://localhost:44311/grado/${id}`);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourseId(course.id);
    setNewCourse({ nombre: course.nombre, descripcion: course.descripcion });
    const studentsInSelectedCourse = students.filter(student => student.gradoId === course.id);
    const studentsWithoutSelectedCourse = students.filter(student => !student.gradoId || student.gradoId === null);

    setStudentsInCourse(studentsInSelectedCourse);
    setStudentsWithoutCourse(studentsWithoutSelectedCourse);
  };

  const handleAssignStudentToCourse = async () => {
    try {
      if (selectedStudentId && selectedCourseId) {
        const updatedStudent = students.find(student => student.id === parseInt(selectedStudentId));
        updatedStudent.gradoId = selectedCourseId;

        await axios.put(`https://localhost:44311/estudiantes/${updatedStudent.id}`, updatedStudent);
        fetchStudents();
        handleEditCourse(courses.find(course => course.id === selectedCourseId));
        setSelectedStudentId('');
      }
    } catch (error) {
      console.error('Error assigning student to course:', error);
    }
  };

  const handleRemoveStudentFromCourse = async (studentId) => {
    try {
      const updatedStudent = students.find(student => student.id === studentId);
      updatedStudent.gradoId = null;

      await axios.put(`https://localhost:44311/estudiantes/${updatedStudent.id}`, updatedStudent);
      fetchStudents();
      handleEditCourse(courses.find(course => course.id === selectedCourseId));
    } catch (error) {
      console.error('Error removing student from course:', error);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="container">
      <button className="btn btn-secondary mt-4 mb-4" onClick={handleGoBack}>Regresar</button>
      <h1 className="mt-4 mb-4">Gestor de Grados</h1>

      <div className="mb-4">
        <h2>Agregar / Actualizar Grado</h2>
        <form onSubmit={handleAddCourse}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Nombre"
            value={newCourse.nombre}
            onChange={(e) => setNewCourse({ ...newCourse, nombre: e.target.value })}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Descripción"
            value={newCourse.descripcion}
            onChange={(e) => setNewCourse({ ...newCourse, descripcion: e.target.value })}
          />
          {!selectedCourseId ? (
            <button type="submit" className="btn btn-primary mr-2">Agregar Grado</button>
          ) : (
            <>
              <button type="button" className="btn btn-warning mr-2" onClick={() => handleUpdateCourse(selectedCourseId)}>Actualizar Grado</button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedCourseId(null)}>Cancelar</button>
            </>
          )}
        </form>
      </div>

      <h2>Lista de Grados</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.nombre}</td>
              <td>
                <button className="btn btn-secondary mr-2" onClick={() => handleEditCourse(course)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDeleteCourse(course.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCourseId && (
        <div className="mt-4">
          <h2>Estudiantes en el Grado: {newCourse.nombre}</h2>
          <ul className="list-group mb-4">
            {studentsInCourse.map(student => (
              <li key={student.id} className="list-group-item d-flex justify-content-between align-items-center">
                {student.nombre} {student.apellido}
                <button className="btn btn-danger" onClick={() => handleRemoveStudentFromCourse(student.id)}>Eliminar</button>
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <h2>Asignar Estudiante sin Grado</h2>
            <select
              className="form-control mb-2"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Selecciona un estudiante</option>
              {studentsWithoutCourse.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nombre} {student.apellido}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleAssignStudentToCourse}>Asignar Estudiante al Grado</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;
