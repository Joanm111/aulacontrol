import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheckCircle, faQuestionCircle, faTrash, faArrowLeft, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './foro.css';
const ForoPRO = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [grades, setGrades] = useState({});
  const [teachers, setTeachers] = useState({});
  const [parents, setParents] = useState({});
  const [user, setUser] = useState({});
  const [userId, setUserId] = useState(null);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchTopics();
    fetchGrades();
    fetchTeachers();
    fetchParents();
    fetchUser();

    if (selectedTopic) {
      const intervalId = setInterval(() => {
        fetchComments(selectedTopic);
      }, 5000); // Polling every 5 seconds

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [selectedTopic]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('https://localhost:44311/Foroes');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('https://localhost:44311/grado');
      const gradesMap = {};
      response.data.forEach(grade => {
        gradesMap[grade.id] = grade.nombre;
      });
      setGrades(gradesMap);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('https://localhost:44311/profesors');
      const teachersMap = {};
      response.data.forEach(teacher => {
        teachersMap[teacher.usuarioId] = `${teacher.nombre} ${teacher.apellido}`;
      });
      setTeachers(teachersMap);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await axios.get('https://localhost:44311/padres');
      const parentsMap = {};
      response.data.forEach(parent => {
        parentsMap[parent.usuarioId] = `${parent.nombre}`;
      });
      setParents(parentsMap);
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('https://localhost:44311/usuarios');
      const user = response.data.find(u => u.correo === userEmail);
      if (user) {
        setUser(user);
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const newTopicData = {
        titulo: newTopic,
        gradoId: 1, // Reemplazar con el valor dinámico real
        profesorId: 1, // Reemplazar con el valor dinámico real
      };
      await axios.post('https://localhost:44311/Foroes', newTopicData);
      setNewTopic('');
      fetchTopics(); // Actualizar la lista de temas
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const fetchComments = async (topicId) => {
    try {
      const response = await axios.get(`https://localhost:44311/ComentarioForoes?foroId=${topicId}`);
      setComments(response.data);
      setSelectedTopic(topicId);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateComment = async () => {
    try {
      const newCommentData = {
        foroId: selectedTopic,
        usuarioId: userId,
        comentario: newComment,
        fecha: new Date().toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
      };
      await axios.post('https://localhost:44311/ComentarioForoes', newCommentData);
      setNewComment('');
      fetchComments(selectedTopic); // Actualizar la lista de comentarios
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      // Obtener los comentarios del tema para obtener sus IDs
      const response = await axios.get(`https://localhost:44311/ComentarioForoes?foroId=${topicId}`);
      const commentIds = response.data.map(comment => comment.id);

      // Eliminar cada comentario individualmente
      await Promise.all(commentIds.map(commentId =>
        axios.delete(`https://localhost:44311/ComentarioForoes/${commentId}`)
      ));

      // Finalmente, eliminar el tema
      await axios.delete(`https://localhost:44311/Foroes/${topicId}`);

      fetchTopics(); // Actualizar la lista de temas
      setSelectedTopic(null); // Limpiar selectedTopic para ocultar los comentarios
    } catch (error) {
      console.error('Error deleting topic and comments:', error);
    }
  };

  const handleCloseComments = () => {
    setSelectedTopic(null); // Limpiar selectedTopic para ocultar los comentarios
  };

  const getUserName = (usuarioId) => {
    if (usuarioId === userId) {
      return 'yo';
    } else if (parents[usuarioId]) {
      return `Usuario: ${parents[usuarioId]}`;
    } else if (teachers[usuarioId]) {
      return `profesor: ${teachers[usuarioId]}`;
    } else {
      return 'Desconocido';
    }
  };

  return (
    <div className="container">
      <div className="forum-container mt-5">
        <div className="mb-3">
          <Link to="/profesores/inicio_pro" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Regresar
          </Link>
        </div>
        <h2 className="text-center mb-4">Foro</h2>
        <div className="create-topic mb-4">
          <h3>Crear Nuevo Tema</h3>
          <div className="input-group">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="form-control"
              placeholder="Ingrese el título del tema"
            />
            <div className="input-group-append">
              <button onClick={handleCreateTopic} className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Crear Tema
              </button>
            </div>
          </div>
        </div>

        <div className="topic-list mb-4">
          <h3>Temas Actuales</h3>
          <ul className="list-group">
            {topics.map((topic) => (
              <li key={topic.id} className="list-group-item">
                <h4 className="topic-title">{topic.titulo}</h4>
                <p className="topic-details">Creado por: {teachers[topic.profesorId]}</p>
                <p className="topic-details">Grado: {grades[topic.gradoId]}</p>
                <div className="btn-group mr-2" role="group">
                  <button onClick={() => fetchComments(topic.id)} className="btn btn-info">
                    <FontAwesomeIcon icon={faQuestionCircle} className="mr-1" />
                    Ver Comentarios
                  </button>
                </div>
                <div className="btn-group" role="group">
                  <button onClick={() => handleDeleteTopic(topic.id)} className="btn btn-danger">
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedTopic && (
          <div className="comments-section">
            <div className="d-flex justify-content-between mb-3">
              <h3>Comentarios</h3>
              <button onClick={handleCloseComments} className="btn btn-danger">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                Cerrar Comentarios
              </button>
            </div>
            <ul className="list-group mb-4">
              {comments.map((comment) => (
                <li key={comment.id} className={`list-group-item ${comment.usuarioId === userId ? 'text-right' : 'text-left'}`}>
                  <div className={`d-flex ${comment.usuarioId === userId ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                    <p className="mb-0"><strong>{getUserName(comment.usuarioId)}</strong></p>
                  </div>
                  <p className={`comment-content ${comment.usuarioId === userId ? 'bg-primary text-white p-2 rounded' : 'bg-light p-2 rounded'}`}>
                    {comment.comentario}
                  </p>
                  <div className={`d-flex ${comment.usuarioId === userId ? 'justify-content-start' : 'justify-content-end'} mb-2`}>
                    <p className="mb-0">{comment.fecha}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="create-comment">
              <h4>Agregar Comentario</h4>
              <div className="input-group mb-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Escribe tu comentario aquí"
                />
                <div className="input-group-append">
                  <button onClick={handleCreateComment} className="btn btn-success" type="button">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Agregar Comentario
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForoPRO;
