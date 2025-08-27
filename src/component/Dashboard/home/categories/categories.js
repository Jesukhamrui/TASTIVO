import React from "react";
import Food from "../../../foodimage";
import '../categories/categories.css'
import indian from '../../image/indianfood.jpg'
import italian from '../../image/italianfood.jpg'
import korean from '../../image/korean.png'
// Add placeholder images for new categories
import mexican from '../../image/mexicanfood.jpg'
import chinese from '../../image/chinesefood.jpg'
import american from '../../image/americanfood.jpg'
import thai from '../../image/thaifood.jpg'
import { useHistory } from "react-router-dom";
function Categories(){
    const history=useHistory()
    let Food1=Food.filter((ele)=>ele.titlename==='IndianFood');
    let Food2=Food.filter((ele)=>ele.titlename==='ItalianFood');
    let Food3=Food.filter((ele)=>ele.titlename==='korean');
    let Food4=Food.filter((ele)=>ele.titlename==='MexicanFood');
    let Food5=Food.filter((ele)=>ele.titlename==='ChineseFood');
    let Food6=Food.filter((ele)=>ele.titlename==='AmericanFood');
    let Food7=Food.filter((ele)=>ele.titlename==='ThaiFood');
    function Alldish(titleId){
        history.push(`/alldish?id=${titleId}`)
    }
        function scrollLeft() {
                document.querySelector('.category-main').scrollLeft -= 300;
        }
        function scrollRight() {
                document.querySelector('.category-main').scrollLeft += 300;
        }
        return (
                <div className="category-list">
                     <h2>Categories</h2>
                     <div style={{position:'relative'}}>
                         <button style={{position:'absolute',left:0,top:'40%',zIndex:2}} onClick={scrollLeft}>❰</button>
                         <button style={{position:'absolute',right:0,top:'40%',zIndex:2}} onClick={scrollRight}>❱</button>
                         <div className="category-main" style={{overflowX:'auto',whiteSpace:'nowrap',scrollBehavior:'smooth',padding:'0 40px'}}>
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={indian} alt='Indian' onClick={()=>Alldish(Food1[0]?.titleId)} ></img>
                             <p >Indian cuisins</p></div> 
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={italian} alt='Italian' onClick={()=>Alldish(Food2[0]?.titleId) }  ></img>
                             <p>Italian cuisins</p></div> 
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={korean} alt='Korean'  onClick={()=>Alldish(Food3[0]?.titleId) } ></img>
                             <p>Korean cuisins</p></div>
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={mexican} alt='Mexican'  onClick={()=>Alldish(Food4[0]?.titleId) } ></img>
                             <p>Mexican cuisins</p></div>
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={chinese} alt='Chinese'  onClick={()=>Alldish(Food5[0]?.titleId) } ></img>
                             <p>Chinese cuisins</p></div>
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={american} alt='American'  onClick={()=>Alldish(Food6[0]?.titleId) } ></img>
                             <p>American cuisins</p></div>
                             <div style={{display:'inline-block',textAlign:'center',marginRight:'20px'}}><img src={thai} alt='Thai'  onClick={()=>Alldish(Food7[0]?.titleId) } ></img>
                             <p>Thai cuisins</p></div>
                         </div>
                     </div>
                </div>
        )
}
export default Categories