import PaymentModel from "../models/paymentModel.js";

const qolbaqAdd = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  const { title, description, name, adress, city, delivery, poct, surname, email, phone, confirmedCartId } = req.body;
  let photo = '';

  if (req.file) {
    photo = req.fileUrl;
  }

  try {
    const payment = await PaymentModel.create({
      user_id: req.user._id,
      confirmedCartId,
      title,
      description,
      name,
      adress,
      city,
      delivery,
      poct,
      surname,
      email,
      phone,
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
    const allPayments = await PaymentModel.find({ confirmedCartId: req.params.confirmedCartId}); 
    res.json(allPayments);
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
