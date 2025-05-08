import ManyModel from "../models/manyModel.js";


const manyAdd = async (req, res) => {
    const { titla } = req.body;

    try {

        const many = await ManyModel.create({
            titla,
        });

        res.status(201).json({ many });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




const manyUpdate = async (req, res) => {
    const { id } = req.params;
   
    try {


        const many = await ManyModel.findById(id);

        if (!many) {
            return res.status(404).json({ message: 'many post not found' });
        }

        // Güncelleme işleminden önce mevcut veriyi kontrol et
        console.log("Önceki Veri: ", many);

        // Gelen verileri güncelle
        many.titla = req.body.titla !== undefined ? req.body.titla : many.titla;


        const updateMany = await many.save();

        // Güncellenmeden sonraki veriyi kontrol et
        console.log("Güncellenmiş Veri: ", updateMany);

        // Güncellenmiş veriyi döndür
        res.json({
            _id: updateMany._id,
            titla: updateMany.titla,
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};




const getMany = async (req, res) => {
    try {
        const allMany = await ManyModel.find();
        res.json( allMany );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const deleteById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedData = await ManyModel.findOneAndDelete({ _id: id });
        if (!deletedData) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { manyAdd, getMany,  deleteById, manyUpdate };
