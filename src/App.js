import React from 'react';
import './App.css';
import { BrowserRouter,Switch,Route, Redirect } from "react-router-dom"
import Login from './component/login/login';
import Register from './component/register/register';
import Home from './component/Dashboard/home/home.js';
import Cart from './component/Dashboard/cart/cart';
import Singledish from './component/Dashboard/home/categories/singledish';
import Alldish from './component/Dashboard/All dish/alldish';
import Profile from './component/Dashboard/profile/profile';
import { Provider } from 'react-redux';
import store from './redux/store';
import { getTotals } from './component/Dashboard/cart/cartslice';
import AboutUs from './component/Dashboard/AboutUs';
import Team from './component/Dashboard/Team';
import ContactUs from './component/Dashboard/ContactUs';
import Favorites from './component/Dashboard/Favorites';
import Admin from './component/Dashboard/Admin';

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const token = localStorage.getItem('token');
      if (!token) {
        return <Redirect to="/login" />;
      }
      return <Component {...props} />;
    }}
  />
);

function App() {
  store.dispatch(getTotals())

  return (
    <div style={{height:'100%'}}>
      
      <BrowserRouter>
      <Provider store={store}>
      <Switch>
  <Route exact path='/'> <Home /> </Route>
  <Route path='/login'> <Login /> </Route>
  <Route path='/register'> <Register /> </Route>
          <Route path='/home'> <Home /></Route>
          <ProtectedRoute path='/cart' component={Cart} />
          <Route path='/singledish'> <Singledish /></Route>
          <Route path='/alldish'> <Alldish /></Route>
          <ProtectedRoute path='/profile' component={Profile} />
  <Route path='/about'> <AboutUs /> </Route>
  <Route path='/team'> <Team /> </Route>
  <Route path='/contact'> <ContactUs /> </Route>
  <ProtectedRoute path='/favorites' component={Favorites} />
  <ProtectedRoute path='/admin' component={Admin} />
      </Switch>
      </Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
