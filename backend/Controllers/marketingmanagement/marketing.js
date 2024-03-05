const MarketingclientModel = require("../../Model/marketing/marketing");
const RemarksModel = require("../../Model/marketing/AddRemarks");
const SheduledModel = require("../../Model/marketing/shedulemeeting");
class ClientMManagement {
  async AddMarketingclient(req, res) {
    let {
      mclientsName,
      mClientBusinessName,
      mClientsContactNumber1,
      mClientsContactNumber2,
      mClientsEmail,
      mClientAddress,
      mPincode,
      msaleexecutive,
      // msaveMeetingTime,
      mZone,
      mstate,
    } = req.body;
    let file = req.file?.filename;

    try {
      let newClientInfo = new MarketingclientModel({
        mclientsName,
        mClientBusinessName,
        mClientsContactNumber1,
        mClientsContactNumber2,
        mClientsEmail,
        mClientAddress,
        mPincode,
        msaleexecutive,
        msaveMeetingTime: null,
        mZone,
        mClientImage: file,
        mstate,
      });
      if (!file) {
        return res.status(400).json({
          status: 400,
          error: "Please select client image",
        });
      }

      const mclientInfo = await newClientInfo.save();

      return res
        .status(200)
        .json({ succes: "client succesfully added", data: mclientInfo });
    } catch (error) {
      console.log("error accours while adding client");
      return res.status(500).json({ error: "server error" });
    }
  }
  async AddSheduleTiming(req, res) {
    let { clientId, MeetingStatus, newMeetingTime } = req.body;
    try {
      let sheduleddata = new SheduledModel({
        clientId,
        MeetingStatus,
        newMeetingTime,
      });

      const sheduled = await sheduleddata.save();

      return res
        .status(200)
        .json({ succes: "sheduled succesfully added", data: sheduled });
    } catch (error) {
      console.log("error accours while adding shedule");
      return res.status(500).json({ error: "server error" });
    }
  }

  async getAllMarketingClients(req, res) {
    try {
      let mclient = await MarketingclientModel.find({});
      return res.json({ mclient });
    } catch (err) {
      return res.json({ error: "server error" });
    }
  }
  async shedulebyId(req, res) {
    let idd = req.params.idd;

    try {
      let shedule = await SheduledModel.find({ clientId: idd });
      if (shedule && shedule.length > 0) {
        return res.status(200).json({ shedule });
      } else {
        return res.json({ error: "Shedule not found for the given clientId" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
  async UpdateShedule(req, res) {
    const sheduleid = req.params.idd;
    let { MeetingStatus, newMeetingTime } = req.body;
    try {
      const sheduled = await SheduledModel.findOne({
        _id: sheduleid,
      });

      if (!sheduled) {
        return res.status(404).json({ error: "No such record found" });
      }
      sheduled.MeetingStatus = MeetingStatus || sheduled.MeetingStatus;
      sheduled.newMeetingTime = newMeetingTime || sheduled.newMeetingTime;

      const sheduleddaata = await SheduledModel.findOneAndUpdate(
        { _id: sheduleid },
        sheduled,
        { new: true }
      );
      return res.status(200).json({
        message: "Updated successfully",
        data: sheduleddaata,
      });
    } catch (err) {
      return res.status(500).json({ error: "server error" });
    }
  }

  async getclientbyid(req, res) {
    let idd = req.params.idd;

    try {
      let clientdata = await MarketingclientModel.find({ _id: idd });
      if (clientdata && clientdata.length > 0) {
        return res.status(200).json({ clientdata });
      } else {
        return res.json({ error: "Shedule not found for the given clientId" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async AddRemarks(req, res) {
    let { clientId, Remarks } = req.body;

    try {
      let newClientInfo = new RemarksModel({
        clientId,
        Remarks,
      });

      const mclientInfo = await newClientInfo.save();

      return res
        .status(200)
        .json({ succes: "client succesfully added", data: mclientInfo });
    } catch (error) {
      console.log("error accours while adding client");
      return res.status(500).json({ error: "server error" });
    }
  }
  async getRemarksbyid(req, res) {
    let idd = req.params.id;

    try {
      let remarks = await RemarksModel.find({ clientId: idd });
      if (remarks && remarks.length > 0) {
        return res.status(200).json({ remarks });
      } else {
        return res.json({ error: "Remarks not found for the given clientId" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAllClientsRemarks(req, res) {
    try {
      let remarks = await RemarksModel.find({});
      return res.status(200).json({ remarks });
    } catch (err) {
      return res.status(500).json({ error: "server error" });
    }
  }
  async DeleteShedule(req, res) {
    const id = req.params.id;
    try {
      let remarks = await SheduledModel.findOneAndDelete({ _id: id });
      return res.status(200).json({ remarks });
    } catch (err) {
      return res.status(500).json({ error: "server error" });
    }
  }
  async DeleteCleint(req, res) {
    const id = req.params.id;
    try {
      let remarks = await MarketingclientModel.findOneAndDelete({ _id: id });
      return res.status(200).json({ remarks });
    } catch (err) {
      return res.status(500).json({ error: "server error" });
    }
  }
}

const clientmcontroller = new ClientMManagement();
module.exports = clientmcontroller;
