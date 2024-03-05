const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express();
const RecceController = require("../../Controllers/reccemanagement/recce");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../../Public/reccedesign"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueFileName = Date.now() + "_" + file.originalname;
//     cb(null, uniqueFileName);
//   },
// });
// const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../Public/designimage"));
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + "_" + file.originalname;
    cb(null, uniqueFileName);
  },
});
const upload = multer({ storage: storage });
const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../Public/excelFile"));
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + "_" + file.originalname;
    cb(null, uniqueFileName);
  },
});

const upload1 = multer({ storage: storage1 });

router.post("/addrecce", RecceController.AddRecce);

router.get("/getallrecce", RecceController.getAllRecce);
router.get("/getreccebyid/:id", RecceController.getRecceById);
router.get("/getbycity/:city", RecceController.getByCityName);

router.post(
  "/addreccesviaexcelesheet/:addexcelid",
  upload1.single("excelFile"),
  RecceController.updateRecceOutletName
);

router.put(
  "/updatereccedata/:recceindex/:getreccedataid",
  upload.any(),
  RecceController.UpdateRecceData
);

router.put(
  "/outletupdate/:outletiddd/:vendoridd",
  RecceController.UpdateOutletVendor
);
router.put(
  "/updateinstaltion/:outletiddd/:instalationgroup",
  RecceController.UpdateInstallationToVendor
);
// router.put(
//   "/editoutletstatus/:outletiddd/:status",
//   RecceController.UpdateOutletStatus
// );
router.delete("/recceoudelet/:outletin", RecceController.deleteOutletData);

router.delete("/deletereccedata/:reccedeleteid", RecceController.DeletRecce);

// kiruthiks's code
router.get(
  "/getreccedatabyvendorid/:id",
  RecceController.getAllRecceDataByVendorId
);
router.get(
  "/getreccedatabyrecceid/:Id",
  RecceController.getParticularRecceByRecceId
);
// router.get("/getoutletid/:id", RecceController.getOutletByid);

router.put("/addrecceinmobile/:id", RecceController.addingRecceFromMobile); // 01-02-2024 kiruthika's
router.put("/completejob/:id", RecceController.completeJob);
router.put("/canceljob/:id", RecceController.CancelJob); // 02-02-2024 kiruthika's
module.exports = router;
