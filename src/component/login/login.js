import React, { useState } from "react";
import '../register/register.css'
import { useHistory } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Login(){
   const [loginName,setLoginName]=useState('')
   const [loginPassword,setLoginPassword]=useState('')
   const [loginNameErr,setLoginNameErr]=useState(false)
   const [loginPasswordErr,setPasswordErr]=useState(false)
   const [incorrectErr,setincorrectErr]=useState(false)
   const [loading,setLoading] = useState(false)
   const history=useHistory()

   async function Loginvalidation() { 
      if(loginName.trim().length!==0){
         setLoginNameErr(false)
      }
      else { 
         setLoginNameErr(true)
      }
      if(loginPassword.trim().length!==0){
         setPasswordErr(false)
      }
      else { 
         setPasswordErr(true)
      }

      if(loginName.trim().length===0 || loginPassword.trim().length===0){
         return;
      }

      try {
         setLoading(true);
         setincorrectErr(false);
         const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: loginName,
               password: loginPassword,
            }),
         });

         const data = await response.json().catch(() => ({}));
         if (!response.ok) {
            setincorrectErr(true);
            return;
         }

         if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
         }

         history.push('/home');
      } catch (error) {
         console.error('Login failed', error);
         setincorrectErr(true);
      } finally {
         setLoading(false);
      }
   }
   return(
      <div className="login-body">
         <div className="login-main">
            <h1>Login </h1>
            {incorrectErr&& <small style={{color:'red',textAlign:'center'}}> Enter the correct username and password</small>}
            <br />
            <p>Email</p>
            <input type='text' value={loginName} onChange={(e)=>{setLoginName(e.target.value)}}></input>
            {loginNameErr&& <small  style={{color:'#d3521d'}}>Please enter the Username</small>}
            <br />
            <p>Password</p>
            <input type='password' value={loginPassword} onChange={(e)=>{setLoginPassword(e.target.value)}}></input>
            {loginPasswordErr&& <small  style={{color:'#d3521d'}}>Please enter the password </small>}
            <br />
            <button onClick={Loginvalidation} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button><br />
            <a href="/register" style={{marginTop:'10px',display:'inline-block'}}>Doesn't have an account yet? Sign up</a>
         </div>
      </div>
   )
}
export default Login