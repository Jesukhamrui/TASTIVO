import React from "react";
import Food from "../../../../foodimage";
import { useHistory } from "react-router-dom";
function Thaifood(){
    const history=useHistory();
    let FoodThai=Food.filter((ele)=>ele.titlename==='ThaiFood');
    function detail(id){
        history.push(`/singledish?id=${id}`)
    }
    function order(){
        history.push('/cart')
    }
    function Alldish(titleId){
        history.push(`/alldish?id=${titleId}`)
    }
    return(
        <div className="indi-css">
            <h3>Thai Food</h3>
            <div className="main-image">
                <div className="card-image">
                    {FoodThai.map((ele)=>(
                        <div key={ele.id} className='Perslide'>
                            <img src={ele.url} alt={ele.title} onClick={()=>detail(ele.id)} />
                            <p>{ele.title} [{ele.quantity}]</p>
                            <span style={{display:'block'}}>₹{ele.rate}</span>
                            <button className="slide-cart-button" onClick={order}>Order</button>{' '}<button className="slide-cart-button" onClick={()=>Alldish(ele.titleId)}>See more</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default Thaifood;
