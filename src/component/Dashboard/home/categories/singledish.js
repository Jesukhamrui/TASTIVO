import React, { useState, useEffect } from "react";
import Food from "../../../foodimage";
import { useLocation } from "react-router-dom";
import Header from "../../header/header";
import Footer from "../../footer/footer";
import '../categories/categories.css'
import { useDispatch,useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { addTocart, getTotals } from "../../cart/cartslice";

const API_BASE_URL = "http://localhost:5000";

function Singledish(){
    const dispatch=useDispatch()
    const location=useLocation();
    const history=useHistory()
    const [detail,setdetail]=useState({})
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const cart=useSelector((state)=>state.cart)
    useEffect(()=>{
        
        dispatch(getTotals())
    },[cart,dispatch])
    function AddtoCart(detail){
        dispatch(addTocart(detail))
    }
    let query = new URLSearchParams(location.search)

    useEffect(()=>{
        let data = Food.filter((ele)=>ele.id==query.get('id'));
        setdetail(data[0])
    },[query])

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !detail || !detail.id) return;

        async function fetchFavorites() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/favorites`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                const exists = data.some((dish) => String(dish.id) === String(detail.id));
                setIsFavorite(exists);
            } catch (e) {
                console.error('Failed to load favorites', e);
            }
        }

        fetchFavorites();
    }, [detail]);

    async function toggleFavorite() {
        const token = localStorage.getItem('token');
        if (!token) {
            history.push('/login');
            return;
        }
        if (!detail || !detail.id) return;

        try {
            setFavLoading(true);
            const method = isFavorite ? 'DELETE' : 'POST';
            const res = await fetch(`${API_BASE_URL}/api/favorites/${detail.id}`, {
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
            setIsFavorite(!isFavorite);
        } catch (e) {
            console.error('Error updating favorites', e);
            alert('Something went wrong. Please try again.');
        } finally {
            setFavLoading(false);
        }
    }
    function order(){
        history.push('/cart')
    }
    return(
        <>
        <div className="sfp-bg">
        <Header />
        
        <div className="sfp-main">
            <div className="sfp-first">
                <img src={detail.url}></img><br />
               
            </div>
            <div className="spf-second">
            <h1>{detail.title}</h1>
            <h3>[{detail.quantity}]</h3>
            <br />
            <h1 >₹{detail.rate}</h1>
            <p><span >Description:</span><br />{detail.description}</p>
            <div><span>Available Only At :</span><p>9am to 9pm</p></div>
            <br />
                        <button onClick={()=>AddtoCart(detail)}> + Add to Cart</button>
                        <button style={{marginLeft:'20px'}} onClick={order}>Order</button>
                        <button
                            type="button"
                            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                            onClick={toggleFavorite}
                            disabled={favLoading}
                            style={{ marginLeft: '20px' }}
                        >
                            {isFavorite ? '♥ Favorited' : '♡ Add to Favorites'}
                        </button>
            </div>
        </div>
        <Footer />
        </div>
        </>
    )
}
export default Singledish