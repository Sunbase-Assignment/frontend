import React,{useState,useContext,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import UserContext from '../../Context/UserContext';
import "./style.css"

const AddCustomer = () => {
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        email: '',
        phone: '',
        street:''
    });

    let {firstName,lastName,address,city,state,email,phone,street} = customer;

    const {token,setToken} = useContext(UserContext);
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

    function updateInput(e){
        let x = e.target.name
        setCustomer({...customer,  [x]: e.target.value})
    }

    async function handleSubmit(e){
        e.preventDefault();
        console.log(token);
        try {
            
            fetch('http://localhost:8080/customer/createCustomer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name:firstName,
                    last_name:lastName,
                    address,
                    city,
                    state,
                    email,
                    phone,
                    street
                })
            })
            .then((res)=>{
                console.log(res)
                setCustomer({firstName: '', lastName: '', address: '', city: '', state: '', email: '', phone: '', street:''})
                alert("Customer added Successfully")
                navigate("/dashboard")
            })
            .catch((err)=>alert(err));
        } catch (error) {
            alert(error);
        }
     }

     function handleCancel(){
        setCustomer({firstName: '', lastName: '', address: '', city: '', state: '', email: '', phone: '', street:''})
        navigate("/dashboard");
     }


  return (
    <div className='add-customer-page'>
        <form className='add-customer-form' onSubmit={handleSubmit}>
            <h1>Add Customer</h1>
            <div className='input-wrapper'>
                <div className='form-sides'>
                    <input type='text' placeholder='Firstname' name='firstName' onChange={updateInput} value={firstName}/>
                    <input type='text' placeholder='Street' name='street' onChange={updateInput} value={street}/>
                    <input type='text' placeholder='City'name='city' onChange={updateInput} value={city}/>
                    <input type='text' placeholder='Email' name='email' onChange={updateInput} value={email}/>
                </div>
                <div className='form-sides'>
                    <input type='text' placeholder='lastname' name='lastName' onChange={updateInput} value={lastName}/>
                    <input type='text' placeholder='Address' name='address' onChange={updateInput} value={address}/>
                    <input type='text' placeholder='State' name='state' onChange={updateInput} value={state}/>
                    <input type='text' placeholder='Phone'name='phone' onChange={updateInput} value={phone}/>
                </div>
            </div>
            <div className='btns'>
            <button className='save-btn cancel' onClick={handleCancel}>Cancel</button>
            <button className='save-btn save' type='submit'>Save</button>
            </div>
        </form>
    </div>
  )
}

export default AddCustomer