const mongoose = require("mongoose");

const SchemaRemarks = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    
    Remarks: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("clientremarks", SchemaRemarks);
