import CatagoryModel from "../models/catagoryModel.js";


const catagoryAd = async (req, res) => {
    const { title } = req.body;
    let photo = ''; // Cloudinary'den alınacak fotoğraf URL'si
    if (req.file) {
      photo = req.fileUrl; // Cloudinary'den alınan URL
    }

    try {

        const catagory = await CatagoryModel.create({
            title,
            photo,
        });

        res.status(201).json({ catagory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




const catagoryUpdate = async (req, res) => {
    const { id } = req.params;
   
    try {


        const catagory = await CatagoryModel.findById(id);

        if (!catagory) {
            return res.status(404).json({ message: 'catagory post not found' });
        }

        // Güncelleme işleminden önce mevcut veriyi kontrol et
        console.log("Önceki Veri: ", catagory);

        // Gelen verileri güncelle
        catagory.title = req.body.title !== undefined ? req.body.title : catagory.title;


        // Eğer bir fotoğraf dosyası mevcutsa, base64 formatında güncelle
        if (req.file) {
            catagory.photo =  req.fileUrl;
        }

        // Güncellenmiş dest kaydını kaydet
        const updatecatagory = await catagory.save();

        // Güncellenmeden sonraki veriyi kontrol et
        console.log("Güncellenmiş Veri: ", updatecatagory);

        // Güncellenmiş veriyi döndür
        res.json({
            _id: updatecatagory._id,
            title: updatecatagory.title,
            photo: updatecatagory.photo,
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};




const getCatagory = async (req, res) => {
    try {
        const allCatagory = await CatagoryModel.find();
        res.json({ allCatagory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getByIdCatagory = async (req, res) => {
    const { id } = req.params;
    try {
        const getById = await CatagoryModel.findById(id);
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
        const deletedData = await CatagoryModel.findOneAndDelete({ _id: id });
        if (!deletedData) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { catagoryAd, getCatagory, getByIdCatagory, deleteById, catagoryUpdate };
