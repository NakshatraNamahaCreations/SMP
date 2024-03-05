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

function EQuotation() {
  const ApiURL = process.env.REACT_APP_API_URL;

  const [recceData1, setRecceData1] = useState([]);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const location = useLocation();

  const Statedata = location.state || null;
  const clientName = Statedata?.client;

  const [QuotationData, setQuotationData] = useState([]);

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
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let RecceID = res?.data?.RecceData?.filter(
          (ele) => ele?._id === Statedata?.idd
        );

        setRecceData1(RecceID);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [loading, setLoading] = useState(false);

  const getQuotation = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ApiURL}/getquotation`);
      if (res.status === 200) {
        let filtered = res.data.data?.filter(
          (ele) => ele?.ReeceId === Statedata?.idd
        );

        setQuotationData(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  let TotalAmount2 = 0;
  let selectedGSTRate2 = 0;
  let Rof2 = 0;
  let GrandTotal2 = 0;

  const generatePDF = () => {
    const element = document.querySelector(".quotation");
    const table = element.querySelector("table");
    table.style.overflowX = "auto";
    table.style.width = "100%";
    table.style.maxWidth = "none";

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = table.offsetWidth;
      const pdfHeight = table.offsetHeight;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [pdfWidth, pdfHeight],
      });
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`${clientName} quotation.pdf`);
    });
  };

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
          <div className="col-md-1">
            <a href="/Billing">
              <ArrowCircleLeftIcon
                style={{ color: "#068FFF", fontSize: "35px" }}
              />
            </a>
          </div>

          <div className="row m-auto containerPadding">
            <div className="containerPadding mt-3 quotation">
              <Table bordered className="table">
                <thead>
                  <tr>
                    <th colSpan="14">{clientName} Quotation</th>
                  </tr>
                  <tr className="text-center">
                    <th className="thstyle poppinfnt">SI. NO.</th>
                    <th className="thstyle poppinfnt">Client Name </th>
                    <th className="thstyle poppinfnt">Material </th>
                    <th className="thstyle poppinfnt">Height</th>
                    <th className="thstyle poppinfnt">Width</th>
                    <th className="thstyle poppinfnt">Quantity</th>{" "}
                    <th className="thstyle poppinfnt">TSFT</th>
                    <th className="thstyle poppinfnt">Production Rate</th>{" "}
                    <th className="thstyle poppinfnt">Production Cost</th>
                    <th className="thstyle poppinfnt">
                      Installation Rate
                    </th>{" "}
                    <th className="thstyle poppinfnt">Installation Cost</th>
                    <th className="thstyle poppinfnt">
                      Transportation Rate
                    </th>{" "}
                    <th className="thstyle poppinfnt">Transportation Cost</th>
                    <th className="thstyle poppinfnt">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-center ">
                  <>
                    {console.log("QuotationData", QuotationData)}
                    {QuotationData?.flatMap((filteredOutlet, innerIndex) => {
                      console.log("filteredOutlet", filteredOutlet);
                      return filteredOutlet?.outletid?.map(
                        (item, outletIndex) => {
                          let No_Quantity =
                            filteredOutlet?.No_Quantity[outletIndex];

                          let TSFT = filteredOutlet?.SFT[outletIndex];
                          let Amount = filteredOutlet?.Amount[outletIndex];
                          let InstallationRate =
                            filteredOutlet?.InstallationRate;
                          let InstallationCost =
                            filteredOutlet?.InstallationCost[outletIndex];
                          let ProductionRate =
                            filteredOutlet?.ProductionRate[outletIndex];
                          let ProductionCost =
                            filteredOutlet?.ProductionCost[outletIndex];
                          let transportationRate =
                            filteredOutlet?.transportationRate[outletIndex];
                          let transportationcost =
                            filteredOutlet?.transportationcost[outletIndex];
                          TotalAmount2 = filteredOutlet?.TotalAmount;

                          selectedGSTRate2 = filteredOutlet?.GST;
                          Rof2 = filteredOutlet?.ROF;

                          GrandTotal2 = Number(
                            filteredOutlet?.GrandTotal.toFixed(2)
                          );

                          return recceData1?.flatMap((receeitem) =>
                            receeitem?.outletName
                              ?.filter((ele) => ele?._id === item)
                              ?.map((outlet) => (
                                <tr key={innerIndex}>
                                  <td className="thstyle poppinfnt">
                                    {outletIndex + 1}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {receeitem?.BrandName}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {outlet?.category}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {outlet.height}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {outlet?.width}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {No_Quantity}
                                  </td>
                                  <td className="thstyle poppinfnt">{TSFT}</td>
                                  <td className="thstyle poppinfnt">
                                    {ProductionRate}
                                  </td>{" "}
                                  <td className="thstyle poppinfnt">
                                    {ProductionCost}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {InstallationRate}
                                  </td>{" "}
                                  <td className="thstyle poppinfnt">
                                    {InstallationCost}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {transportationRate}
                                  </td>{" "}
                                  <td className="thstyle poppinfnt">
                                    {transportationcost}
                                  </td>
                                  <td className="thstyle poppinfnt">
                                    {Amount}
                                  </td>
                                </tr>
                              ))
                          );
                        }
                      );
                    })}

                    <tr>
                      <td className="thstyle poppinfnt" colSpan={"12"}></td>
                      <td className="thstyle poppinfnt bold">Total Amount</td>
                      <td className="thstyle poppinfnt bold">
                        {TotalAmount2.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="thstyle poppinfnt" colSpan={"12"}></td>
                      <td className="thstyle poppinfnt bold">GST @ </td>
                      <td className="thstyle poppinfnt bold">
                        {selectedGSTRate2}
                      </td>
                    </tr>

                    <tr>
                      <td className="thstyle poppinfnt" colSpan={"12"}></td>
                      <td className="thstyle poppinfnt bold">rof</td>
                      <td className="thstyle poppinfnt bold">{Rof2}</td>
                    </tr>
                    <tr>
                      <td className="thstyle poppinfnt" colSpan={"12"}></td>
                      <td className="thstyle poppinfnt bold">Grand Total</td>
                      <td className="thstyle poppinfnt bold">{GrandTotal2}</td>
                    </tr>
                  </>
                </tbody>
              </Table>
            </div>

            <div className="col-md-6">
              <span className="poppinfnt"> Download Quotation</span>
              <DownloadForOfflineIcon
                onClick={generatePDF}
                style={{ color: "#068FFF", fontSize: "35px" }}
              />{" "}
            </div>
            <div className="col-md-3">
              <Button className="m-2">
                <Link
                  to="/Estimate"
                  state={{
                    idd: Statedata?.idd,
                    client: clientName,
                  }}
                >
                  Modify Quotation
                </Link>
              </Button>
            </div>

            <div className="col-md-2">
              <div className="col-md-2">
                <Button className="m-2 text-white">
                  <Link
                    to="/invoice"
                    state={{
                      idd: Statedata?.idd,
                      client: clientName,
                    }}
                  >
                    Invoice
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default EQuotation;
