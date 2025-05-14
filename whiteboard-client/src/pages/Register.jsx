//======= Register Page ======

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {ToastContainer} from 'react-toastify';
import { handleError, handleSuccess } from "../utils";

function Register(){

  const [registerInfo, setRegisterInfo ] = useState({
    name: '',
    email: '',
    password: ''
  })
  
  const navigate = useNavigate();
  const handleChange = (e)=>{
    const {name, value} = e.target;
    console.log(name,value);
    const copyRegisterInfo = {...registerInfo};
    copyRegisterInfo[name] = value;
    setRegisterInfo(copyRegisterInfo);
  }

  // console.log('loginInfo -> ', loginInfo)
  const handleRegister = async (e)=>{
    e.preventDefault();
    const {name, email, password} =registerInfo;
    if (!name || !email || !password){
      return handleError('name, email and password are required !')
    }
    try{
      const url = 'https://real-time-whiteboards-server-project.vercel.app/auth/register';
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerInfo)
      });
      const result = await response.json();
      const {success, message, error} = result;
      if(success){
        handleSuccess(message);
        setTimeout(()=>{
          navigate('/login')
        },1000)
      }else if (error){
        const details = error?.details[0].message;
        handleError(details);
      }else if(!success){
        handleError(message);
      }
      console.log(result);
    }catch ( err){
      handleError(err);
    }
  } 

  return(
    <div className="container"> 
      <h1>Register</h1>
      <form onSubmit={handleRegister} action="">
        <div>
          <label htmlFor="name">Name</label>
          <input onChange={handleChange} type="text" name="name" autoFocus placeholder=" Enter your name..." value={registerInfo.name}/>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input onChange={handleChange} type="email" name="email"  placeholder=" Enter your email..." value={registerInfo.email}/>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input onChange={handleChange} type="password" name="password"  placeholder=" Enter your password..." value={registerInfo.password} />
        </div>
        <button type="submit">Register</button>
        <span>Already have an account ? <Link to="/login">Login</Link>
        </span>
      </form>
      <ToastContainer/>
    </div>
  )
}

export default Register;
