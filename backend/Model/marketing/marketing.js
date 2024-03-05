const mongoose = require("mongoose");

const Schemaformarketingclient = new mongoose.Schema(
  {
    mclientsName: String,
    mClientBusinessName: String,
    mClientsContactNumber1: Number,
    MClientAddress: String,
    mClientsEmail: String,
    mPincode: Number,
    mZone: String,
    mClientImage: String,
    msaleexecutive: String,mstate:String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "marketingclientinfo",
  Schemaformarketingclient
);
