import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from './home';
import Login from './login';
import InicioA from './admin/inicio_a';
import InicioPa from './padres/inicio_pa';
import InicioPro from './profesores/inicio_pro';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
   <React.StrictMode>
   <Home />
 </React.StrictMode>,
  <React.StrictMode>
  <Login />
</React.StrictMode>,
<React.StrictMode>
  <InicioA/>
</React.StrictMode>,
<React.StrictMode>
  <InicioPa/>
</React.StrictMode>,
<React.StrictMode>
  <InicioPro/>
</React.StrictMode>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
