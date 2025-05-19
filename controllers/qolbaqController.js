import QolbaqModel from "../models/qolbaqModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";


const qolbaqAdd = async (req, res) => {
  const { title, description, thumbnail, price, distance, catagory,stock } = req.body;
  let photo = [];
  if (req.fileUrls && req.fileUrls.length > 0) {
    photo = req.fileUrls;
  }

  try {

  
    // Yeni pubg postu oluştur ve fotoğrafı ekle
    const qolbaq = await QolbaqModel.create({
      title,
      description,
      thumbnail,
      price,
      distance,
      catagory,
      stock,
      photo,
    });

    res.status(201).json({ qolbaq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const qolbaqUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    const qolbaq = await QolbaqModel.findById(id);

    if (!qolbaq) {
      return res.status(404).json({ message: 'qolbaq post not found' });
    }

    console.log("Önceki Veri: ", qolbaq);

    qolbaq.title = req.body.title !== undefined ? req.body.title : qolbaq.title;
    qolbaq.price = req.body.price !== undefined ? req.body.price : qolbaq.price;
    qolbaq.distance = req.body.distance !== undefined ? req.body.distance : qolbaq.distance;
    qolbaq.stock = req.body.stock !== undefined ? req.body.stock : qolbaq.stock;
    qolbaq.catagory = req.body.catagory !== undefined ? req.body.catagory : qolbaq.catagory;
    qolbaq.description = req.body.description !== undefined ? req.body.description : qolbaq.description;

    if (req.fileUrls && req.fileUrls.length > 0) {
      qolbaq.photo = [];
      qolbaq.photo.push(...req.fileUrls);
    }

    const updateQolbaq = await qolbaq.save();

    // ✅ EĞER Aynı ID ile ProductModel'de de varsa, onu da güncelle
    const updatedProduct = await Product.findOne({ productId: id }); // ya da eşleşen bir alan

    if (updatedProduct) {
      updatedProduct.title = qolbaq.title;
      updatedProduct.price = qolbaq.price;
      updatedProduct.distance = qolbaq.distance;
      updatedProduct.stock = qolbaq.stock;
      updatedProduct.catagory = qolbaq.catagory;
      updatedProduct.description = qolbaq.description;
      updatedProduct.photo = qolbaq.photo;

      await updatedProduct.save();
    }

    console.log("Güncellenmiş Veri: ", updateQolbaq);

    res.json({
      _id: updateQolbaq._id,
      title: updateQolbaq.title,
      distance: updateQolbaq.distance,
      catagory: updateQolbaq.catagory,
      stock: updateQolbaq.stock,
      description: updateQolbaq.description,
      photo: updateQolbaq.photo,
      price: updateQolbaq.price,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const getQolbaq = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [allQolbaq, totalCount] = await Promise.all([
      QolbaqModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit), // köhnədən yeniyə (-1)
      QolbaqModel.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      allQolbaq,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getByIdQolbaq = async (req, res) => {
  const { id } = req.params;

  try {
  

    const getById = await QolbaqModel.findById(id);
    if (!getById) {
      return res.status(404).json({ error: "Note not found" });
    }




    res.json({ getById });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedData = await QolbaqModel.findOneAndDelete({ _id: id });
    if (!deletedData) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ deletedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getByCategoryQolbaq = async (req, res) => {
  const { catagory } = req.params;

  try {


    // Kategoriye göre ürünleri filtrele
    const filteredQolbaq = await QolbaqModel.find({ catagory });

    // Ürün bulunamazsa 404 döndürülür
    if (filteredQolbaq.length === 0) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

  

    return res.json({ allQolbaq: filteredQolbaq });
  } catch (error) {
    console.error("Qolbaq getirme hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};



export { qolbaqAdd, getQolbaq, getByIdQolbaq, deleteById, getByCategoryQolbaq, qolbaqUpdate };
