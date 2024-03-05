import { React, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/esm/Table";
import Header from "./Header";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import ShareIcon from "@mui/icons-material/Share";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function ReadToBill() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const [recceData1, setRecceData1] = useState([]);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const location = useLocation();
  const searchParams = location.state;
  const Statedata = location.state || null;
  const clientName = Statedata?.client;

  const [quantity, setQuantity] = useState([]);
  const [productionRates, setProductionRates] = useState([]);
  const [transportationRates, setTransportationRates] = useState([]);
  const [InstallationRates, setInstallationRates] = useState([]);
  const [QuotationData, setQuotationData] = useState([]);

  let TotalAmount = 0;
  let TotalAmountWithGST = 0;
  let Sft = [];
  let Amount = [];
  let ProductionCost = [];
  let InstallationCost = [];
  let transportationCost = [];

  const outletIds = [];
  let innerIndexs = [];
  useEffect(() => {
    getAllRecce();
    getQuotation();
    getOuletById();
  }, []);

  const getOuletById = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        setOutletDoneData(res?.data?.outletData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllRecce = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/recce/recce/getreccebyid/${Statedata?.idd}`
      );
      if (res.status === 200) {
        setRecceData1(res.data.RecceData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [QuantityIndex, setQuantityIndex] = useState(null);
  const handleFieldChange = (e, innerIndex, fieldName) => {
    const value = e.target.value;

    switch (fieldName) {
      case "Quantity":
        const updatedQuantity = [...quantity];
        updatedQuantity[innerIndex] = value;
        setQuantity(updatedQuantity);
        setQuantityIndex(innerIndex);
        break;
      case "Productionrates":
        const updatedProductionRates = [...productionRates];
        updatedProductionRates[innerIndex] = value;
        setProductionRates(updatedProductionRates);
        break;
      case "InstalationRates":
        const updateinstaltionRate = [...InstallationRates];
        updateinstaltionRate[innerIndex] = value;
        setInstallationRates(updateinstaltionRate);
        break;
      case "transportationrate":
        const updatedTransportationRates = [...transportationRates];
        updatedTransportationRates[innerIndex] = value;
        setTransportationRates(updatedTransportationRates);
        break;
      default:
        break;
    }
  };

  const gstRates = [5, 12, 18, 28];

  let GrandTotal = 0;
  let Rof = 0;
  const [selectedGSTRate, setSelectedGSTRate] = useState(0);

  const calculateGSTAmount = (totalAmount, gstRate) => {
    return (totalAmount * gstRate) / 100;
  };

  const handleGSTRateChange = (e) => {
    const rate = parseInt(e.target.value);
    setSelectedGSTRate(rate);
  };

  const handleSaveQuotation = async (filteredOutletId, innerIndex) => {
    try {
      if (
        !quantity ||
        !Sft ||
        !productionRates ||
        !ProductionCost ||
        !ProductionCost ||
        !InstallationRates ||
        !InstallationCost ||
        !transportationRates ||
        !Rof ||
        !Amount ||
        !selectedGSTRate
      ) {
        return alert("Please fill all the fields");
      }
      const config = {
        url: "/quotation",
        baseURL: ApiURL,
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          No_Quantity: quantity,
          SFT: Sft,
          ProductionRate: productionRates,
          ProductionCost: ProductionCost,
          transportationcost: transportationCost,
          InstallationRate: InstallationRates,
          InstallationCost: InstallationCost,
          transportationRate: transportationRates,
          ROF: Rof,
          Amount: Amount,
          TotalAmount: TotalAmount,
          GST: selectedGSTRate,
          GSTAmount: TotalAmountWithGST,
          GrandTotal: GrandTotal,
          ReeceId: Statedata?.idd,
          outletid: filteredOutletId,
          rowIdentifier: innerIndex,
          BrandState: "telangana",
        },
      };

      const response = await axios(config);
      if (response.status === 200) {
        alert(`Quotation for  ${clientName} Saved Successfully `);

        window.location.assign(
          `/Equotaion?idd=${Statedata?.idd}&type=${clientName}`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleNumeric = (e) => {
    const isNumeric = /^[0-9\b]+$/.test(e.key);
    if (!isNumeric) {
      e.preventDefault();
    }
  };
  const [loading, setLoading] = useState(false);
  const getQuotation = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ApiURL}/getquotation`);
      if (res.status === 200) {
        let filtered = res.data.data?.filter(
          (ele) => ele.ReeceId === Statedata?.idd
        );
        setQuotationData(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <>
        <div className="col-md-1">
          <a href="/Billing">
            <ArrowCircleLeftIcon
              style={{ color: "#068FFF", fontSize: "35px" }}
            />
          </a>
        </div>

        <div className="row  m-auto containerPadding">
          <div className="containerPadding mt-3 shadow p-3 mb-5 bg-white rounded">
            <div className="row containerPadding">
              <div className="col-md-6 ">
                <img
                  width={"200px"}
                  height={"100px"}
                  src="../Assests/images.jpg"
                  alt=""
                />
              </div>
              <h4 className="col-md-6">Estimate</h4>
            </div>

            <Table bordered>
              <thead>
                <tr className="text-center">
                  <th className="thstyle poppinfnt ">SI. NO.</th>
                  <th className="thstyle poppinfnt ">Client Name </th>
                  <th className="thstyle poppinfnt ">Outlet Name </th>
                  <th className="thstyle poppinfnt ">Quantity</th>{" "}
                  <th className="thstyle poppinfnt ">TSFT</th>
                  <th className="thstyle poppinfnt ">Production Rate</th>{" "}
                  <th className="thstyle poppinfnt ">Production Cost</th>
                  <th className="thstyle poppinfnt ">Installation Rate</th>{" "}
                  <th className="thstyle poppinfnt ">Installation Cost</th>
                  <th className="thstyle poppinfnt ">
                    Transportation Rate
                  </th>{" "}
                  <th className="thstyle poppinfnt ">Transportation Cost</th>
                  <th className="thstyle poppinfnt ">Amount</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <>
                  {recceData1?.outletName?.map((filteredOutlet, innerIndex) => {
                    outletIds.push(filteredOutlet._id);
                    innerIndexs.push(innerIndex);

                    let quantityLeft = 0;
                    let Cltheight = 0;
                    let CltWidth = 0;

                    OutletDoneData?.filter((outs) => {
                      if (outs.outletShopId === filteredOutlet._id) {
                        quantityLeft += Number(outs.quantity);
                        Cltheight += Number(outs.height);
                        CltWidth += Number(outs.width);
                      }
                    });

                    Sft.push(
                      parseInt(Cltheight) *
                        parseInt(CltWidth) *
                        parseInt(quantity[innerIndex] || quantityLeft)
                    );

                    ProductionCost = Sft?.map((sft, index) => {
                      return (
                        parseInt(sft) *
                        parseInt(productionRates[innerIndex] || 0)
                      );
                    });

                    InstallationCost = Sft?.map((sft, index) => {
                      return (
                        parseInt(sft) *
                        parseInt(InstallationRates[innerIndex] || 0)
                      );
                    });

                    transportationCost = Sft?.map((sft, index) => {
                      return (
                        parseInt(sft) *
                        parseInt(transportationRates[innerIndex] || 0)
                      );
                    });

                    Amount = Sft?.map((sft, index) => {
                      const productionCost = parseInt(
                        ProductionCost[index] || 0
                      );
                      const installationCost = parseInt(
                        InstallationCost[index] || 0
                      );
                      const TransportationCost = parseInt(
                        transportationCost[index] || 0
                      );

                      return (
                        parseInt(productionCost) +
                        parseInt(installationCost) +
                        parseInt(TransportationCost)
                      );
                    });

                    TotalAmount = Amount?.reduce((acc, value) => acc + value, 0);

                    let GSTAmount = calculateGSTAmount(
                      TotalAmount,
                      selectedGSTRate
                    );

                    let TotalAmountWithGST = TotalAmount + GSTAmount;

                    GrandTotal += TotalAmountWithGST;
                    Rof = Math.round(GrandTotal);

                    return (
                      <tr key={innerIndex}>
                        <td className="thstyle poppinfnt ">{innerIndex + 1}</td>
                        <td className="thstyle poppinfnt ">
                          {recceData1?.BrandName}
                        </td>
                        <td className="thstyle poppinfnt ">
                          {filteredOutlet?.ShopName}
                        </td>
                        <td className="thstyle poppinfnt ">
                          <Form.Control
                            className="col-md-5"
                            name="quantity"
                            defaultValue={
                              !quantityLeft
                                ? quantity[innerIndex]
                                : quantityLeft
                            }
                            onKeyPress={(e) => handleNumeric(e)}
                            onChange={(e) =>
                              handleFieldChange(e, innerIndex, "Quantity")
                            }
                            placeholder="Quantity"
                            type="text"
                          />
                        </td>
                        <td className="thstyle poppinfnt ">
                          {Sft[innerIndex]?.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </td>{" "}
                        <td className="thstyle poppinfnt ">
                          <Form.Control
                            className="col-md-5"
                            value={productionRates[innerIndex]}
                            onChange={(e) =>
                              handleFieldChange(
                                e,
                                innerIndex,
                                "Productionrates"
                              )
                            }
                            onKeyPress={(e) => handleNumeric(e)}
                            placeholder="Production Rate"
                            type="text"
                            name="product"
                          />
                        </td>
                        <td className="thstyle poppinfnt ">
                          {ProductionCost[innerIndex].toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </td>
                        <td className="thstyle poppinfnt ">
                          <Form.Control
                            className="col-md-5"
                            value={InstallationRates[innerIndex]}
                            onChange={(e) =>
                              handleFieldChange(
                                e,
                                innerIndex,
                                "InstalationRates"
                              )
                            }
                            onKeyPress={(e) => handleNumeric(e)}
                            placeholder="Installation Rate"
                            type="text"
                            name="InstalationRates"
                          />
                        </td>
                        <td className="thstyle poppinfnt ">
                          {InstallationCost[innerIndex]?.toLocaleString(
                            "en-IN",
                            {
                              style: "currency",
                              currency: "INR",
                            }
                          )}
                        </td>
                        <td className="thstyle poppinfnt ">
                          <Form.Control
                            className="col-md-5"
                            value={transportationRates[innerIndex]}
                            onChange={(e) =>
                              handleFieldChange(
                                e,
                                innerIndex,
                                "transportationrate"
                              )
                            }
                            name="transportationrate"
                            onKeyPress={(e) => handleNumeric(e)}
                            placeholder="Transportation Rate"
                            type="text"
                          />
                        </td>
                        <td className="thstyle poppinfnt ">
                          {transportationCost[innerIndex]?.toLocaleString(
                            "en-IN",
                            {
                              style: "currency",
                              currency: "INR",
                            }
                          )}
                        </td>
                        <td className="thstyle poppinfnt ">
                          {" "}
                          {Amount[innerIndex].toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={"10"}></td>
                    <td className="thstyle poppinfnt bold">Total Amount</td>
                    <td className="thstyle poppinfnt bold">
                      {TotalAmount.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="thstyle poppinfnt bold" colSpan={"10"}></td>
                    <td className="thstyle poppinfnt bold">
                      GST @{" "}
                      <select
                        value={selectedGSTRate}
                        onChange={handleGSTRateChange}
                      >
                        {gstRates?.map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}%
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="thstyle poppinfnt bold">
                      {selectedGSTRate}
                    </td>
                  </tr>

                  <tr>
                    <td className="thstyle poppinfnt bold" colSpan={"10"}></td>
                    <td className="thstyle poppinfnt bold">Rof</td>
                    <td className="thstyle poppinfnt bold">
                      {Rof.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="thstyle poppinfnt bold" colSpan={"10"}></td>
                    <td className="thstyle poppinfnt bold">Grand Total</td>
                    <td className="thstyle poppinfnt bold">
                      {GrandTotal.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                  </tr>
                </>
              </tbody>
            </Table>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <Button
                onClick={() => handleSaveQuotation(outletIds, innerIndexs)}
                className="m-2"
              >
                Save Quotation
              </Button>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default ReadToBill;
