import React from 'react'
import LogIn from './Components/LogInComponent/Login'
import { Route,Routes } from 'react-router-dom'
import DashBoard from './Components/Dashboard/Dashboard'
import AddCustomer from './Components/AddCustomer/AddCustomer'
import EditCustomer from './Components/EditCustomer/EdditCustomer'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogIn/>}/>
        <Route path="/dashboard" element={<DashBoard/>}/>
        <Route path="/addCustomer" element={<AddCustomer/>}/>
        <Route path="/editCustomer" element={<EditCustomer/>}/>
      </Routes> 
    </>
  )
}

export default App