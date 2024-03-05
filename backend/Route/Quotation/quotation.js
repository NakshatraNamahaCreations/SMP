const QuotationController = require("../../Controllers/Quotation/quotation");

const express = require("express");

const router = express.Router();

router.post("/quotation", QuotationController.QuotationData);
router.get("/getquotation", QuotationController.getQuotationData);
router.get("/getquotationbyid/:id", QuotationController.getQuotationByid);
module.exports = router;
