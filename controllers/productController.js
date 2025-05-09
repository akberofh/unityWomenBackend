import ConfirmedCart from "../models/confirmedCartModel.js";
import Product from "../models/productModel.js";
import QolbaqModel from "../models/qolbaqModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";


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

    // Kullanıcının payment alanını kontrol et
    const user = await User.findById(req.user._id).select('payment');
    const isPaidUser = user?.payment === true;

    // İndirim uygulanmış fiyatı hesapla
    const discountedPrice = isPaidUser
      ? parseFloat((product.price * 0.9).toFixed(2))
      : product.price;

    // Aynı kullanıcı tarafından daha önce eklenmiş aynı ürün var mı kontrol et
    let existingProduct = await Product.findOne({
      productId: product._id,
      user_id: req.user._id,
    });

    if (existingProduct) {
      // Miktarı artır ve toplam fiyatı güncelle
      existingProduct.quantity += 1;
      existingProduct.totalPrice = parseFloat((discountedPrice * existingProduct.quantity).toFixed(2));
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
        thumbnail: product.thumbnail,
        photo: product.photo,
        price: discountedPrice,
        totalPrice: discountedPrice,
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

    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Sepet boş veya ürün seçilmedi' });
    }

    const confirmedProducts = [];

    for (const item of products) {
      const product = await QolbaqModel.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: `Ürün bulunamadı: ${item.title}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `${item.title} ürünü için yeterli stok yok` });
      }

      // Stok güncelle
      product.stock -= item.quantity;
      await product.save();

      confirmedProducts.push({
        productId: item._id,
        quantity: item.quantity,
        photo: item.photo,
        gathered: item.gathered,
        totalPrice: item.totalPrice,
        title: item.title,
        paymentStatus: 'pending',
        previousStock: product.stock + item.quantity
      });

      // Sepetteki item'ı da güncelle (istersen)
      const cartItem = await Product.findById(item._id);
      if (cartItem) {
        cartItem.stock -= item.quantity;
        await cartItem.save();
      }
    }

    const newConfirmedCart = new ConfirmedCart({
      user_id: req.user._id,
      products: confirmedProducts,
      paymentStatus: 'pending',
    });

    await newConfirmedCart.save();

    res.json({
      message: 'Sepet başarıyla onaylandı ve stoklar güncellendi',
      confirmedCartId: newConfirmedCart._id
    });
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
