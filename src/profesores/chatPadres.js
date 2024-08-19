import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './chat.css';

const ChatPa = () => {
  const [parents, setParents] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profesorId, setProfesorId] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const userEmail = localStorage.getItem('userEmail');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchTeacherData();
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

  const fetchTeacherData = async () => {
    try {
      const usersResponse = await axios.get('https://localhost:44311/usuarios');
      const user = usersResponse.data.find(u => u.correo === userEmail);

      if (user) {
        const teachersResponse = await axios.get('https://localhost:44311/profesors');
        const teacher = teachersResponse.data.find(t => t.usuarioId === user.id);

        if (teacher) {
          setProfesorId(teacher.id);
          fetchParentsAndCreateChats(teacher.id, teacher.gradoId);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const fetchParentsAndCreateChats = async (profesorId, gradeId) => {
    try {
      const [parentsResponse, studentsResponse, chatsResponse] = await Promise.all([
        axios.get('https://localhost:44311/padres'),
        axios.get('https://localhost:44311/estudiantes'),
        axios.get('https://localhost:44311/Chats')
      ]);

      const parentStudents = studentsResponse.data.filter(student => student.gradoId === gradeId);
      const filteredParents = await Promise.all(parentsResponse.data
        .filter(parent => parentStudents.some(student => student.padreId === parent.id))
        .map(async parent => {
          let existingChat = chatsResponse.data.find(chat => chat.profesorId === profesorId && chat.padreId === parent.id);

          if (!existingChat) {
            const newChatData = {
              profesorId,
              padreId: parent.id,
              mensajeChats: []
            };
            const chatResponse = await axios.post('https://localhost:44311/Chats', newChatData);
            existingChat = chatResponse.data;
          }

          const studentsForParent = parentStudents
            .filter(student => student.padreId === parent.id)
            .map(student => `${student.nombre} ${student.apellido}`);

          return {
            ...parent,
            chatId: existingChat.id,
            studentNames: studentsForParent.join(', '),
          };
        }));

      setParents(filteredParents);
    } catch (error) {
      console.error('Error fetching parents and creating chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`https://localhost:44311/MensajeChats?chatId=${chatId}`);
      const filteredMessages = response.data.filter(message => message.chatId === chatId);
      setMessages(filteredMessages);
      if (autoScroll) {
        scrollToBottom();
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
        remitenteId: profesorId,
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

  const handleSelectChat = (parent) => {
    console.log('Selected Parent ID:', parent.id);
    setSelectedChat(selectedChat && selectedChat.id === parent.id ? null : parent);
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
      setAutoScroll(true);
    }
  };

  return (
    <div className="container">
      <div className="chat-container mt-5">
        <div className="mb-3">
          <Link to="/profesores/inicio_pro" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Regresar
          </Link>
        </div>
        <h2 className="text-center mb-4">Chat con Padres</h2>
        <div className="d-flex">
          <div className="parent-list panel">
            <h3 className="panel-header">Lista de Padres</h3>
            {parents.length === 0 ? (
              <p>No hay padres disponibles</p>
            ) : (
              <ul className="list-group">
                {parents.map((parent) => (
                  <li
                    key={parent.id}
                    className={`list-group-item ${selectedChat && selectedChat.id === parent.id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(parent)}
                    style={{ cursor: 'pointer' }}
                  >
                    {parent.nombre} {parent.apellido}
                    <br />
                    <small>Padre de: {parent.studentNames}</small>
                  </li>
                ))}
              </ul>
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
                  <div key={message.id} className={`message ${message.remitenteId === profesorId ? 'sent' : 'received'}`}>
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

export default ChatPa;
