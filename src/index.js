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
import ParentsManager from './admin/padres';
import TeachersManager from './admin/profesores'
import CoursesManager from './admin/cursos'
import MateriasPRO from './profesores/Mis_materias';
import ForoPRO from './profesores/foro';
import ChatPRO from './profesores/chatPadres';
import ChatPA from './padres/chatPRO';
import HijosPa from './padres/Mis_hijos';
import ForoPa from './padres/foroPa';
import 'bootstrap/dist/css/bootstrap.min.css';


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
</React.StrictMode>,
<React.StrictMode>
  <ParentsManager/>
</React.StrictMode>,
<React.StrictMode>
  <TeachersManager/>
</React.StrictMode>,
<React.StrictMode>
  <CoursesManager/>
</React.StrictMode>,

<React.StrictMode>
  <MateriasPRO/>
</React.StrictMode>,
<React.StrictMode>
  <ForoPRO/>
</React.StrictMode>,
<React.StrictMode>
  <ChatPRO/>
</React.StrictMode>,
<React.StrictMode>
  <ChatPA/>
</React.StrictMode>,
<React.StrictMode>
  <HijosPa/>
</React.StrictMode>,
<React.StrictMode>
  <ForoPa/>
</React.StrictMode>

);


reportWebVitals();
