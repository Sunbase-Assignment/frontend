import React, { useState } from 'react';
import UserContext from './UserContext';

const UserProvider = (props)=>{

    const[token,setToken] = useState("");
    const[editCustomer,setEditCustomer] = useState({});

    return(
        <UserContext.Provider value={{token,setToken,editCustomer,setEditCustomer}}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserProvider;