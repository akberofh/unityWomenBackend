import mongoose from "mongoose";

const paymentModel = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  photo: {
    type: String, 
  },
  name: {
    type: String,
  },
  adress: {
    type: String,
  },
  city: {
    type: String,
  },
  delivery: {
    type: String,
  },
  poct: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  
}, {
  timestamps: true
});

const PaymentModel = mongoose.model("Payment", paymentModel);


export default PaymentModel;
