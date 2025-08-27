import React from "react";
import Food from "../../../../foodimage";
import { useHistory } from "react-router-dom";
function Americanfood(){
    const history=useHistory();
    let FoodAmerican=Food.filter((ele)=>ele.titlename==='AmericanFood');
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
            <h3>American Food</h3>
            <div className="main-image">
                <div className="card-image">
                    {FoodAmerican.map((ele)=>(
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
export default Americanfood;
