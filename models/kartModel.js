import mongoose from "mongoose";

const kartModel = mongoose.Schema({
  kart: {
    type: Number,
  },

 
}, {
  timestamps: true
});

const KartModel = mongoose.model("Kart", kartModel);

export default KartModel;
