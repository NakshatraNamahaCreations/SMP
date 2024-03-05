const clientModel = require("../../Model/client/client");

class ClientManagement {
  async Addclient(req, res) {
    let {
      clientsName,
      clientsBrand,
      ClientsContactNumber1,
      ClientsContactNumber2,
      ClientsEmail,
      ClientAddress,
      Pincode,
      Zone,
      state,
      // InstallationRate,
    } = req.body;
    let file = req.file?.filename;
    try {
      let newClientInfo = new clientModel({
        clientsName,
        clientsBrand,
        ClientsContactNumber1,
        ClientsContactNumber2,
        ClientsEmail,
        ClientAddress,
        Pincode,
        Zone,

        // InstallationRate,
        ClientImage: file,
        state,
      });
      if (!file) {
        return res.status(400).json({
          status: 400,
          error: "Please select client image",
        });
      }

      const clientInfo = await newClientInfo.save();

      return res
        .status(200)
        .json({ succes: "client succesfully added", data: clientInfo });
    } catch (error) {
      console.log("error accours while adding client");
      return res.status(500).json({ error: "server error" });
    }
  }

  async getAllClients(req, res) {
    try {
      let client = await clientModel.find({});
      return res.json({ client });
    } catch (err) {
      return res.json({ error: "server error" });
    }
  }
  async getClientById(req, res) {
    let id = req.params.idd;
    try {
      let client = await clientModel.findOne({ _id: id });
      return res.json({ client });
    } catch (err) {
      return res.json({ error: "server error" });
    }
  }
  async updatClient(req, res) {
    const clientid = req.params.id;
    let {
      clientsName,
      clientsBrand,
      ClientsContactNumber1,
      ClientsContactNumber2,
      ClientsEmail,
      ClientAddress,
      Pincode,
      Zone,
    } = req.body;
    try {
      const findlclient = await clientModel.findOne({
        _id: clientid,
      });

      if (!findlclient) {
        return res.status(404).json({ error: "No such record found" });
      }
      findlclient.clientsName = clientsName || findlclient.clientsName;
      findlclient.clientsBrand = clientsBrand || findlclient.clientsBrand;
      findlclient.ClientsContactNumber2 =
        ClientsContactNumber2 || findlclient.ClientsContactNumber2;
      findlclient.ClientsContactNumber1 =
        ClientsContactNumber1 || findlclient.ClientsContactNumber1;
      findlclient.ClientsEmail = ClientsEmail || findlclient.ClientsEmail;
      findlclient.ClientAddress = ClientAddress || findlclient.ClientAddress;
      findlclient.Pincode = Pincode || findlclient.Pincode;
      findlclient.Zone = Zone || findlclient.Zone;
      const updateclient = await clientModel.findOneAndUpdate(
        { _id: clientid },
        findlclient,
        { new: true }
      );
      return res.status(200).json({
        message: "Updated successfully",
        data: updateclient,
      });
    } catch (err) {
      return res.status(500).json({ error: "server error" });
    }
  }

  async DeletClient(req, res) {
    let idd = req.params.id;
    try {
      let client = await clientModel.findOneAndDelete({ _id: idd });
      return res.status(200).json({ succes: "Deleted Succesfully" });
    } catch (err) {
      return res.json({ error: "server error" });
    }
  }
}

const clientcontroller = new ClientManagement();
module.exports = clientcontroller;
