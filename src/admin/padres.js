import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './padres.css'; 
import { Link } from 'react-router-dom'; 

const ParentsManager = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [newParent, setNewParent] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', rolId: 2 });
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newStudent, setNewStudent] = useState({ nombre: '', apellido: '', fechaNacimiento: '' });

  useEffect(() => {
    fetchParents();
    fetchStudents();
    resetFields(); // Resetea los campos cuando se carga el componente
  }, []);

  const resetFields = () => {
    setNewParent({ nombre: '', apellido: '', correo: '', contrasena: '', rolId: 2 });
  };

  const fetchParents = async () => {
    try {
      const parentsResponse = await axios.get('https://localhost:44311/padres');
      const usersResponse = await axios.get('https://localhost:44311/usuarios');

      const parentsData = parentsResponse.data;
      const usersData = usersResponse.data;

      const combinedParents = parentsData.map(parent => {
        const user = usersData.find(u => u.id === parent.usuarioId);
        return {
          ...parent,
          correo: user ? user.correo : '',
          contrasena: user ? user.contrasena : '',
          rolId: user ? user.rolId : 2
        };
      });

      setParents(combinedParents);
    } catch (error) {
      console.error('Error al obtener los padres:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://localhost:44311/estudiantes');
      setStudents(response.data);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleAddParent = async (e) => {
    e.preventDefault();
    try {
      if (!newParent.nombre || !newParent.apellido || !newParent.correo || !newParent.contrasena) {
        alert('Por favor completa todos los campos.');
        return;
      }

      const newUserData = {
        correo: newParent.correo,
        contrasena: newParent.contrasena,
        rolId: newParent.rolId
      };

      console.log('Datos del nuevo usuario que se están enviando:', newUserData);

      const newUserResponse = await axios.post('https://localhost:44311/usuarios', newUserData);
      const user = newUserResponse.data;

      const newParentData = {
        nombre: newParent.nombre,
        apellido: newParent.apellido,
        usuarioId: user.id
      };

      console.log('Datos del nuevo padre que se están enviando:', newParentData);

      await axios.post('https://localhost:44311/padres', newParentData);
      fetchParents();
      resetFields(); // Resetea los campos después de agregar un nuevo padre
    } catch (error) {
      console.error('Error al agregar el padre:', error);
      alert('Hubo un error al agregar el padre. Por favor intenta nuevamente.');
    }
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    try {
      if (!selectedParentId || !selectedUserId) {
        alert('No se ha seleccionado ningún padre para actualizar.');
        return;
      }

      const updatedUserData = {
        id: selectedUserId,
        correo: newParent.correo,
        contrasena: newParent.contrasena,
        rolId: newParent.rolId
      };

      console.log('Datos del usuario que se están enviando para actualizar:', updatedUserData);

      await axios.put(`https://localhost:44311/usuarios/${selectedUserId}`, updatedUserData);

      const updatedParentData = {
        id: selectedParentId,
        nombre: newParent.nombre,
        apellido: newParent.apellido,
        usuarioId: selectedUserId
      };

      console.log('Datos del padre que se están enviando para actualizar:', updatedParentData);

      await axios.put(`https://localhost:44311/padres/${selectedParentId}`, updatedParentData);

      fetchParents();
      resetFields(); // Resetea los campos después de actualizar un padre
      setSelectedParentId(null);
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error al actualizar el padre:', error);
      alert('Hubo un error al actualizar el padre. Por favor intenta nuevamente.');
    }
  };

  const handleDeleteParent = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este padre y todos sus estudiantes asociados?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`https://localhost:44311/padres/${id}`);
      fetchParents();
    } catch (error) {
      console.error('Error al eliminar el padre:', error);
    }
  };

  const handleAddStudentToParent = async (parentId) => {
    try {
      const newStudentWithParent = { ...newStudent, padreId: parentId };
      await axios.post(`https://localhost:44311/estudiantes`, newStudentWithParent);
      fetchStudents();
      setNewStudent({ nombre: '', apellido: '', fechaNacimiento: '' });
    } catch (error) {
      console.error('Error al agregar el estudiante al padre:', error);
    }
  };

  const handleDeleteStudentFromParent = async (studentId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este estudiante?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`https://localhost:44311/estudiantes/${studentId}`);
      fetchStudents();
    } catch (error) {
      console.error('Error al eliminar el estudiante del padre:', error);
    }
  };

  const handleEditParent = (parent) => {
    setNewParent({ nombre: parent.nombre, apellido: parent.apellido, correo: parent.correo, contrasena: '', rolId: parent.rolId });
    setSelectedParentId(parent.id);
    setSelectedUserId(parent.usuarioId);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Link to="/admin/inicio_a" className="btn btn-secondary mb-4">Regresar</Link>
        </div>
      </div>

      <h1 className="mt-4 mb-4">Gestor de Padres</h1>

      <div className="mb-4">
        <h2>Agregar / Actualizar Padre</h2>
        <form onSubmit={!selectedParentId ? handleAddParent : handleUpdateParent}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Nombre"
            value={newParent.nombre}
            onChange={(e) => setNewParent({ ...newParent, nombre: e.target.value })}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Apellido"
            value={newParent.apellido}
            onChange={(e) => setNewParent({ ...newParent, apellido: e.target.value })}
          />
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Correo"
            value={newParent.correo}
            onChange={(e) => setNewParent({ ...newParent, correo: e.target.value })}
            autoComplete="off"
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Contraseña"
            value={newParent.contrasena}
            onChange={(e) => setNewParent({ ...newParent, contrasena: e.target.value })}
            autoComplete="off"
          />
          {!selectedParentId ? (
            <button type="submit" className="btn btn-primary mr-2">Agregar Padre</button>
          ) : (
            <>
              <button type="submit" className="btn btn-warning mr-2">Actualizar Padre</button>
              <button type="button" className="btn btn-secondary" onClick={() => { 
                setSelectedParentId(null); 
                setSelectedUserId(null);
                resetFields(); // Resetea los campos al cancelar la edición
              }}>Cancelar</button>
            </>
          )}
        </form>
      </div>

      <h2>Lista de Padres</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {parents.map(parent => (
            <tr key={parent.id}>
              <td>{parent.id}</td>
              <td>{parent.nombre}</td>
              <td>{parent.apellido}</td>
              <td>{parent.correo}</td>
              <td>
                <button className="btn btn-secondary mr-2" onClick={() => handleEditParent(parent)}>Editar</button>
                <button className="btn btn-danger mr-2" onClick={() => handleDeleteParent(parent.id)}>Eliminar</button>
                <button className="btn btn-info" onClick={() => setSelectedParentId(parent.id)}>Gestionar Estudiantes</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedParentId && (
        <div className="mt-4">
          <h2>Gestionar Estudiantes para ID de Padre: {selectedParentId}</h2>
          <div>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Nombre"
              value={newStudent.nombre}
              onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Apellido"
              value={newStudent.apellido}
              onChange={(e) => setNewStudent({ ...newStudent, apellido: e.target.value })}
            />
            <input
              type="date"
              className="form-control mb-2"
              placeholder="Fecha de Nacimiento"
              value={newStudent.fechaNacimiento}
              onChange={(e) => setNewStudent({ ...newStudent, fechaNacimiento: e.target.value })}
            />
            <button className="btn btn-primary" onClick={() => handleAddStudentToParent(selectedParentId)}>Agregar Estudiante</button>
          </div>
          <h3 className="mt-4">Lista de Estudiantes</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha de Nacimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(student => student.padreId === selectedParentId)
                .map(student => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.nombre}</td>
                    <td>{student.apellido}</td>
                    <td>{student.fechaNacimiento}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDeleteStudentFromParent(student.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentsManager;
