import { React, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/esm/Table";
import Header from "./Header";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import ShareIcon from "@mui/icons-material/Share";

import axios from "axios";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Estimate() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [recceData1, setRecceData1] = useState([]);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const location = useLocation();
  const searchParams = location.state;
  const idd = searchParams?.idd;
  const clientName = searchParams?.client;
  const [ClientInfo, setClientInfo] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [productionRates, setProductionRates] = useState([]);
  const [transportationRates, setTransportationRates] = useState([]);
  const [InstallationRates, setInstallationRates] = useState([]);
  const [selectrecceStatus, setSelectRecceStatus] = useState(null);
  const [FilteredEstimateData, setFilteredEstimateData] = useState();
  const [QuotationData, setQuotationData] = useState([]);

  const [showSavedquotaion, setshowSavedquotaion] = useState(true);
  const [RecceId, setRecceId] = useState(null);
  let TotalAmount = 0;
  let TotalAmountWithGST = 0;
  let Sft = [];
  let Amount = [];
  let ProductionCost = [];
  let InstallationCost = [];
  let transportationCost = [];
  let brandName;
  let desiredClient;
  const outletIds = [];
  let innerIndexs = [];
  useEffect(() => {
    getAllRecce();
    getAllClientsInfo();
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

  const filterData = (selectedRecceStatus) => {
    const filteredData = recceData1?.flatMap((recceItem) => {
      return recceItem?.outletName?.filter((outlet) => {
        let outletDoneid = OutletDoneData?.filter(
          (fp) => fp?.outletShopId === outlet?._id
        );
        let RecceJobstatus;
        let InstalationJobstatus;
        if (outletDoneid[0]?.jobStatus === true) {
          RecceJobstatus = "Completed";
        }
        if (outletDoneid[0]?.installationStatus === true) {
          InstalationJobstatus = "Completed";
        }
        switch (selectedRecceStatus) {
          case "Recce":
            return RecceJobstatus;
          case "Design":
            return outlet.Designstatus === "Completed";
          case "Printing":
            return outlet.printingStatus === "Completed";
          case "Fabrication":
            return (
              outlet.OutlateFabricationNeed === "Yes" &&
              outlet.fabricationstatus === "Completed"
            );
          case "Instalation":
            return InstalationJobstatus;
          default:
            return true;
        }
      });
    });

    if (
      recceData1
        ?.flatMap((ele) => ele.outletName.length)
        .every((length) => length === filteredData.length)
    ) {
      setFilteredEstimateData(filteredData);
    }
  };

  useEffect(() => {
    filterData(selectrecceStatus);
  }, [selectrecceStatus]);

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let rdata = res?.data?.RecceData.filter(
          (rece) => rece.BrandState === "karnataka"
        );
        let RecceID = rdata?.filter((ele) => ele?._id === idd);

        setRecceData1(RecceID);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        let filterCityWise = res.data.client?.filter(
          (ele) => ele?.state === "karnataka"
        );
        setClientInfo(filterCityWise);
      }
    } catch (err) {
      console.log(err, "err");
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
          ReeceId: idd,
          outletid: filteredOutletId,
          rowIdentifier: innerIndex,  BrandState: "hyderabad",
        },
      };

      const response = await axios(config);
      if (response.status === 200) {
        alert(`Quotation for  ${clientName} Saved Successfully `);
        window.location.assign(`/Equotaion?idd=${idd}&type=${clientName}`);
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
        let quotation = res.data.data?.filter(
          (rece) => rece.BrandState === "karnataka"
        );
        let filtered = quotation?.filter((ele) => ele.ReeceId === idd);
        setQuotationData(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  console.log(FilteredEstimateData, "esitmate");
  return (
    <>
      <Header />
      {loading ? (
        <div className="row" style={{ height: "100" }}>
          <div className="col-md-4"> </div>
          <div className="col-md-4"> Loading</div>
          <div className="col-md-4"> </div>
        </div>
      ) : (
        <>
          <div className="row  m-auto containerPadding">
            <div className="col-md-1">
              <a href="/Billing">
                <ArrowCircleLeftIcon
                  style={{ color: "#068FFF", fontSize: "35px" }}
                />
              </a>
            </div>
            <div className="col-md-5">
              <Form.Select
                as="select"
                value={selectrecceStatus}
                onChange={(e) => {
                  const selectedValue = e.target.value;

                  if (selectedValue !== "Choose...") {
                    setSelectRecceStatus(selectedValue);
                  }
                }}
              >
                <option>Choose...</option>
                <option value="Recce">Recce</option>
                <option value="Design">Design</option>
                <option value="Printing">Printing</option>
                <option value="Fabrication">Fabrication</option>
                <option value="Instalation">Instalation</option>
              </Form.Select>
            </div>
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
                    <th className="thstyle poppinfnt ">
                      Installation Rate
                    </th>{" "}
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
                    {FilteredEstimateData?.map((filteredOutlet, innerIndex) => {
                      outletIds.push(filteredOutlet._id);
                      innerIndexs.push(innerIndex);
                      recceData1?.map((recceItem, recceIndex) => {
                        recceItem?.outletName?.filter((outlet) => {
                          desiredClient = ClientInfo?.find(
                            (client) => client._id === recceItem.BrandId
                          );

                          if (outlet._id === filteredOutlet._id) {
                            brandName = desiredClient;
                          }
                        });
                      });
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

                      TotalAmount = Amount.reduce(
                        (acc, value) => acc + value,
                        0
                      );

                      let GSTAmount = calculateGSTAmount(
                        TotalAmount,
                        selectedGSTRate
                      );

                      let TotalAmountWithGST = TotalAmount + GSTAmount;

                      GrandTotal += TotalAmountWithGST;
                      Rof = Math.round(GrandTotal);

                      return (
                        <tr key={innerIndex}>
                          <td className="thstyle poppinfnt ">
                            {innerIndex + 1}
                          </td>
                          <td className="thstyle poppinfnt ">
                            {brandName?.clientsBrand}
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
                            {ProductionCost[innerIndex].toLocaleString(
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
                      <td
                        className="thstyle poppinfnt bold"
                        colSpan={"10"}
                      ></td>
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
                      <td
                        className="thstyle poppinfnt bold"
                        colSpan={"10"}
                      ></td>
                      <td className="thstyle poppinfnt bold">Rof</td>
                      <td className="thstyle poppinfnt bold">
                        {Rof.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="thstyle poppinfnt bold"
                        colSpan={"10"}
                      ></td>
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
      )}
    </>
  );
}

export default Estimate;
