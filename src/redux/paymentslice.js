import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    payments: [],
    currentPayment: null,
    paymentLoading: false,
    paymentError: ""
};

const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        initiatePayment(state, action) {
            state.paymentLoading = true;
            state.paymentError = "";
            state.currentPayment = {
                orderId: action.payload.orderId,
                amount: action.payload.amount,
                status: 'pending',
                method: null,
                transactionId: null,
                initiatedAt: new Date().toISOString()
            };
        },
        paymentSuccess(state, action) {
            state.paymentLoading = false;
            state.currentPayment = {
                ...state.currentPayment,
                status: 'success',
                method: action.payload.method,
                transactionId: action.payload.transactionId,
                completedAt: new Date().toISOString()
            };
            state.payments.unshift(state.currentPayment);
        },
        paymentFailed(state, action) {
            state.paymentLoading = false;
            state.paymentError = action.payload.error;
            state.currentPayment = {
                ...state.currentPayment,
                status: 'failed',
                errorMessage: action.payload.error
            };
        },
        paymentPending(state, action) {
            state.currentPayment = {
                ...state.currentPayment,
                status: 'pending',
                method: action.payload.method
            };
        },
        clearPaymentError(state) {
            state.paymentError = "";
        },
        clearCurrentPayment(state) {
            state.currentPayment = null;
        }
    }
});

export const {
    initiatePayment,
    paymentSuccess,
    paymentFailed,
    paymentPending,
    clearPaymentError,
    clearCurrentPayment
} = paymentSlice.actions;

export default paymentSlice.reducer;
