import React, { Router,useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [redirect, setRedirect] = useState(null);

  const onButtonClick = () => {
    // Validaciones opcionales de email y password
    let valid = true;

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      const data = {
        Correo: email,
        Contrasena: password,
      };

      const url = "https://localhost:44311/Usuarios/login";
      axios.post(url, data)
        .then((result) => {

          // Redireccionar según el roleId
          switch (result.data.rolId) {
            case 1:
              setRedirect('/admin/inicio_a'); // Ruta para roleId 1
              break;
            case 2:
              setRedirect('/padres/inicio_pa'); // Ruta para roleId 2
              break;
            case 3:
              setRedirect('/profesores/inicio_pro'); // Ruta para roleId 3
              break;
          }

          // Reiniciar los campos después de la solicitud exitosa
         
          setPassword('');
        })
        .catch((error) => {
          console.log(error);
          if (error.response && error.response.status === 404) {
            alert('Correo o contraseña incorrectos');
            // Limpiar los campos en caso de error
           
            setPassword('');
          } else {
            alert('Error: ' + error.message);
          }
        });
    }
  };

  // Si hay una redirección programada, Navigate redirigirá automáticamente
  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div
      style={{
        backgroundImage: 'url(https://img.freepik.com/foto-gratis/pila-libros-3d_23-2151103675.jpg?t=st=1719344567~exp=1719348167~hmac=2eb095c836aadb49774acde5fd3bb34234c4c5261fc6f393a9aea980e34267f0&w=1060)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh'
      }}
      className={'mainContainer'}
    >
      <div className={'titleContainer'}>
        <div style={{ color: 'white' }}>Login</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          className={'inputBox'}
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input className={'inputButton'} type="button" onClick={onButtonClick} value={'Log in'} />
      </div>
    </div>
  );
};

export default Login;
