import PaymentModel from "../models/paymentModel.js";

const qolbaqAdd = async (req, res) => {
  const {  title , description ,name,  adress, city, delivery, poct, surname, email, phone} = req.body;
  let photo = ''; // Cloudinary'den alınacak fotoğraf URL'si
  if (req.file) {
    photo = req.fileUrl; // Cloudinary'den alınan URL
  }

  try {

  
    // Yeni pubg postu oluştur ve fotoğrafı ekle
    const payment = await PaymentModel.create({
        title , description ,name,  adress, city, delivery, poct, surname, email, phone,
      photo,
    });

    res.status(201).json({ payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




const getQolbaq = async (req, res) => {
  try {
    const allPayment = await PaymentModel.find();
    res.json({ allPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getByIdQolbaq = async (req, res) => {
  const { id } = req.params;
  try {
    const getById = await PaymentModel.findById(id);
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
    const deletedData = await PaymentModel.findOneAndDelete({ _id: id });
    if (!deletedData) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ deletedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export { qolbaqAdd, getQolbaq, getByIdQolbaq, deleteById, };
