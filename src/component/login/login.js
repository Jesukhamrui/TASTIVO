import React, { useState } from "react";
import '../register/register.css'
import { useHistory } from "react-router-dom";
function Login(){
   const [loginName,setLoginName]=useState('')
   const [loginPassword,setLoginPassword]=useState('')
   const [loginNameErr,setLoginNameErr]=useState(false)
   const [loginPasswordErr,setPasswordErr]=useState(false)
   const [incorrectErr,setincorrectErr]=useState(false)
   // ...existing code...
   const history=useHistory()
    function Loginvalidation() { 
         
             if(loginName.trim().length!==0){
                setLoginNameErr(false)
                }
                 else{ 
                setLoginNameErr(true)
                 }
                 if(loginPassword.trim().length!==0){
                    setPasswordErr(false)
                    }
                     else{ 
                        setPasswordErr(true)
                     }
   let register = JSON.parse(sessionStorage.getItem('user'));
   if (!register) {
      setincorrectErr(true);
      return;
   }
   if ((register.name !== loginName) || (register.password !== loginPassword)) {
      setincorrectErr(true);
   } else {
      setincorrectErr(false);
      history.push('/home');
   }
    
}
   return(
      <div className="login-body">
         <div className="login-main">
            <h1>Login </h1>
            {incorrectErr&& <small style={{color:'red',textAlign:'center'}}> Enter the correct username and password</small>}
            <br />
            <p>Name</p>
            <input type='text' value={loginName} onChange={(e)=>{setLoginName(e.target.value)}}></input>
            {loginNameErr&& <small  style={{color:'#d3521d'}}>Please enter the Username</small>}
            <br />
            <p>Password</p>
            <input type='password' value={loginPassword} onChange={(e)=>{setLoginPassword(e.target.value)}}></input>
            {loginPasswordErr&& <small  style={{color:'#d3521d'}}>Please enter the password </small>}
            <br />
            <button onClick={Loginvalidation}>Login</button><br />
            <a href="/register" style={{marginTop:'10px',display:'inline-block'}}>Doesn't have an account yet? Sign up</a>
         </div>
      </div>
   )
}
export default Login