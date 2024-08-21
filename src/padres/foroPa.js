import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './foro.css';

const ForoPa = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [parents, setParents] = useState({});
  const [teachers, setTeachers] = useState({});
  const [userId, setUserId] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchParentsTeachersAndTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const intervalId = setInterval(() => {
        fetchComments(selectedTopic);
      }, 5000); 

      return () => clearInterval(intervalId); 
    }
  }, [selectedTopic]);

  const fetchParentsTeachersAndTopics = async () => {
    try {
      const [parentsResponse, teachersResponse, usersResponse, studentsResponse] = await Promise.all([
        axios.get('https://localhost:44311/padres'),
        axios.get('https://localhost:44311/profesors'),
        axios.get('https://localhost:44311/usuarios'),
        axios.get('https://localhost:44311/estudiantes'),
      ]);

      const user = usersResponse.data.find(u => u.correo === userEmail);
      if (user) {
        setUserId(user.id);
        const parent = parentsResponse.data.find(p => p.usuarioId === user.id);
        if (parent) {
          setParents(prev => ({ ...prev, [user.id]: parent.nombre }));

    
          const parentStudents = studentsResponse.data.filter(student => student.padreId === parent.id);
          const grades = parentStudents.map(student => student.gradoId);
          setStudentGrades(grades);

          
          const topicsResponse = await axios.get('https://localhost:44311/Foroes');
          const filteredTopics = topicsResponse.data.filter(topic => grades.includes(topic.gradoId));
          setTopics(filteredTopics);
        }
      }

      const parentsMap = {};
      const teachersMap = {};

      parentsResponse.data.forEach(parent => {
        parentsMap[parent.usuarioId] = parent.nombre;
      });

      teachersResponse.data.forEach(teacher => {
        teachersMap[teacher.usuarioId] = `${teacher.nombre} ${teacher.apellido}`;
      });

      setParents(parentsMap);
      setTeachers(teachersMap);

    } catch (error) {
      console.error('Error fetching data:', error);
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
        fecha: new Date().toISOString().split('T')[0],
      };
      await axios.post('https://localhost:44311/ComentarioForoes', newCommentData);
      setNewComment('');
      fetchComments(selectedTopic); 
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCloseComments = () => {
    setSelectedTopic(null);
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
          <Link to="/padres/inicio_pa" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Regresar
          </Link>
        </div>
        <h2 className="text-center mb-4">Foro</h2>

        <div className="topic-list mb-4">
          <h3>Temas Actuales</h3>
          <ul className="list-group">
            {topics.map((topic) => (
              <li key={topic.id} className="list-group-item">
                <h4 className="topic-title">{topic.titulo}</h4>
                <div className="btn-group mr-2" role="group">
                  <button onClick={() => fetchComments(topic.id)} className="btn btn-info">
                    Ver Comentarios
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
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="form-control"
                  placeholder="Ingrese su comentario"
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

export default ForoPa;
