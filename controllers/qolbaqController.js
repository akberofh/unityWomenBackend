import QolbaqModel from "../models/qolbaqModel.js";

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

    // Yeni şəkil gəlirsə, köhnəsini MongoDB-dən sil
    if ((req.file || req.fileUrl) && qolbaq.photo) {
      qolbaq.photo = undefined;
    }

    // Yeni şəkil əlavə et
    if (req.fileUrl) {
      qolbaq.photo = {
        url: req.fileUrl.url || '',
        public_id: req.fileUrl.public_id || '',
      };
    }

    // Digər sahələri yenilə
    qolbaq.title = req.body.title ?? qolbaq.title;
    qolbaq.price = req.body.price ?? qolbaq.price;
    qolbaq.distance = req.body.distance ?? qolbaq.distance;
    qolbaq.stock = req.body.stock ?? qolbaq.stock;
    qolbaq.catagory = req.body.catagory ?? qolbaq.catagory;
    qolbaq.description = req.body.description ?? qolbaq.description;

    const updateQolbaq = await qolbaq.save();

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
    const allQolbaq = await QolbaqModel.find().sort({ price: 1 });
    res.json({ allQolbaq });
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
      const filteredQolbaq = await QolbaqModel.find({ catagory });
      if (!filteredQolbaq.length) {
          return res.status(404).json({ error: "Ürün bulunamadı" });
      }
      res.json({ allQolbaq: filteredQolbaq });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};



export { qolbaqAdd, getQolbaq, getByIdQolbaq, deleteById, getByCategoryQolbaq, qolbaqUpdate };
