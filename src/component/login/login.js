import React, { useState } from "react";
import '../register/register.css'
import { useHistory } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Login(){
   const [loginMode,setLoginMode] = useState('password')
   const [loginName,setLoginName]=useState('')
   const [loginPassword,setLoginPassword]=useState('')
   const [loginCode,setLoginCode]=useState('')
   const [loginNameErr,setLoginNameErr]=useState(false)
   const [loginPasswordErr,setPasswordErr]=useState(false)
   const [loginCodeErr,setLoginCodeErr]=useState(false)
   const [incorrectErr,setincorrectErr]=useState(false)
   const [message,setMessage]=useState('')
   const [loading,setLoading] = useState(false)
   const [sendingCode,setSendingCode] = useState(false)
   const [codeSent,setCodeSent] = useState(false)
   const history=useHistory()

   function resetErrorState() {
      setLoginNameErr(false)
      setPasswordErr(false)
      setLoginCodeErr(false)
      setincorrectErr(false)
   }

   function switchMode(mode) {
      setLoginMode(mode)
      setLoginPassword('')
      setLoginCode('')
      setCodeSent(false)
      setMessage('')
      resetErrorState()
   }

   async function requestLoginCode() {
      setMessage('')
      setincorrectErr(false)

      if(loginName.trim().length===0){
         setLoginNameErr(true)
         return;
      }

      try {
         setSendingCode(true)
         const response = await fetch(`${API_BASE_URL}/api/auth/login/email/request-code`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: loginName,
            }),
         })

         const data = await response.json().catch(() => ({}))
         if (!response.ok) {
            setincorrectErr(true)
            setMessage(data.error || 'Unable to send code')
            return
         }

         setCodeSent(true)
         setMessage(data.message || 'Code sent to your email')
      } catch (error) {
         console.error('Request code failed', error)
         setincorrectErr(true)
         setMessage('Unable to send code right now')
      } finally {
         setSendingCode(false)
      }
   }

   async function Loginvalidation() { 
      resetErrorState()
      setMessage('')

      if(loginName.trim().length!==0){
         setLoginNameErr(false)
      }
      else { 
         setLoginNameErr(true)
      }

      if(loginMode === 'password') {
         if(loginPassword.trim().length!==0){
            setPasswordErr(false)
         }
         else { 
            setPasswordErr(true)
         }
      } else {
         if(loginCode.trim().length!==0){
            setLoginCodeErr(false)
         }
         else {
            setLoginCodeErr(true)
         }
      }

      if(loginMode === 'password' && (loginName.trim().length===0 || loginPassword.trim().length===0)){
         return;
      }

      if(loginMode === 'code' && (loginName.trim().length===0 || loginCode.trim().length===0)){
         return;
      }

      try {
         setLoading(true);
         setincorrectErr(false);

         const endpoint = loginMode === 'password'
            ? `${API_BASE_URL}/api/auth/login`
            : `${API_BASE_URL}/api/auth/login/email/verify-code`;

         const payload = loginMode === 'password'
            ? {
               email: loginName,
               password: loginPassword,
            }
            : {
               email: loginName,
               code: loginCode,
            };

         const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
         });

         const data = await response.json().catch(() => ({}));
         if (!response.ok) {
            setincorrectErr(true);
            setMessage(data.error || 'Login failed');
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
         setMessage('Login failed');
      } finally {
         setLoading(false);
      }
   }
   return(
      <div className="login-body">
         <div className="login-main">
            <h1>Login </h1>
            <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'10px'}}>
               <button type='button' onClick={() => switchMode('password')} disabled={loading || sendingCode}>
                  Password Login
               </button>
               <button type='button' onClick={() => switchMode('code')} disabled={loading || sendingCode}>
                  Email Code Login
               </button>
            </div>
            {incorrectErr&& <small style={{color:'red',textAlign:'center'}}>{message || 'Enter valid login details'}</small>}
            {!incorrectErr && message && <small style={{color:'#1a7f37',textAlign:'center'}}>{message}</small>}
            <br />
            <p>Email</p>
            <input type='text' value={loginName} onChange={(e)=>{setLoginName(e.target.value)}}></input>
            {loginNameErr&& <small  style={{color:'#d3521d'}}>Please enter the Username</small>}
            <br />
            {loginMode === 'password' && (
               <>
                  <p>Password</p>
                  <input type='password' value={loginPassword} onChange={(e)=>{setLoginPassword(e.target.value)}}></input>
                  {loginPasswordErr&& <small  style={{color:'#d3521d'}}>Please enter the password </small>}
               </>
            )}
            {loginMode === 'code' && (
               <>
                  <p>One-Time Code</p>
                  <input type='text' value={loginCode} onChange={(e)=>{setLoginCode(e.target.value)}}></input>
                  {loginCodeErr&& <small  style={{color:'#d3521d'}}>Please enter the login code</small>}
                  <br />
                  <button type='button' onClick={requestLoginCode} disabled={sendingCode || loading}>
                     {sendingCode ? 'Sending code...' : (codeSent ? 'Resend code' : 'Send code')}
                  </button>
               </>
            )}
            <br />
            <button onClick={Loginvalidation} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button><br />
            <a href="/register" style={{marginTop:'10px',display:'inline-block'}}>Doesn't have an account yet? Sign up</a>
         </div>
      </div>
   )
}
export default Login