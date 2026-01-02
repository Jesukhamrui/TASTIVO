import React, { useEffect, useState } from "react";
import logo from '../image/food.png'
import cartimg from '../image/cart.jpg'
import '../header/header.css'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

function Header(){
    const {cartTotalQUantity}=useSelector((state)=>state.cart)
    let history=useHistory()
    const [currentUser,setCurrentUser] = useState(null)

    useEffect(()=>{
        const stored = localStorage.getItem('user');
        if(stored){
            try{
                setCurrentUser(JSON.parse(stored));
            }catch{
                setCurrentUser(null);
            }
        }else{
            setCurrentUser(null);
        }
    },[])
    function AddCart(){
        history.push('/cart')
    }
    function Profile(){
        history.push('/profile')
    }
    function gotoHome(){
        history.push('/home')
    }
    function Logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        history.push('/login')
    }
    return(
        <div className="header">
            <img src={logo} className='logo' alt="Tastivo logo"></img>
            <div><input type='text' className="search-input"/><button >Search</button></div>

            <div style={{position:'relative',width:'100px'}}><button className="cart-button" onClick={AddCart}><img  src={cartimg} alt="Cart"></img></button>
            <span className="msg"> {cartTotalQUantity}</span></div>
             {' '}
            <button className="cart-button" ><p style={{color:"white",marginTop:'12px'}} onClick={gotoHome}>Home</p></button>
            <button className="cart-button"  ><p style={{color:"white",marginTop:'12px'}} onClick={Profile}>Profile</p></button>  
            {currentUser && <span style={{color:'white',marginRight:'10px'}}>Hi, {currentUser.name}</span>}
            <button className="cart-button"  ><p style={{color:"white",marginTop:'12px'}} onClick={Logout}>Log out</p></button>  
        </div>
    )
}

export default Header