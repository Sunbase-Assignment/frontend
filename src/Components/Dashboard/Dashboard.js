
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

    console.log(searchTerm)
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
    },[searchTerm,currentPage,selectedValue]);

    async function getCustomerList(){
        
        try {
            console.log(`http://localhost:8080/customer/listOfCustomers?page=${searchTerm? 0 : currentPage}${selectedValue && searchTerm ? `&searchBy=${selectedValue}&searchTerm=${searchTerm}` : ''}&size=5`);
            fetch(`http://localhost:8080/customer/listOfCustomers?page=${searchTerm? 0 : currentPage}${selectedValue && searchTerm ? `&searchBy=${selectedValue}&searchTerm=${searchTerm}` : ''}&size=5`, {
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
        /* eslint-disable no-restricted-globals */
        let userConfirmed = confirm("Are you sure you want to delete this customer? Data will be permanently deleted");
        /* eslint-enable no-restricted-globals */

        if(userConfirmed){
            try {
            
                fetch(`http://localhost:8080/customer/deleteCustomer?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                    }
                })
                .then((res)=>{
    
                    console.log(res)
                    getCustomerList();
                });
            } catch (error) {
                alert(error);
            }
        }
        else{
            return;
        }
        

     }


     function handlelogOut(){
        setToken('');
        localStorage.removeItem("token");
        setSearchTerm('');
        setSelectedValue('');
        navigate("/");
     }

     function handlePageChange(pageNo){
        setCurrentPage(pageNo);
     }

     function handlePageChangeByPage(pageNo){
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
            console.log(error);
            alert(error)
        }
     }

 

    return(
        <div className='customer-list-page'>
            <h1>Customer List</h1>
            <div className='options'>
                <button className='customer-btn save' onClick={()=>(navigate("/addCustomer"))}>Add Customer</button>
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
                <button className='customer-btn sync' onClick={handleSync}>Sync</button>
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
                                <button className='cancel' onClick={()=>(handleEdit(customer))}>Edit</button>
                                <button className='delete' onClick={()=>(handleDelete(customer.uuid))}>X</button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            {
               customerList.length > 0 ? (
                <div className='pagenation'>
                    <button className= {currentPage === 0 ? 'disabled' : 'prev-next-btn'} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                    Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                    <button className={`page-btn ${index === currentPage ? 'active' : ''}`} key={index + 1} onClick={() => handlePageChangeByPage(index)}>
                        {index+1}
                    </button>
                    ))}
                    <button className={currentPage === totalPages-1 ? 'disabled' : 'prev-next-btn'} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages-1}>
                    Next
                    </button>
                </div>
               ) : (
                <p className='no-data'>No data found </p>
               )
            }

            <button className='log-out delete' onClick={handlelogOut}>LogOut</button>  
        </div>
    )
}


export default DashBoard;