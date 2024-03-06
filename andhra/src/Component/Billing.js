import { React, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/esm/Button";
import Header from "./Header";
import moment from "moment";
import axios from "axios";

import { Link } from "react-router-dom";

function Billing() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);

  let serialNumber = 0;
  let rowsDisplayed = 0;

  const [filterStartDate, setFilterStartDate] = useState("");

  const [filterEndDate, setFilterEndDate] = useState("");
  const [displayedData, setDisplayedData] = useState([]);
  const [FilterBill, setFilterBill] = useState([]);

  const [ClientInfo, setClientInfo] = useState([]);
  const [recceData, setRecceData] = useState([]);
  const [searchshopName, setSearchshopName] = useState("");
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const [selctedStatus, setSelectedStatus] = useState("--Select All--");
  const [QuotationData, setQuotationData] = useState([]);
  const ApiURL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    getAllRecce();
    getAllOutlets();
    getAllClientsInfo();
    getQuotation();
  }, []);
  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        let filterCityWise = res.data.client?.filter(
          (ele) => ele?.state === "Andhrapradesh"
        );
        setClientInfo(filterCityWise);
      }
    } catch (err) {
      console.log(err, "err");
    }
  };
  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "Andhrapradesh"
        );
        setRecceData(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterDate = (data) => {
    return data?.filter((item) => {
      const createdAtDate = moment(item.createdAt, "YYYY-MM-DD");
      const startDate = filterStartDate
        ? moment(filterStartDate, "YYYY-MM-DD")
        : null;
      const endDate = filterEndDate
        ? moment(filterEndDate, "YYYY-MM-DD")
        : null;

      if (startDate && !createdAtDate.isSameOrAfter(startDate)) {
        return false;
      }

      if (endDate && !createdAtDate.isSameOrBefore(endDate)) {
        return false;
      }

      return true;
    });
  };
  const filteredData = filterDate(recceData);
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };

  const [data1, setdata1] = useState(rowsPerPage1);
  useEffect(() => {
    setdata1(rowsDisplayed);
  }, [rowsPerPage1, data1]);
  let outletName = 0;

  filteredData?.filter((Ele) => {
    if (Ele?.outletName.length > 0) {
      outletName++;
    }
  });

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };
  const filterData = () => {
    const isSelectAll = selctedStatus === "--Select All--";

    const filteredData = recceData?.filter((recceItem) => {
      if (isSelectAll) {
        return true;
      }

      let NumberOfInstallation = 0;
      let IsQuotationCreated = 0;
      let IsBillPending = 0;
      let InvoiceCreated = 0;

      recceItem?.outletName?.forEach((outlet) => {
        let outletDoneid = OutletDoneData?.find(
          (fp) => fp?.outletShopId === outlet?._id
        );

        if (!outletDoneid?.installationStatus) {
          IsBillPending++;
        }

        if (
          QuotationData.length === 0 &&
          outletDoneid?.installationStatus === true
        ) {
          NumberOfInstallation++;
        }

        QuotationData?.forEach((quotation) => {
          if (
            outletDoneid?.installationStatus === true &&
            quotation?.ReeceId !== recceItem?._id
          ) {
            NumberOfInstallation++;
          }

          if (
            outletDoneid?.installationStatus === true &&
            outlet.fabricationstatus === "Completed" &&
            outlet.printingStatus === "Completed" &&
            quotation.ReeceId === recceItem._id
          ) {
            IsQuotationCreated++;
            InvoiceCreated++;
            console.log("IsQuotationCreated and InvoiceCreated incremented");
          }
        });
      });

      const isBrandNameMatch =
        recceItem.BrandName?.toLowerCase()?.includes(
          searchshopName?.toLowerCase()
        ) || !searchshopName;

      const isReadyToBill =
        selctedStatus === "Ready to bill" &&
        NumberOfInstallation >= recceItem?.outletName.length;

      const isQuotation =
        selctedStatus === "Quotation" && IsQuotationCreated > 0;

      const isPending = selctedStatus === "Pending" && IsBillPending > 0;

      const isInvoice = selctedStatus === "Invoice" && InvoiceCreated > 0;

      return (
        isBrandNameMatch &&
        (isReadyToBill || isQuotation || isPending || isInvoice)
      );
    });

    console.log("Filtered Data:", filteredData);

    // Apply search filter separately if searchshopName is present
    const dataToDisplay = searchshopName
      ? filteredData?.filter((recceItem) =>
          recceItem.BrandName?.toLowerCase()?.includes(
            searchshopName?.toLowerCase()
          )
        )
      : filteredData;

    const paginatedData = dataToDisplay?.slice(
      (currentPage - 1) * rowsPerPage1,
      currentPage * rowsPerPage1
    );

    setFilterBill(paginatedData);
  };

  useEffect(() => {
    filterData();
  }, [selctedStatus, recceData, searchshopName, rowsPerPage1, currentPage]);

  const getAllOutlets = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        setOutletDoneData(res?.data?.outletData);
      }
    } catch (err) {
      // alert(err);
      console.log(err);
    }
  };

  const getQuotation = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getquotation`);
      if (res.status === 200) {
        let quotation = res.data.data?.filter(
          (rece) => rece.BrandState === "Andhrapradesh"
        );
        setQuotationData(quotation);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <Header />
      <div className="row  m-auto containerPadding">
        <div className="row">
          <div className="col-md-8">
            <Form.Group className="row m-auto"></Form.Group>{" "}
          </div>
          {/* <div className="col-md-3 m-auto text-end">
            <TuneIcon onClick={handleFilter} />
          </div> */}
        </div>
        {/* <div className="row m-auto">
          <div
            className={!filter ? "col-md-2  hide" : "col-md-2 card"}
            style={{
              position: "absolute",
              top: "24%",
              right: "1.8%",
              zIndex: "10",
              backgroundColor: "white",
              boxShadow: "2px 2px 2px white",
            }}
          >
            <p>Sort By</p>
            <p>Date(new to old)</p>
            <p>Date (old to new)</p>
          </div>{" "}
        </div> */}
        <div className="col-md-6 ">
          <div className="row">
            <Form.Label>Search Client</Form.Label>
            <div className="col-md-8 ">
              <Form.Control
                className="col-md-12"
                placeholder="Search  outlet here...! "
                onChange={(e) => setSearchshopName(e.target.value)}
                value={searchshopName}
              />
            </div>
          </div>
        </div>
        <div className="row mb-4 mt-3">
          <div className="col-md-2 ">
            <div className="col-md-8  mb-2">
              <span>{data1}</span> of <span>{outletName}</span>
            </div>
            <Form.Control
              className="col-md-10"
              as="select"
              value={rowsPerPage1}
              onChange={handleRowsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
              <option value={140}>140</option>
              <option value={200}>200</option>
              <option value={300}>300</option>
              <option value={400}>400</option>
              <option value={600}>600</option>
              <option value={700}>700</option>
              <option value={1000}>1000</option>
              <option value={1500}>1500</option>
              <option value={10000}>10000</option>
            </Form.Control>
          </div>

          <div className="col-md-5 float-end">
            <div className="row">
              <label className="col-md-5   mb-2">Start Date:</label>
              <label className="col-md-6  mb-2">End Date:</label>
              <div className="col-md-5 ">
                <Form.Control
                  type="date"
                  value={filterStartDate}
                  onChange={handleFilterStartDateChange}
                />
              </div>
              <div className="col-md-5 ">
                <Form.Control
                  type="date"
                  value={filterEndDate}
                  onChange={handleFilterEndDateChange}
                />
              </div>
              <div className="col-md-2 ">
                <Button onClick={handleClearDateFilters}>Clear</Button>
              </div>
            </div>
          </div>

          <Col className="col-md-4">
            <label className="mb-2">Select Status</label>
            <div className="row m-auto">
              <Form.Select
                value={selctedStatus}
                className="shadow-none p-2 bg-light rounded"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                }}
              >
                <option value="--Select All--">--Select All--</option>
                <option value="Ready to bill"> Ready to bill</option>
                <option value="Quotation"> Quotation</option>
                <option value="Invoice">Invoice</option>
                <option value="Pending">Pending</option>
              </Form.Select>{" "}
            </div>
          </Col>
        </div>
        <div className="row">
          <table className="t-p">
            <thead className="t-c">
              <tr>
                <th className="th_s p-1">SI.No</th>
                <th className="th_s p-1">Job.No</th>
                <th className="th_s p-1">Client Name </th>

                <th className="th_s p-1">Contact Number</th>
                <th className="th_s p-1">Date</th>
                <th className="th_s p-1">Recce Status</th>
                <th className="th_s p-1">Design Status</th>
                <th className="th_s p-1">Printing Status</th>
                <th className="th_s p-1">Fabrication Status</th>
                <th className="th_s p-1">Installation Status</th>
                <th className="th_s p-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {FilterBill?.map((recceItem, index) => {
                if (recceItem.outletName.length !== 0) {
                  if (rowsDisplayed < rowsPerPage1) {
                    let JobNob = 0;

                    const desiredClient = ClientInfo?.find(
                      (client) => client._id === recceItem.BrandId
                    );
                    let JobStatus;
                    let TotalPending = 0;
                    let TotalFabrication = 0;
                    let TotalInstalationPending = 0;
                    let TotalInstalation = 0;
                    let NumberOfRecce = 0;
                    let NumberOfDesign = 0;
                    let NumberOfPrinting = 0;
                    let NumberOfFabircaiton = 0;
                    let NumberOfInstalation = 0;
                    recceItem.outletName?.map((outlet) => {
                      if (outlet.vendor !== null) {
                        TotalPending++;
                        JobStatus = OutletDoneData?.filter(
                          (fp) => fp?.outletShopId === outlet?._id
                        );

                        if (JobStatus[0]?.jobStatus === true) {
                          NumberOfRecce++;
                        }
                        if (
                          JobStatus[0]?.jobStatus === true &&
                          outlet.Designstatus === "Completed"
                        ) {
                          NumberOfDesign++;
                        }
                        if (
                          JobStatus[0]?.jobStatus === true &&
                          outlet.printingStatus === "Completed"
                        ) {
                          NumberOfPrinting++;
                        }
                        if (
                          JobStatus[0]?.jobStatus === true &&
                          outlet.printingStatus === "Completed" &&
                          outlet.printingStatus === "Completed" &&
                          outlet.fabricationstatus === "Completed"
                        ) {
                          NumberOfFabircaiton++;
                        }
                        if (
                          outlet.InstalationGroup !== null &&
                          outlet.printingStatus === "Completed" &&
                          outlet.printingStatus === "Completed" &&
                          outlet.fabricationstatus === "Completed"
                        ) {
                          TotalInstalationPending++;
                        }
                        if (
                          JobStatus[0]?.installationStatus === true &&
                          outlet.printingStatus === "Completed" &&
                          outlet.printingStatus === "Completed" &&
                          outlet.fabricationstatus === "Completed"
                        ) {
                          NumberOfInstalation++;
                        }
                        if (
                          JobStatus[0]?.jobStatus === true &&
                          outlet.printingStatus === "Completed" &&
                          outlet.printingStatus === "Completed" &&
                          outlet.OutlateFabricationNeed === "Yes"
                        ) {
                          TotalFabrication++;
                        }
                        if (
                          JobStatus[0]?.jobStatus === true &&
                          outlet.printingStatus === "Completed" &&
                          outlet.printingStatus === "Completed" &&
                          outlet.OutlateFabricationNeed === "Yes" &&
                          outlet.OutlateFabricationDeliveryType ===
                            "Go to installation"
                        ) {
                          TotalInstalation++;
                        }
                      }
                    });
                    let filtered = QuotationData?.find(
                      (ele) => ele?.ReeceId === recceItem?._id
                    );

                    if (recceItem._id[index]) {
                      JobNob = index + 1;
                    }

                    serialNumber++;
                    rowsDisplayed++;

                    return (
                      <tr className="tr_C" key={serialNumber}>
                        <td className="td_S p-1">{index + 1}</td>
                        <td className="td_S p-1">Job{JobNob}</td>
                        <td className="td_S p-1">{recceItem?.BrandName}</td>
                        <td className="td_S p-1">
                          {desiredClient?.ClientsContactNumber1}
                        </td>

                        <td className="td_S p-1 text-nowrap text-center">
                          {recceItem.createdAt
                            ? new Date(recceItem.createdAt)
                                .toISOString()
                                .slice(0, 10)
                            : ""}
                        </td>
                        <td className="td_S p-1 text-nowrap text-center">
                          <div className="row">
                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Total </span>{" "}
                              <span className="col-md-6">
                                {" "}
                                {recceItem.outletName?.length}
                              </span>
                            </span>

                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Pending</span>{" "}
                              <span className="col-md-6">
                                {" "}
                                {Number(TotalPending) - Number(NumberOfRecce)}
                              </span>
                            </span>

                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Completed</span>{" "}
                              <span className="col-md-6"> {NumberOfRecce}</span>
                            </span>
                          </div>
                        </td>

                        <td className="td_S p-1 text-center">
                          <div className="row">
                            <div className="row">
                              <span className="col-md-8">Total </span>
                              <span className="col-md-4">{NumberOfRecce}</span>
                            </div>
                            <div className="row">
                              <span className="col-md-8">Done</span>
                              <span className="col-md-4">{NumberOfDesign}</span>
                            </div>
                          </div>
                        </td>
                        <td className="td_S p-1 text-center">
                          <div className="row">
                            <div className="row">
                              <span className="col-md-8">Total </span>
                              <span className="col-md-4">{NumberOfRecce}</span>
                            </div>
                            <div className="row">
                              <span className="col-md-8">Done</span>
                              <span className="col-md-4">
                                {NumberOfPrinting}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="td_S p-1 text-center">
                          <div className="row">
                            <div className="row">
                              <span className="col-md-8">Total </span>
                              <span className="col-md-4">
                                {TotalFabrication}
                              </span>
                            </div>
                            <div className="row">
                              <span className="col-md-8">Done </span>
                              <span className="col-md-4">
                                {NumberOfFabircaiton}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="td_S p-1 text-center">
                          <div className="row">
                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Total </span>{" "}
                              <span className="col-md-6">
                                {" "}
                                {TotalInstalation}
                              </span>
                            </span>

                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Pending</span>{" "}
                              <span className="col-md-6">
                                {" "}
                                {Number(TotalInstalationPending) -
                                  Number(NumberOfInstalation)}
                              </span>
                            </span>

                            <span className="row m-auto">
                              <span className="col-md-4 me-2"> Completed</span>{" "}
                              <span className="col-md-6">
                                {" "}
                                {NumberOfInstalation}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="td_S ">
                          {Number(NumberOfInstalation) !==
                            Number(recceItem.outletName?.length) && (
                            <span className="row">
                              <Link
                                variant="info "
                                to="/Estimate"
                                state={{
                                  idd: recceItem._id,
                                  client: recceItem.BrandName,
                                }}
                                style={{
                                  cursor: "pointer",
                                  color: "skyblue",
                                }}
                              >
                                view
                              </Link>
                            </span>
                          )}

                          <>
                            {filtered && (
                              <>
                                {" "}
                                <Link
                                  to="/invoice"
                                  state={{
                                    idd: recceItem._id,
                                    status: "view",
                                    client: recceItem.BrandName,
                                  }}
                                >
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    Download Invoice
                                  </span>
                                </Link>
                                <Link
                                  to="/Equotaion"
                                  state={{
                                    idd: recceItem._id,
                                    client: recceItem.BrandName,
                                  }}
                                >
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    Quotation
                                  </span>
                                </Link>
                              </>
                            )}
                            {Number(NumberOfInstalation) ===
                              Number(recceItem.outletName?.length) &&
                              !filtered && (
                                <Link
                                  to="/EReadyBill"
                                  state={{
                                    idd: recceItem._id,
                                    client: recceItem.BrandName,
                                  }}
                                >
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    Ready to Bill
                                  </span>
                                </Link>
                              )}
                          </>
                        </td>
                      </tr>
                    );
                  }
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export default Billing;
