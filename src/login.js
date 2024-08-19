import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Login = ({ setEmail, setLoggedIn }) => {
  const [localEmail, setLocalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [redirect, setRedirect] = useState(null);

  const onButtonClick = () => {
    let valid = true;

    if (!localEmail) {
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
        Correo: localEmail,
        Contrasena: password,
      };

      const url = "https://localhost:44311/Usuarios/login";
      axios.post(url, data)
        .then((result) => {
          // Guardar el correo electrónico del usuario en localStorage
          localStorage.setItem('userEmail', localEmail);
          setEmail(localEmail);
          setLoggedIn(true);

          // Redirigir según el rol del usuario
          switch (result.data.rolId) {
            case 1:
              setRedirect('/admin/inicio_a');
              break;
            case 3:
              setRedirect('/padres/inicio_pa');
              break;
            case 2:
              setRedirect('/profesores/inicio_pro');
              break;
            default:
              setRedirect('/'); // Redirigir a la página por defecto si no hay un caso definido
              break;
          }

          setPassword('');
        })
        .catch((error) => {
          console.log(error);
          if (error.response && error.response.status === 404) {
            alert('Correo o contraseña incorrectos');
            setPassword('');
          } else {
            alert('Error: ' + error.message);
          }
        });
    }
  };

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
          value={localEmail}
          placeholder="Enter your email here"
          onChange={(ev) => setLocalEmail(ev.target.value)}
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
