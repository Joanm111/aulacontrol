import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './chat.css';

const ChatPRO = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const userEmail = localStorage.getItem('userEmail');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (selectedChat && selectedChat.chatId) {
      fetchMessages(selectedChat.chatId);
      const intervalId = setInterval(() => {
        fetchMessages(selectedChat.chatId);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchParentData = async () => {
    try {
      const usersResponse = await axios.get('https://localhost:44311/usuarios');
      const user = usersResponse.data.find(u => u.correo === userEmail);

      if (user) {
        setUserId(user.id);

        const [parentsResponse, studentsResponse, teachersResponse, chatsResponse, gradesResponse, materiasResponse] = await Promise.all([
          axios.get('https://localhost:44311/padres'),
          axios.get('https://localhost:44311/estudiantes'),
          axios.get('https://localhost:44311/profesors'),
          axios.get('https://localhost:44311/Chats'),
          axios.get('https://localhost:44311/Grado'),
          axios.get('https://localhost:44311/Materium')
        ]);

        const parent = parentsResponse.data.find(p => p.usuarioId === user.id);

        if (parent) {
          const parentStudents = studentsResponse.data.filter(student => student.padreId === parent.id);
          setStudents(parentStudents);

          const teachersMap = {};
          for (const student of parentStudents) {
            const gradeTeachers = teachersResponse.data.filter(teacher => teacher.gradoId === student.gradoId);
            const gradeName = gradesResponse.data.find(grade => grade.id === student.gradoId)?.nombre || 'Desconocido';

            teachersMap[student.gradoId] = await Promise.all(
              gradeTeachers.map(async (teacher) => {
                let existingChat = chatsResponse.data.find(chat => chat.profesorId === teacher.id && chat.padreId === parent.id);

                if (!existingChat) {
                  const newChatData = {
                    profesorId: teacher.id,
                    padreId: parent.id,
                    mensajeChats: []
                  };
                  const chatResponse = await axios.post('https://localhost:44311/Chats', newChatData);
                  existingChat = chatResponse.data;
                }

                const materia = materiasResponse.data.find(materia => materia.profesorId === teacher.id)?.nombre || 'Sin materia asignada';
                return {
                  ...teacher,
                  chatId: existingChat.id,
                  gradoNombre: gradeName,
                  materiaNombre: materia,
                };
              })
            );
          }

          setTeachers(teachersMap);
        }
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`https://localhost:44311/MensajeChats?chatId=${chatId}`);
      const filteredMessages = response.data.filter(message => message.chatId === chatId);
      setMessages(filteredMessages);
      if (autoScroll) {
        scrollToBottom(); // Desplazarse automáticamente si está habilitado
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const chatId = selectedChat.chatId;

      const newMessageData = {
        chatId,
        remitenteId: userId,
        mensaje: newMessage,
        fecha: new Date().toISOString().split('T')[0],
        leido: true
      };

      await axios.post('https://localhost:44311/MensajeChats', newMessageData);
      setNewMessage('');
      fetchMessages(chatId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectChat = (teacher) => {
    setSelectedChat(selectedChat && selectedChat.id === teacher.id ? null : teacher);
    setAutoScroll(true);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

    if (scrollTop + clientHeight < scrollHeight - 10) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true); // Reactivar el scroll automático si está en el fondo
    }
  };

  return (
    <div className="container">
      <div className="chat-container mt-5">
        <div className="mb-3">
          <Link to="/padres/inicio_pa" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Regresar
          </Link>
        </div>
        <h2 className="text-center mb-4">Chat con Profesores</h2>
        <div className="d-flex">
          <div className="parent-list panel">
            {students.length === 0 ? (
              <p>No hay estudiantes disponibles</p>
            ) : (
              Object.keys(teachers).map(gradoId => (
                <div key={gradoId}>
                  <h3 className="panel-header">{teachers[gradoId][0]?.gradoNombre}</h3>
                  <ul className="list-group">
                    {teachers[gradoId].map((teacher) => (
                      <li
                        key={teacher.id}
                        className={`list-group-item ${selectedChat && selectedChat.id === teacher.id ? 'active' : ''}`}
                        onClick={() => handleSelectChat(teacher)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          {teacher.nombre} {teacher.apellido}
                          <br />
                          <small className="text-muted">{teacher.materiaNombre}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {selectedChat && (
            <div className="chat-box panel">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="panel-header">Chat con {selectedChat.nombre} {selectedChat.apellido}</h3>
                <button onClick={handleCloseChat} className="btn btn-danger">
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                  Cerrar Chat
                </button>
              </div>
              <div
                className="messages"
                onScroll={handleScroll}
                ref={messagesContainerRef}
              >
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.remitenteId === userId ? 'sent' : 'received'}`}>
                    <span className="message-date">{message.fecha}</span>
                    <div className="message-content">
                      <p>{message.mensaje}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="form-control"
                />
                <button onClick={handleSendMessage} className="btn btn-primary send-button">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPRO;
