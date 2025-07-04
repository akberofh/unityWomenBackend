// models/ConfirmedCart.js
import mongoose from 'mongoose';

const confirmedCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderCode: {
  type: String,
  unique: true
},

  
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      photo: {
        type: [String], // Array of photo paths
      }
      , price: {
        type: Number,
      },

      title: {
        type: String,
      },
    }
  ],
  confirmedAt: { type: Date, default: Date.now },
  gathered: {
    type: Boolean,
    default: false,
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }, // ödeme durumu
});

const ConfirmedCart = mongoose.model('ConfirmedCart', confirmedCartSchema);
export default ConfirmedCart;
