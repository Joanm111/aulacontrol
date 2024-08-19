import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './home'
import Login from './login'
import InicioA from './admin/inicio_a'
import './App.css'
import { useEffect, useState } from 'react'
import InicioPro from './profesores/inicio_pro'
import InicioPa from './padres/inicio_pa'
import ParentsManager from './admin/padres';
import TeachersManager from './admin/profesores';
import CoursesManager from './admin/cursos';
import MateriasPRO from './profesores/Mis_materias';
import ForoPRO from './profesores/foro';
import ChatPRO from './profesores/chatPadres';
import ChatPA from './padres/chatPRO';
import HijosPa from './padres/Mis_hijos';
import ForoPa from './padres/foroPa';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('');


  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setEmail={setEmail} />} />

          <Route
            path="/admin/inicio_a"
            element={<InicioA email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
                   <Route
            path='/padres/inicio_pa'
            element={<InicioPa email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

               
              <Route
            path='/profesores/inicio_pro'
            element={<InicioPro email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

            <Route
            path="/admin/padres"
            element={<ParentsManager email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}

          />
            <Route
            path="/admin/profesores"
            element={<TeachersManager email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

            <Route
            path="/admin/cursos"
            element={<CoursesManager email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
-------------------------------------------------------------------------------------------------------------
          <Route
            path="/profesores/foro"
            element={<ForoPRO email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

          <Route
            path="/profesores/Mis_materias"
            element={<MateriasPRO email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

          <Route
            path="/profesores/chatPadres"
            element={<ChatPRO email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

          <Route
            path="/padres/chatPRO"
            element={<ChatPA email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

          <Route
            path="/padres/Mis_hijos"
            element={<HijosPa email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />

        <Route
            path="/padres/foroPa"
            element={<ForoPa email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />






        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App