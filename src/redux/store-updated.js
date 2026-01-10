import { configureStore } from "@reduxjs/toolkit";
import cartslice from "../component/Dashboard/cart/cartslice";
import orderslice from "../component/Dashboard/orders/orderslice";
import paymentslice from "./paymentslice";
import reviewslice from "./reviewslice";

export default configureStore({
    reducer:{
        cart:cartslice,
        orders:orderslice,
        payments:paymentslice,
        reviews:reviewslice,
    }
})
