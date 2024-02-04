import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import "./style.css"

const DashBoard = ()=>{

    const[customerList,setcustomerList] = useState([]);
    const[selectedValue,setSelectedValue] = useState('');
    const[searchTerm,setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const {token,setToken} = useContext(UserContext);
    const {setEditCustomer} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(()=>{
        if(token === ""){
            let token_from_local_storage = localStorage.getItem("token");
            if(token_from_local_storage){
                setToken(token_from_local_storage);
            }else{
                navigate("/")
            }
        }
    },[])

    useEffect(()=>{
        getCustomerList();
    });

    async function getCustomerList(){

        try {
            
            fetch(`http://localhost:8080/customer/listOfCustomers?page=${currentPage}&searchBy=${selectedValue}&searchTerm=${searchTerm}&size=5`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                }})
            .then(res => res.json())
            .then(res=>(
                setcustomerList(res.content),
                setTotalPages(res.totalPages)
            ));
        } catch (error) {
            alert(error);
        }
     }

     function handleEdit(customer){
        setEditCustomer(customer)
        navigate("/editCustomer");
     }

     async function handleDelete(id){
        console.log(id);
        console.log(token);
        try {
            
            fetch(`http://localhost:8080/customer/deleteCustomer?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                }
            })
            .then((res)=>{

                console.log(res);
                getCustomerList();
            });
        } catch (error) {
            alert(error);
        }
     }

     function handlelogOut(){
        setToken('');
        localStorage.removeItem("token");
        navigate("/");
     }

     function handlePageChange(pageNo){
        setCurrentPage(pageNo);
     }

     async function handleSync(){
        try {

            const authResponse = await fetch('https://qa.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp',{
                                method: 'POST',
                                headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                                    "Access-Control-Allow-Credentials":"true",
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "login_id": "test@sunbasedata.com",
                                    "password": "Test@123"
                                }),
                             });
            const accessToken = await authResponse.json();
            console.log(accessToken);

            const dataResponse = await fetch('https://qa.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list?',{
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                                    'Authorization': `Bearer ${accessToken.access_token}`
                                }
                             });

            const data = await dataResponse.json();
    
            await fetch('http://localhost:8080/customer/addListOfDataToDb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
    
            console.log('Data added to the database successfully');
            alert("Data synced successfully");
        } catch (error) {
            console.error(error);
        }
     }

 

    return(
        <div className='customer-list-page'>
            <h1>Customer List</h1>
            <div className='options'>
                <button className='customer-btn' onClick={()=>(navigate("/addCustomer"))}>Add Customer</button>
                <select className='customer-btn' value={selectedValue} onChange={(e)=> setSelectedValue(e.target.value)} >
                    <option value="" disabled selected hidden>Search by</option>
                    <option value='firstname'>firstname</option>
                    <option value='city'>city</option>
                    <option value='email'>email</option>
                    <option value='phone'>phone</option>  
                </select>
                <input 
                type='text' 
                placeholder='search' 
                value={searchTerm} 
                onChange={(e)=>setSearchTerm(e.target.value)}
                disabled ={selectedValue?false:true}
                className='customer-btn'
                />
                <button className='customer-btn' onClick={handleSync}>Sync</button>
            </div>
            <table border={1} className='table'>
                <thead>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Address</th>
                    <th>Street</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Action</th>
                </thead>
                <tbody>
                {
                    customerList.length > 0 && customerList.map((customer)=>(
                        <tr key={customer.uuid}>
                            <td>{customer.firstname}</td>
                            <td>{customer.lastname}</td>
                            <td>{customer.address}</td>
                            <td>{customer.street}</td>
                            <td>{customer.city}</td>
                            <td>{customer.state}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                            <td className='actions'>
                                <button onClick={()=>(handleEdit(customer))}>Edit</button>
                                <button onClick={()=>(handleDelete(customer.uuid))}>Delete</button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            <div>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                <button key={index + 1} onClick={() => handlePageChange(index)}>
                    {index+1}
                </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages-1}>
                Next
                </button>
           </div>

            <button onClick={handlelogOut}>LogOut</button>  
        </div>
    )
}


export default DashBoard;