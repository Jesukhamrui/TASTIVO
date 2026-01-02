import React from "react";
import Header from "../header/header";
import '../cart/cart.css'
import { useSelector,useDispatch } from "react-redux";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Footer from "../footer/footer";
import { addTocart, clearCartItem, decreaseCart, getTotals, removeCartItem } from "./cartslice";

const API_BASE_URL = "http://localhost:5000";
function Cart(){
    const history=useHistory()
    const cart=useSelector((state)=>state.cart)
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(getTotals())
    },[cart,dispatch])
    function detail(id){
        history.push(`/singledish?id=${id}`)
    }
    function remove(ele){
        dispatch(removeCartItem(ele))
    }
    function decrease(cartitem){
        dispatch(decreaseCart(cartitem))
    }
    function increase(cartItem){
        dispatch(addTocart(cartItem))
    }
    function clearcart(){
        dispatch(clearCartItem())
    }

    async function order(){
        if (cart.cartItems.length === 0) {
            alert('Your cart is currently empty');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            history.push('/login');
            return;
        }

        const items = cart.cartItems.map((cartItem) => ({
            dishId: cartItem.id,
            quantity: cartItem.cartQuantity,
        }));

        try {
            // Optional: validate cart prices and availability
            const validateResponse = await fetch(`${API_BASE_URL}/api/cart/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            if (!validateResponse.ok) {
                const errorData = await validateResponse.json().catch(() => ({}));
                alert(errorData.error || 'Failed to validate cart. Please try again.');
                return;
            }

            const validated = await validateResponse.json();

            // Create order
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ items }),
            });

            if (!orderResponse.ok) {
                if (orderResponse.status === 401) {
                    history.push('/login');
                    return;
                }
                const errorData = await orderResponse.json().catch(() => ({}));
                alert(errorData.error || 'Failed to place order. Please try again.');
                return;
            }

            const orderData = await orderResponse.json();
            alert(`Your order #${orderData.id} placed successfully! Total ₹${validated.totalAmount}`);
            dispatch(clearCartItem());
        } catch (error) {
            console.error('Error while placing order:', error);
            alert('Something went wrong while placing your order. Please try again.');
        }
    }
    return(
        <div className="cart-bg">
            <Header />
            <div className="cart"><h1 style={{padding:'10px'}}>Shopping cart</h1>
            {
                cart.cartItems.length===0 ?(
                    <div style={{marginBottom:'165px',padding:'10px'}}>
                        <p>Your cart is currently empty</p>
                        
                    </div>
                ) :(
                    <div className="cart-main">
                        <div className="cart-main-head">
                            <h3 className="cart-main-head-h3">Product</h3>
                            <h3>Price</h3>
                            <h3>Quantity</h3>
                            <h3>Total</h3>
                       </div>

                        {
                            cart.cartItems?.map(cartItems=>(
                                    <div key={cartItems.id} className="cart-main-body">

                                     <div className="cart-main-body-div">
                                        <img src={cartItems.url}   alt={cartItems.title} onClick={()=>detail(cartItems.id)} /> 
                                     <div style={{paddingLeft:'5px'}}>
                                     <h3 >{cartItems.title}</h3>
                                     <button onClick={()=>remove(cartItems)}>Delete</button>
                                     </div>
                                     </div>

                                     <div className="cart-main-body-div2"><h5>₹{cartItems.rate}</h5></div>

                                     <div className="quantity">
                                        <button onClick={()=>decrease(cartItems)}>-</button><span>{cartItems.cartQuantity}</span>
                                        <button onClick={()=>increase(cartItems)}>+</button>
                                     </div>

                                     <div className="cart-main-body-div2">
                                        <div style={{color:'green',fontSize:'23px'}}>₹{cartItems.cartQuantity*cartItems.rate} </div>
                                     </div>
                                    </div>
                            ))
                        }
                        <div style={{display:'flex',justifyContent:'space-between',width:'1100px',marginLeft:'10px'}}>
                            <div>
                               <button className="clearCart-button" onClick={()=>clearcart()}> Clear cart </button>
                            </div>
                            <div>
                                <p>Subtotal <span style={{fontSize:'12px'}}>*including all taxes*</span>: <b><span style={{fontSize:'23px'}}> ₹{cart.totalAmount}/-</span></b></p>
                               
                                <button className="Order-button " onClick={order}>Order</button>
                            </div>
                        </div>
                    </div>
                )
            }
            </div>
            <Footer />
        </div>
    )
}
export default Cart