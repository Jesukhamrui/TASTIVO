import React from "react";
import logo from '../image/food.png'
import Food from "../../foodimage";
import '../footer/footer.css'
import { useHistory } from "react-router-dom";
import insta from '../image/instagram.png'
import whatsapp from '../image/whatsapp.png'
import linkedin from '../image/likedin.png'
import pintrest from '../image/pintrest.png'
import youtube from '../image/youtube.png'
import { Link } from "react-router-dom";
function Footer(){
    let Food1=Food.filter((ele)=>ele.titlename==='IndianFood');
    let Food2=Food.filter((ele)=>ele.titlename==='ItalianFood')
    let history=useHistory();
      function Alldish(titleId){
        history.push(`/alldish?id=${titleId}`)
    }
    return(
        <div className="footer">
              <img src={logo} className='flogo' alt="Tastivo logo"></img>
              <div className="footer-main">
                <div>
                    <h4>Company</h4>
                    <ul>
                        <li><Link to={'/about'} className='linkto'>About us</Link></li>
                        <li><Link to={'/team'} className='linkto'>Team</Link></li>
                        <li><Link to={'/contact'} className='linkto'>Need help? Contact Us</Link></li>
                    </ul>
                </div>
                <div>
                    <h4>Pages</h4>
                    <ul>
                        <li><Link to={'/home'} className='linkto'>Home</Link></li>
                        <li> <Link to={'/cart'} className='linkto'>Cart</Link></li>
                        <li><Link to={'/profile'} className='linkto'>Profile</Link></li>
                    </ul>
                </div>
                <div>
                    <h4>Categories</h4>
                    <ul>
                        <li onClick={()=>Alldish(Food1[0].titleId) } >Indian</li>
                        <li onClick={()=>Alldish(Food2[0].titleId)}>Italian</li>
                        <li>Korean</li>
                    </ul>
                </div>
                <div>
                    <h4>Places</h4>
                    <ul>
                        <li>west Bengal</li>
                        <li>Assam</li>
                        <li>Tripura</li>
                        <li>Meghalaya</li>
                    </ul>
                </div>
                <div>
                    <h4>Contact us</h4>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                        <img src={insta} className='footerimg' alt="Instagram" />
                    </a>
                    <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                        <img src={whatsapp} className='footerimg' alt="WhatsApp" />
                    </a>
                    <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer">
                        <img src={pintrest} className='footerimg' alt="Pinterest" />
                    </a>
                    <a href="www.linkedin.com/in/jesu-khamrui-3abaa8340"><img src={linkedin} className='footerimg' alt="LinkedIn" ></img></a>
                    <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                        <img src={youtube} className='footerimg' alt="YouTube" />
                    </a>
                </div>
              
              </div>
              <p>Serving great meals in your city — and beyond.</p>
        </div>
    )
}

export default Footer