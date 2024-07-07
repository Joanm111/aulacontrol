import React from 'react'
import { Router, useNavigate } from 'react-router-dom'
import Login from './login'
import InicioA from './inicio_a'
const Home = (props) => {
  const { loggedIn, email } = props
  const navigate = useNavigate()

  const onButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem('user')
      props.setLoggedIn(false)
    } else {
      navigate('/login')
    }
  }

  return (
    <div 
    
    className="mainContainer" 
    style={{ 
      backgroundImage: 'url(https://img.freepik.com/foto-gratis/pila-libros-3d_23-2151103675.jpg?t=st=1719344567~exp=1719348167~hmac=2eb095c836aadb49774acde5fd3bb34234c4c5261fc6f393a9aea980e34267f0&w=1060)', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh'
    }}
  >
      <div style={{
        color:'WHITE',
        height: '8vh', }}
      
      className={'titleContainer'}>
        <div >AulaControl</div>
      </div>

      <div className={'buttonContainer'}>
        <input
          className={'inputButton'}
          type="button"
          onClick={onButtonClick}
          value={loggedIn ? 'Log out' : 'Log in'}
        />
        {loggedIn ? <div>Your email address is {email}</div> : <div />}
      </div>
    </div>
  )
}

export default Home