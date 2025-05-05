import KartModel from "../models/kartModel.js";

export const getKart = async (req, res) => {
  try {
      const allKart = await KartModel.find();
      res.json({ allKart });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

export const kartAdd = async (req, res) => {
    const { kart } = req.body;


    try {
        const Kart = await KartModel.create({
            kart,
        });

        res.status(201).json({ Kart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};