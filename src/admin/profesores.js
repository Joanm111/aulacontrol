import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './profesores.css';

const TeachersManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: ''
  });
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState(''); 
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchUsers();
    fetchGrades();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('https://localhost:44311/Profesors');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://localhost:44311/usuarios');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('https://localhost:44311/grado');
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('https://localhost:44311/Materium');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const newUserResponse = await axios.post('https://localhost:44311/usuarios', {
        correo: newTeacher.correo,
        nombre: newTeacher.nombre,
        apellido: newTeacher.apellido,
        contrasena: newTeacher.contrasena
      });
      const newUserId = newUserResponse.data.id;

      const newTeacherResponse = await axios.post('https://localhost:44311/Profesors', {
        nombre: newTeacher.nombre,
        apellido: newTeacher.apellido,
        usuarioId: newUserId,
        gradoId: selectedGradeId,
      });

      const newTeacherId = newTeacherResponse.data.id;

      if (newSubjectName.trim() !== '') {
        await handleAddNewSubject(newSubjectName, newTeacherId);
      } else if (selectedSubjectId) {
        await axios.put(`https://localhost:44311/Materium/${selectedSubjectId}`, {
          profesorId: newTeacherId
        });
      }

      fetchTeachers();
      resetForm();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      
      await axios.put(`https://localhost:44311/Profesors/${editingTeacher.id}`, {
        id: editingTeacher.id,
        nombre: newTeacher.nombre,
        apellido: newTeacher.apellido,
        usuarioId: editingTeacher.usuarioId,
        gradoId: selectedGradeId,
      });

      
      if (newTeacher.correo || newTeacher.contrasena) {
        const userData = {
          id: editingTeacher.usuarioId,  
          correo: newTeacher.correo,
          contrasena: newTeacher.contrasena
        };

        console.log('Datos del usuario enviados:', userData);  

        await axios.put(`https://localhost:44311/usuarios/${editingTeacher.usuarioId}`, userData);
      }

     
      if (newSubjectName.trim() !== '') {
        await handleAddNewSubject(newSubjectName, editingTeacher.id);
      } else if (selectedSubjectId) {
        await axios.put(`https://localhost:44311/Materium/${selectedSubjectId}`, {
          profesorId: editingTeacher.id
        });
      }

    
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.id === editingTeacher.id
            ? { ...teacher, nombre: newTeacher.nombre, apellido: newTeacher.apellido, gradoId: selectedGradeId }
            : teacher
        )
      );

      resetForm();
    } catch (error) {
      console.error('Error editing teacher:', error.response ? error.response.data : error.message);
    }
  };

  const handleAddNewSubject = async (subjectName, teacherId) => {
    if (subjectName.trim() === '') return;
    try {
      await axios.post('https://localhost:44311/Materium', {
        nombre: subjectName,
        profesorId: teacherId
      });
    } catch (error) {
      console.error('Error adding new subject:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar este profesor?')) {
        const materiasResponse = await axios.get(`https://localhost:44311/Materium`);
        const materiasToUpdate = materiasResponse.data.filter(materia => materia.profesorId === teacherId);

        for (const materia of materiasToUpdate) {
          await axios.put(`https://localhost:44311/Materium/${materia.id}`, {
            ...materia,
            profesorId: null 
          });
        }

        await axios.delete(`https://localhost:44311/Profesors/${teacherId}`);

        fetchTeachers();
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  const getUserCorreo = (usuarioId) => {
    const user = users.find(user => user.id === usuarioId);
    return user ? user.correo : '';
  };

  const getGradoNombre = (gradoId) => {
    const grado = grades.find(grado => grado.id === gradoId);
    return grado ? grado.nombre : '';
  };

  const getMateriaNombre = (profesorId) => {
    const materia = subjects.find(materia => materia.profesorId === profesorId);
    return materia ? materia.nombre : 'Materia no asignada';
  };

  const editTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      nombre: teacher.nombre,
      apellido: teacher.apellido,
      correo: getUserCorreo(teacher.usuarioId),
      contrasena: ''
    });
    setSelectedGradeId(teacher.gradoId);
    setSelectedSubjectId(teacher.materiaId || '');
    setNewSubjectName('');
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setNewTeacher({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: ''
    });
    setSelectedGradeId('');
    setSelectedSubjectId('');
    setNewSubjectName('');
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Link to="/admin/inicio_a" className="btn btn-secondary mb-4">Regresar</Link>
        </div>
      </div>

      <h1 className="mt-4 mb-4">Gestor de Profesores</h1>

      <div className="mb-4">
        <h2>{editingTeacher ? 'Editar Profesor' : 'Agregar Profesor'}</h2>
        <form onSubmit={editingTeacher ? handleEditTeacher : handleAddTeacher}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre"
              value={newTeacher.nombre}
              onChange={(e) => setNewTeacher({ ...newTeacher, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              className="form-control"
              placeholder="Apellido"
              value={newTeacher.apellido}
              onChange={(e) => setNewTeacher({ ...newTeacher, apellido: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              className="form-control"
              placeholder="Correo"
              value={newTeacher.correo}
              onChange={(e) => setNewTeacher({ ...newTeacher, correo: e.target.value })}
              required
            />
          </div>
          {!editingTeacher && (
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={newTeacher.contrasena}
                onChange={(e) => setNewTeacher({ ...newTeacher, contrasena: e.target.value })}
                required
              />
            </div>
          )}
          {editingTeacher && (
            <div className="form-group">
              <label>Contraseña (dejar en blanco si no se desea cambiar)</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nueva Contraseña"
                value={newTeacher.contrasena}
                onChange={(e) => setNewTeacher({ ...newTeacher, contrasena: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Seleccionar Grado</label>
            <select
              className="form-control"
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              required
            >
              <option value="">Seleccionar Grado</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Seleccionar Materia</label>
            <select
              className="form-control mb-2"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <option value="">Seleccionar Materia</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.nombre}</option>
              ))}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="O escribe una nueva materia"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editingTeacher ? 'Editar Profesor' : 'Agregar Profesor'}
          </button>
          {editingTeacher && (
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <h2>Lista de Profesores</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Grado</th>
            <th>Materia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(teacher => (
            <tr key={teacher.id}>
              <td>{teacher.id}</td>
              <td>{teacher.nombre}</td>
              <td>{teacher.apellido}</td>
              <td>{getUserCorreo(teacher.usuarioId)}</td>
              <td>{getGradoNombre(teacher.gradoId)}</td>
              <td>{getMateriaNombre(teacher.id)}</td>
              <td>
                <button className="btn btn-info btn-sm mr-2" onClick={() => editTeacher(teacher)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTeacher(teacher.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeachersManager;
