import KargoModel from "../models/kargoModel.js";


const kargoAdd = async (req, res) => {
    const { title } = req.body;

    try {

        const kargo = await KargoModel.create({
            title,
        });

        res.status(201).json({ kargo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




const kargoUpdate = async (req, res) => {
    const { id } = req.params;
   
    try {


        const kargo = await KargoModel.findById(id);

        if (!kargo) {
            return res.status(404).json({ message: 'kargo post not found' });
        }

        // Güncelleme işleminden önce mevcut veriyi kontrol et
        console.log("Önceki Veri: ", kargo);

        // Gelen verileri güncelle
        kargo.title = req.body.title !== undefined ? req.body.title : kargo.title;


        const updateKargo = await kargo.save();

        // Güncellenmeden sonraki veriyi kontrol et
        console.log("Güncellenmiş Veri: ", updateKargo);

        // Güncellenmiş veriyi döndür
        res.json({
            _id: updateKargo._id,
            title: updateKargo.title,
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};




const getKargo = async (req, res) => {
    try {
        const allKargo = await KargoModel.find();
        res.json( allKargo );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const deleteById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedData = await KargoModel.findOneAndDelete({ _id: id });
        if (!deletedData) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { kargoAdd, getKargo,  deleteById, kargoUpdate };
