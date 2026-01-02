import React, { useState, useEffect } from "react";
import Food from "../../foodimage";
import Footer from "../footer/footer";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "../header/header";
import { addTocart } from "../cart/cartslice";
import { useDispatch,useSelector } from "react-redux";
import { getTotals } from "../cart/cartslice";

const API_BASE_URL = "http://localhost:5000";

function Alldish(){
    const dispatch=useDispatch()
    const history=useHistory();
    const location=useLocation();
    const [detail,setdetail]=useState([])
    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(()=>{
        const query = new URLSearchParams(location.search);
        const idParam = query.get('id');
        const idNumber = idParam ? Number(idParam) : null;
        let data = Food.filter((ele)=> ele.titleId === idNumber );
        console.log(data)
        setdetail(data)
       
    },[location.search])
    const cart=useSelector((state)=>state.cart)
    useEffect(()=>{
        
        dispatch(getTotals())
    },[cart,dispatch])
    function detailed(id){
        history.push(`/singledish?id=${id}`)
    }
    function order(){
        history.push('/cart')
    }
    function AddtoCart(ele){
        dispatch(addTocart(ele))
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        async function fetchFavorites() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/favorites`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                const ids = data.map((dish) => String(dish.id));
                setFavoriteIds(ids);
            } catch (e) {
                console.error('Failed to load favorites', e);
            }
        }

        fetchFavorites();
    }, []);

    async function toggleFavoriteForDish(ele) {
        const token = localStorage.getItem('token');
        if (!token) {
            history.push('/login');
            return;
        }
        if (!ele || !ele.id) return;

        const isFav = favoriteIds.includes(String(ele.id));
        try {
            const method = isFav ? 'DELETE' : 'POST';
            const res = await fetch(`${API_BASE_URL}/api/favorites/${ele.id}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Unable to update favorites right now.');
                return;
            }
            setFavoriteIds((prev) => {
                const idStr = String(ele.id);
                if (isFav) {
                    return prev.filter((id) => id !== idStr);
                }
                return [...prev, idStr];
            });
        } catch (e) {
            console.error('Error updating favorites', e);
            alert('Something went wrong. Please try again.');
        }
    }
    return(
        <div className="sfp-bg">
            <Header />
           
            <div className="All-dish-card">
            {
                detail.map((ele)=>{
                                        const isFav = favoriteIds.includes(String(ele.id));
                                        return <div key={ele.id} className='Perslide'>
                    <img src={ele.url} alt={ele.title} onClick={()=>detailed(ele.id)}></img>
                    <p>{ele.title}{' '}[{ele.quantity}]</p>
                    <span style={{display:'block'}}>₹{ele.rate}</span>
                                        <button className="slide-cart-button" onClick={order}>Order</button>{'  '}
                                        <button className="slide-cart-button" onClick={()=>AddtoCart(ele)}>+Add toCart</button>{'  '}
                                        <button
                                            type="button"
                                            className={`favorite-btn ${isFav ? 'favorited' : ''}`}
                                            onClick={() => toggleFavoriteForDish(ele)}
                                        >
                                            {isFav ? '♥' : '♡'}
                                        </button>
                </div>
                
                })
            }
            </div>
             
            <Footer />
        </div>
    )
}

export default Alldish