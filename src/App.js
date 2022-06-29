import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import Dashbord from './pages/Dashbord'
import Cache from './pages/Cache'

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/admin/login" component={Login}/>
                <Route exact path="/admin/cadastro" component={Cadastro}/>
                <Route exact path="/admin/dashbord" component={Dashbord}/>
                <Route exact path="/cache" component={Cache}/>
            </Switch>
        </BrowserRouter>
    )
}

export default App
