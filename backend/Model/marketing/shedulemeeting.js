const mongoose = require("mongoose");

const SchemaRemarks = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    newMeetingTime: String,
    MeetingStatus: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("sheduled", SchemaRemarks);
