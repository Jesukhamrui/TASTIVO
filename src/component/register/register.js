import React,{useState} from "react";
import { useHistory } from "react-router-dom";
import "../register/register.css"

const API_BASE_URL = "http://localhost:5000";

function Register(){
    const [username,setUsername]=useState('')
    const [email,setEmail]=useState('')
    const [password,setpassword]=useState('')
    const [nameErr,setnameErr]=useState(false)
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState('')
    const history=useHistory()

    async function registertration(){
        if((username.trim().length===0)||(password.trim().length===0)||(email.trim().length===0)){
                setnameErr(true)
                return;
        }
        else if(!email.includes('@') || !email.includes('.')){
            alert('please Enter valid email address')
            return;
        }
        else if(password.length<5){
            alert('please enter the password more than five characters')
            return;
        }

        try{
            setnameErr(false)
            setLoading(true)
            setError('')
            const response = await fetch(`${API_BASE_URL}/api/auth/register`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    name:username,
                    email,
                    password
                })
            })

            const data = await response.json().catch(()=> ({}));
            if(!response.ok){
                setError(data.error || 'Registration failed. Please try again.')
                return;
            }

            if(data.token && data.user){
                localStorage.setItem('token',data.token)
                localStorage.setItem('user',JSON.stringify(data.user))
            }

            history.push('/home')
        }catch(err){
            console.error('Registration failed',err)
            setError('Something went wrong. Please try again later.')
        }finally{
            setLoading(false)
        }
    }
    return(
        <div className="register-body">
        <div className="register-main">
            <h1>Register Form</h1>
            {nameErr&& <p className="errP">*please fill every input field*</p>}
            {error && <p className="errP">{error}</p>}
            <br />
            <p>Name</p>
            <input type='text' value={username} onChange={(e)=>{setUsername(e.target.value)}}></input>
            <br />
            <p>Email</p>
            <input type='text'value={email} onChange={(e)=>{setEmail(e.target.value)}}></input>
            <br />
            <p>Password</p>
            <input type='password'value={password} onChange={(e)=>{setpassword(e.target.value)}}></input>
            <br /><br />
            <button onClick={registertration} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </div>
        </div>
    )
}
export default Register