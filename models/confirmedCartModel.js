// models/ConfirmedCart.js
import mongoose from 'mongoose';

const confirmedCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      photo: { type: String},
      totalPrice: {
        type: Number,
      },
      thumbnail: { type: String },
      previousStock: { type: Number, required: true }, // Önceki stok miktarı
    }
  ],
  confirmedAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }, // ödeme durumu
});

const ConfirmedCart = mongoose.model('ConfirmedCart', confirmedCartSchema);
export default ConfirmedCart;
