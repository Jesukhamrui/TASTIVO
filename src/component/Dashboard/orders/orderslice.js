import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: [],
    orderCount: 0
};

const orderslice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        addOrder(state, action) {
            const newOrder = {
                id: action.payload.id || Date.now(),
                items: action.payload.items,
                totalAmount: action.payload.totalAmount,
                totalQuantity: action.payload.totalQuantity,
                date: action.payload.date || new Date().toISOString(),
                status: action.payload.status || 'pending',
                deliveryDetails: action.payload.deliveryDetails || {}
            };
            state.orders.unshift(newOrder);
            state.orderCount += 1;
        },
        updateOrderStatus(state, action) {
            const orderIndex = state.orders.findIndex((order) => order.id === action.payload.id);
            if (orderIndex >= 0) {
                state.orders[orderIndex].status = action.payload.status;
            }
        },
        clearOrders(state) {
            state.orders = [];
            state.orderCount = 0;
        }
    }
});

export const { addOrder, updateOrderStatus, clearOrders } = orderslice.actions;
export default orderslice.reducer;
