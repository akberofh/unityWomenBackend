import QolbaqModel from "../models/qolbaqModel.js";
import Todo from "../models/todoModel.js";

const addUserTodo = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Kullanıcı doğrulama
    if (!req.user) {
      return res.status(401).json({ message: 'Kullanıcı doğrulanamadı. Lütfen giriş yapın.' });
    }

    // Ürünü kontrol et
    const product = await QolbaqModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    // Kullanıcının bu ürünü daha önce ekleyip eklemediğini kontrol et
    const existingProduct = await Todo.findOne({
      productId: product._id,
      user_id: req.user._id,
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Bu ürün zaten listenize eklenmiş.' });
    }

    // Yeni todo öğesi oluştur
    const newTodo = new Todo({
      user_id: req.user._id,
      productId: product._id,
      title: product.title,
      catagory: product.catagory,
      stock: product.stock,
      thumbnail: product.thumbnail,
      photo: product.photo,
      price: product.price,
      totalPrice: product.price, // İlk miktar fiyatla aynı
    });

    // Yeni öğeyi kaydet
    await newTodo.save();

    // Başarılı yanıt
    return res.status(201).json({
      message: 'Ürün başarıyla eklendi.',
      todo: newTodo,
    });
  } catch (error) {
    // Hata yönetimi
    return res.status(500).json({ message: 'Bir hata oluştu.', error: error.message });
  }
};



const getUserTodos = async (req, res) => {
    try {
      if (req.user) {
        const userTodos = await Todo.find({ user_id: req.user._id });
        res.status(200).json(userTodos);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const deleteUserTodo = async (req, res) => {
  try {
    if (req.user) {
      const deleteTodo = await Todo.findById(req.params.id);

      if (deleteTodo && deleteTodo.user_id.toString() === req.user._id.toString()) {
        await Todo.deleteOne({ _id: req.params.id });
        res.json({ message: `${req.params.id} id-li post silindi` });
      } else {
        res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserTodo = async (req, res) => {
  try {
    if (req.user) {
      const todo = await Todo.findById(req.params.id);

      if (todo && todo.user_id.toString() === req.user._id.toString()) {
        todo.title = req.body.title || todo.title;
        todo.body = req.body.body || todo.body;
        todo.photo = req.file ? req.file.buffer.toString('base64') : todo.photo;

        const updatedTodo = await todo.save();

        res.json(updatedTodo);
      } else {
        res.status(404).json({ message: 'Todo not found or unauthorized' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addUserTodo, getUserTodos, deleteUserTodo, updateUserTodo };