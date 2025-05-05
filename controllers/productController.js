import ConfirmedCart from "../models/confirmedCartModel.js";
import Product from "../models/productModel.js";
import QolbaqModel from "../models/qolbaqModel.js";
import mongoose from "mongoose";


const addUserProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!req.user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const product = await QolbaqModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Stok kontrolü
    if (product.stock <= 0) {
      return res.status(400).json({ error: 'Stokta ürün kalmadı' });
    }

    // Aynı kullanıcı tarafından daha önce eklenmiş aynı ürün var mı kontrol et
    let existingProduct = await Product.findOne({
      productId: product._id,
      user_id: req.user._id,
    });

    if (existingProduct) {
      // Miktarı artır ve toplam fiyatı güncelle
      existingProduct.quantity += 1;
      existingProduct.totalPrice = existingProduct.price * existingProduct.quantity;
      await existingProduct.save();
    } else {
      // Yeni ürün ekle
      const cartItem = new Product({
        user_id: req.user._id,
        productId: product._id,
        title: product.title,
        quantity: 1,
        catagory: product.catagory,
        stock: product.stock,
        photo: product.photo,
        price: product.price,
        totalPrice: product.price,
      });
      await cartItem.save();
    }

    return res.json({ message: 'Ürün sepete eklendi' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
};

const getUserProduct = async (req, res) => {
  try {
    if (req.user) {
      const userProduct = await Product.find({ user_id: req.user._id });
      res.status(200).json(userProduct);
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  const { productId } = req.body;

  try {
    // ObjectId formatına çevirme
    const objectId = new mongoose.Types.ObjectId(productId);

    // `productId` ve `user_id` ile ürünü bulma
    const cartItem = await Product.findOne({
      productId: req.params.productId,
      user_id: req.user._id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Sepette bu ürün bulunamadı' });
    }

    // Miktar ve toplam fiyat güncellemesi
    cartItem.quantity = req.body.quantity;
    cartItem.totalPrice = Math.round(cartItem.price * cartItem.quantity * 100) / 100;
    await cartItem.save();

    res.json({ message: 'Ürün başarıyla güncellendi', product: cartItem });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
};

const deleteUserProduct = async (req, res) => {
  try {
    if (req.user) {
      const deleteProduct = await Product.findById(req.params.id);

      if (deleteProduct && deleteProduct.user_id.toString() === req.user._id.toString()) {
        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: `${req.params.id} id-li ürün silindi` });
      } else {
        res.status(404).json({ message: 'Ürün bulunamadı veya yetkisiz' });
      }
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının sepetindeki ürünleri al
    const cartItems = await Product.find({ user_id: req.user._id });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Sepet boş' });
    }

    // Tüm ürünleri toplu olarak onaylayıp stoğu güncelle
    const confirmedProducts = [];
    for (const item of cartItems) {
      const product = await QolbaqModel.findById(item.productId);

      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `${product.title} ürünü için yeterli stok yok` });
        }

        // Stok güncellemesi ve onaylanan ürün bilgilerini ekleme
        product.stock -= item.quantity;
        await product.save();

        confirmedProducts.push({
          productId: item._id,
          quantity: item.quantity,
          photo: item.photo,
          name: item.name,
          email: item.email,
          totalPrice: item.totalPrice,
          title: item.title,
          paymentStatus: 'pending',
        });

        // Sepet verisini güncelle
        item.stock -= item.quantity;
        await item.save();
      } else {
        return res.status(404).json({ error: `Ürün bulunamadı: ${item.productId}` });
      }
    }

    // Tüm onaylanan ürünleri ConfirmedCart'a kaydet
    const newConfirmedCart = new ConfirmedCart({
      user_id: req.user._id,
      products: confirmedProducts,
      paymentStatus: 'pending', // Ödeme durumu başlangıçta 'pending'
    });

    await newConfirmedCart.save();

    res.json({ message: 'Sepet başarıyla onaylandı ve stoklar güncellendi' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
};



const updatePaymentStatus = async (req, res) => {
  try {
    // Kullanıcı kimliğini alın
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Kullanıcıya ait aktif (henüz ödenmemiş) sepeti bulun
    const cart = await ConfirmedCart.findOne({ user_id, paymentStatus: 'pending' });

    if (!cart) {
      return res.status(404).json({ message: 'No pending cart found for this user' });
    }

    // Ödeme durumunu güncelleyin
    cart.paymentStatus = 'paid';
    await cart.save();

    console.log(`Payment status updated for cart: ${cart._id}`);

    // Başarı yanıtını dönün
    res.status(200).json({ message: `Payment status successfully updated for cart: ${cart._id}` });

  } catch (error) {
    // Hataları işleyin
    console.error('Payment status update failed:', error.message);
    res.status(500).json({ message: 'Payment status update failed' });
  }
};







export { addUserProduct, confirmCart, getUserProduct, updatePaymentStatus, deleteUserProduct, updateStock };
