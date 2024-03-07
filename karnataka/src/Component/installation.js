import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import "react-data-table-component-extensions/dist/index.css";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import { Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Row from "react-bootstrap/Row";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink, CSVDownload } from "react-csv";
import * as XLSX from "xlsx"; // Import the xlsx library
import axios from "axios";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin

export default function Installation() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [recceData, setRecceData] = useState([]);

  const [displayedData, setDisplayedData] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAction, setselectAction] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [moreoption, setmoreoption] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRecceItems1, setSelectedRecceItems1] = useState([]);
  const [RecceId, setRecceId] = useState(null);
  const [show, setShow] = useState(false);
  const [selctedVendor, setselctedVendor] = useState(null);
  const [vendordata, setVendorData] = useState([]);
  const handleClose1 = () => setShow(false);
  const [selctedStatus, setSelectedStatus] = useState("--Select All--");
  const [OutletDoneData, setOutletDoneData] = useState([]);
  useEffect(() => {
    getAllRecce();

    getAllVendorInfo();
    getAllOutlets();
  }, []);

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "karnataka"
        );
        setRecceData(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAllOutlets = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        setOutletDoneData(res?.data?.outletData);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };
  console.log(recceData);
  const getAllVendorInfo = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/Vendor/vendorInfo/getvendorinfo`
      );

      if (response.status === 200) {
        let vendors = response.data.vendors;
        let filterCityWise = vendors?.filter((ele) => ele.City === "karnataka");
        setVendorData(filterCityWise);
      } else {
        console.log("Unable to fetch data");
      }
    } catch (err) {
      console.log("can't able to fetch data");
    }
  };

  const handleExportPDF = () => {
    if (!selectedRecceItems1 || selectedRecceItems1.length === 0) {
      alert("Please select at least one record to export");
      return;
    }

    if (!filteredData) {
      alert("No data available for export");
      return;
    }

    const pdf = new jsPDF();
    const tableColumn = [
      "SI.No",
      "Shop Name",
      "Contact",
      "Address",
      "City",
      "Zone",
      "Date",
      "Status",
    ];

    let serialNumber = 0;

    const tableData = selectedRecceItems1?.flatMap((outletidd) =>
      filteredData?.flatMap((Ele) =>
        Ele?.outletName
          ?.filter(
            (outle) =>
              outle?._id === outletidd &&
              outle?.Designstatus?.includes("Completed") &&
              outle?.OutlateFabricationDeliveryType?.includes(
                "Go to installation"
              )
          )
          ?.map((item) => ({
            siNo: ++serialNumber,
            shopName: item.ShopName,
            contact: item.OutletContactNumber,
            address: item.OutletAddress,
            city: item.OutletCity,
            zone: item.OutletZone,
            date: item.createdAt
              ? new Date(item.createdAt)?.toISOString()?.slice(0, 10)
              : "",
            status: item.RecceStatus,
          }))
      )
    );

    if (tableData.length === 0) {
      alert("No data available for the selected records");
      return;
    }

    pdf.autoTable({
      head: [tableColumn],
      body: tableData?.map((item) => Object.values(item)),
      startY: 20,
      styles: {
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 10 },
      },
      bodyStyles: { borderColor: "black", border: "1px solid black" },
    });

    pdf.save("Installation.pdf");
  };

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
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

  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };

  let serialNumber = 0;
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [data1, setdata1] = useState(0);

  const [filteredDatas, setFilteredData] = useState([]);
  useEffect(() => {
    filterData();
    setdata1(rowsDisplayed);
  }, [rowsPerPage1, currentPage]);
  const filterData = () => {
    const uniqueOutletShopIds = new Set();
    const filtered = recceData?.map((Ele) => {
      const filteredOutlets = Ele.outletName?.reduce((acc, outlet) => {
        const outletDoneItem = OutletDoneData?.find(
          (ele) => ele.outletShopId === outlet._id
        );

        if (outletDoneItem?.jobStatus === true) {
          if (!uniqueOutletShopIds.has(outlet._id)) {
            uniqueOutletShopIds.add(outlet._id);
            acc.push(outlet);
          }
        }

        return acc;
      }, []);

      if (filteredOutlets.length > 0) {
        return { ...Ele, outletName: filteredOutlets };
      }

      return null;
    });

    setFilteredData(filtered?.filter(Boolean) || []);
  };

  let outletName = 0;

  filteredDatas?.filter((Ele) => {
    if (Ele?.outletName.length > 0) {
      outletName += Ele?.outletName.length;
    }
  });
  let rowsDisplayed = 0;
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    setCurrentPage(1);
  };
  const handleOutletToggleSelect = (receeid, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems1.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems1?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems1, outletId];
    }

    setSelectedRecceItems1(updatedSelectedRecceItems);
    setRecceId(receeid);
    setmoreoption(updatedSelectedRecceItems.length > 0);
  };

  const handleOutletSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = filteredData?.flatMap((item) =>
        item?.outletName?.map((outlet) => outlet?._id)
      );
      setSelectedRecceItems1(allOutletIds);
    } else {
      setSelectedRecceItems1([]);
    }

    setmoreoption(!selectAll);
  };

  const selectedv = vendordata?.find((vendor) => vendor._id === selctedVendor);

  const AssignVendor = async (selectedv) => {
    try {
      const updatedRecceData = [];

      for (const outlateid of selectedRecceItems1) {
        for (const recceid of filteredData) {
          const filteredData1 = recceid.outletName?.filter((outlet) => {
            if (outlateid === outlet?._id) {
              outlet.InstalationGroup = selectedv._id;
            }
            return outlet;
          });

          updatedRecceData.push(...filteredData1);

          const config = {
            url: `/recce/recce/updateinstaltion/${outlateid}/${selectedv._id}`,
            baseURL: ApiURL,
            method: "put",
            headers: { "Content-Type": "application/json" },
            data: { reccedata: updatedRecceData },
          };

          const res = await axios(config);

          if (res.status !== 200) {
            throw new Error(`Failed to update outlet: ${res.status}`);
          }
        }
      }

      alert(`Installation assigned to: ${selectedv.VendorFirstName}`);
      window.location.reload();
    } catch (error) {
      console.log("Error while updating outlet:", error.message);
    }
  };

  const updateVendor = async () => {
    if (window.confirm(`Are you sure you want to update clients data?`)) {
      try {
        await AssignVendor(selectedv);
      } catch (error) {
        console.error("Error while updating recce items:", error);
      }
    }
  };

  const handleAssignVendor = async () => {
    setShow(true);
  };

  const findingPending = recceData?.flatMap((ele) =>
    ele.outletName?.filter((item) => item.vendor !== null)
  );

  const outletData = findingPending?.filter((item) =>
    OutletDoneData?.some((fp) => fp.outletShopId === item._id)
  );
  const [filteredData2, setfilteredData2] = useState([]);
  useEffect(() => {
    const filteredDataByStatusAndDate = filteredData?.map((recce) => ({
      ...recce,
      outletName: recce?.outletName?.filter((item) => {
        let JobStatus = null;

        if (item?.vendor !== null) {
          const outletStatus = OutletDoneData?.find(
            (fp) => fp.outletShopId === item?._id
          );

          JobStatus =
            outletStatus?.installationStatus === true ? "Completed" : "Pending";
        }

        const finalStatus = JobStatus;

        const createdAtDate = moment(item.createdAt, "YYYY-MM-DD");
        const startDate = filterStartDate
          ? moment(filterStartDate, "YYYY-MM-DD").startOf("day")
          : null;
        const endDate = filterEndDate
          ? moment(filterEndDate, "YYYY-MM-DD").endOf("day")
          : null;

        if (startDate && !createdAtDate.isSameOrAfter(startDate)) {
          return false;
        }

        if (endDate && !createdAtDate.isSameOrBefore(endDate)) {
          return false;
        }

        return (
          finalStatus === selctedStatus || selctedStatus === "--Select All--"
        );
      }),
    }));

    setfilteredData2(filteredDataByStatusAndDate);
  }, [
    filteredData,
    OutletDoneData,
    selctedStatus,
    filterStartDate,
    filterEndDate,
  ]);

  const [OutletId, setOutletId] = useState(null);

  const [ShowOutletId, setShowOutletId] = useState(false);
  const handleEdit = (outlet) => {
    setOutletId(outlet);
    setShowOutletId(true);
  };

  const mergedArray = OutletDoneData?.filter(
    (Ele) => Ele?.outletShopId === OutletId
  )
    ?.map((board) => {
      return {
        ...board,
        isOutletDone: true,
      };
    })
    .concat(
      recceData
        ?.map((recceItem, index) =>
          recceItem?.outletName
            ?.filter((item) => item._id === OutletId)
            ?.map((outlet) => ({
              ...outlet,
              isOutletDone: false,
            }))
        )
        .flat()
    );

  return (
    <>
      <Header />
      <Modal show={show} onHide={handleClose1}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Installation </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="row">
            <Col className="mb-3">
              <Form.Label>Select Vendor</Form.Label>
              <Form.Group
                md="5"
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Select
                  value={selctedVendor}
                  onChange={(e) => setselctedVendor(e.target.value)}
                >
                  <option>Choose..</option>
                  {vendordata?.map((vendorele) => (
                    <option key={vendorele._id} value={vendorele._id}>
                      {vendorele?.VendorFirstName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose1}>
            Close
          </Button>
          <Button variant="primary" onClick={updateVendor}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {!ShowOutletId ? (
        <div className="row  m-auto containerPadding">
          <div className="row mt-2 mb-4">
            <div className="col-md-6">
              <div className="row ">
                <Col className="col-md-2 ">
                  <div className="col-md-8  mb-2">
                    <span>{data1}</span> of <span>{outletName}</span>
                  </div>

                  <Form.Control
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
                </Col>

                <Col className="col-md-10">
                  <label className="col-md-5   mb-2">Start Date:</label>
                  <label className="col-md-6  mb-2">End Date:</label>
                  <div className="row">
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
                </Col>
              </div>
            </div>

            <Col className="col-md-5">
              <label className="mb-2">Select Status</label>
              <div className="row">
                <div className="col-md-5">
                  <Form.Select
                    value={selctedStatus}
                    className="shadow-none p-2 bg-light rounded"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                    }}
                  >
                    <option value="--Select All--">--Select All--</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </Form.Select>{" "}
                </div>

                <Col className="col-md-1">
                  <Button onClick={handleExportPDF}> Download</Button>
                </Col>
              </div>
            </Col>

            <div className="col-md-1 ">
              {moreoption ? (
                <>
                  <p
                    className="mroe "
                    onClick={() => setselectAction(!selectAction)}
                    style={{
                      border: "1px solid white",
                      width: "38px",
                      height: "38px",
                      textAlign: "center",
                      borderRadius: "100px",
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <span className="text-center">
                      <MoreVertIcon />
                    </span>
                  </p>
                  {selectAction ? (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: "100",
                        top: "24%",
                        right: "2%",
                      }}
                    >
                      <Card className="m-auto p-2" style={{ width: "10rem" }}>
                        <p className="cureor" onClick={handleAssignVendor}>
                          Assign to Installation
                        </p>
                      </Card>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="row">
            <table className="t-p">
              <thead className="t-c">
                <tr>
                  <th className="th_s ">
                    <input
                      type="checkbox"
                      style={{
                        width: "15px",
                        height: "15px",
                        marginRight: "5px",
                      }}
                      checked={selectAll}
                      onChange={handleOutletSelectAllChange}
                    />
                  </th>
                  <th className="th_s p-1">SI.No</th>
                  <th className="th_s p-1">Job.No</th>
                  <th className="th_s p-1">Brand </th>
                  <th className="th_s p-1">Shop Name</th>
                  <th className="th_s p-1">Client Name</th>
                  <th className="th_s p-1">State</th>
                  <th className="th_s p-1">Contact Number</th>
                  <th className="th_s p-1">Zone</th>
                  <th className="th_s p-1">Pincode</th>
                  <th className="th_s p-1">City</th>
                  <th className="th_s p-1">FL Board</th>
                  <th className="th_s p-1">GSB</th>
                  <th className="th_s p-1">Inshop</th>
                  <th className="th_s p-1">Vendor</th>
                  <th className="th_s p-1">Date</th>
                  <th className="th_s p-1">Status</th>
                  <th className="th_s p-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData2?.map((recceItem, index) =>
                  recceItem?.outletName
                    ?.filter((ele, outletArray) =>
                      ele?.OutlateFabricationDeliveryType?.includes(
                        "Go to installation"
                      )
                    )
                    ?.map((outlet) => {
                      if (rowsDisplayed < rowsPerPage1) {
                        const pincodePattern = /\b\d{6}\b/;

                        let JobNob = 0;

                        filteredData2?.forEach((recceItem, recceIndex) => {
                          recceItem?.outletName?.forEach((item) => {
                            if (outlet?._id === item._id) {
                              JobNob = recceIndex + 1;
                            }
                          });
                        });
                        const address = outlet?.OutletAddress;
                        const extractedPincode = address?.match(pincodePattern);
                        const selectedVendorId = outlet?.InstalationGroup;

                        const vendor = vendordata?.find(
                          (ele) => ele?._id === selectedVendorId
                        );

                        let JobStatus;
                        let InstallationCompleted;
                        if (outlet.vendor !== null) {
                          JobStatus = OutletDoneData?.filter(
                            (fp) => fp?.outletShopId === outlet?._id
                          );
                          InstallationCompleted = JobStatus[0]?.createdAt;
                          JobStatus =
                            JobStatus[0]?.installationStatus === true
                              ? "Completed"
                              : "Pending";
                        }

                        if (extractedPincode) {
                          outlet.OutletPincode = extractedPincode[0];
                        }

                        serialNumber++;
                        rowsDisplayed++;

                        return (
                          <tr className="tr_C" key={serialNumber}>
                            <td className="td_S p-1">
                              <input
                                style={{
                                  width: "15px",
                                  height: "15px",
                                  marginRight: "5px",
                                }}
                                type="checkbox"
                                checked={selectedRecceItems1.includes(
                                  outlet?._id
                                )}
                                onChange={() =>
                                  handleOutletToggleSelect(
                                    recceItem._id,
                                    outlet?._id
                                  )
                                }
                              />
                            </td>
                            <td className="td_S p-1">{serialNumber}</td>
                            <td className="td_S p-1">Job{JobNob}</td>
                            <td className="td_S p-1">{recceItem.BrandName}</td>
                            <td className="td_S p-1">{outlet?.ShopName}</td>
                            <td className="td_S p-1">{outlet?.ClientName}</td>
                            <td className="td_S p-1">{outlet?.State}</td>
                            <td className="td_S p-1">
                              {outlet?.OutletContactNumber}
                            </td>

                            <td className="td_S p-1">{outlet?.OutletZone}</td>
                            <td className="td_S p-1">
                              {extractedPincode ? extractedPincode[0] : ""}
                            </td>
                            <td className="td_S p-1">{outlet?.OutletCity}</td>
                            <td className="td_S p-1">{outlet?.FLBoard}</td>
                            <td className="td_S p-1">{outlet?.GSB}</td>
                            <td className="td_S p-1">{outlet?.Inshop}</td>

                            <td className="td_S p-1">
                              {vendor?.VendorFirstName}
                            </td>
                            <td className="td_S p-2 text-nowrap text-center">
                              {InstallationCompleted
                                ? moment(InstallationCompleted).format(
                                    "DD MMMM YYYY"
                                  )
                                : ""}
                            </td>
                            <td className="td_S ">{JobStatus}</td>
                            <td
                              className="td_S "
                              variant="info "
                              onClick={() => {
                                handleEdit(outlet?._id);
                              }}
                              style={{ cursor: "pointer", color: "skyblue" }}
                            >
                              view
                            </td>
                          </tr>
                        );
                      }
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row  m-auto containerPadding">
          <div className="row">
            <div className="col-md-1">
              <ArrowCircleLeftIcon
                onClick={() => setShowOutletId(false)}
                style={{ color: "#068FFF" }}
              />{" "}
            </div>
          </div>{" "}
          <div className="row">
            <div className="col-md-6">
              {recceData?.map((recceItem, index) =>
                recceItem?.outletName
                  ?.filter((item) => item._id === OutletId)
                  ?.map((outlet) => (
                    <>
                      <p>
                        <span className="cl"> Client Brand:</span>
                        <span> {outlet?.ClientName}</span>
                      </p>

                      <p>
                        <span className="cl"> Brand:</span>
                        <span> {recceItem?.BrandName}</span>
                      </p>

                      <p>
                        <span className="cl"> Shop Name:</span>
                        <span>{outlet?.ShopName}</span>
                      </p>
                      <p>
                        <span className="cl"> Partner Code:</span>
                        <span> {outlet?.PartnerCode}</span>
                      </p>

                      <p>
                        <span className="cl">Outlet Pincode :</span>
                        <span> {outlet?.OutletPincode}</span>
                      </p>
                      <p>
                        <span className="cl"> Inshop :</span>
                        <span>
                          {outlet?.Inshop === "Y" || outlet?.Inshop === "y"
                            ? "Yes"
                            : "No"}
                        </span>
                      </p>
                      <p>
                        <span className="cl"> GSB :</span>
                        <span>
                          {outlet?.GSB === "Y" || outlet?.GSB === "y"
                            ? "Yes"
                            : "No"}
                        </span>
                      </p>
                      <p>
                        <span className="cl"> FLBoard :</span>
                        <span>{outlet?.FLBoard === "Y" ? "Yes" : "No"}</span>
                      </p>
                    </>
                  ))
              )}
            </div>

            <div className="col-md-6">
              <div className="row">
                {OutletDoneData?.filter(
                  (Ele) => Ele?.outletShopId === OutletId
                )?.map((board, ind) => {
                  return (
                    <>
                      <div className="col-md-12 ">
                        <p className="poppinfnt ">
                          <span className="me-2 subct">Board Type :</span>
                          {ind + 1}
                        </p>

                        <p className="poppinfnt ">
                          <span className="me-2 subct">Category :</span>{" "}
                          {board?.category}
                        </p>
                        <p className="poppinfnt ">
                          <span className="me-2 subct">Quantity :</span>{" "}
                          {board?.quantity}
                        </p>

                        <p className="poppinfnt ">
                          <span className="me-2 subct">Angles :</span>{" "}
                          {board?.angles}
                        </p>

                        <p className="poppinfnt ">
                          <span className="me-2 subct">GST Number :</span>{" "}
                          {board?.gstNumber}
                        </p>

                        <div className="row">
                          <img
                            width={300}
                            height={200}
                            className="col-md-8 banrrad"
                            alt=""
                            src={`${ImageURL}/Outlet/${board?.ouletInstallationImage}`}
                          />
                          <div className="col-md-1 borderlef">
                            <span className="border-line"></span>
                            <span className="poppinfnt">{board?.height}</span>
                            <span className="poppinfnt">
                              {board?.unitsOfMeasurment}
                            </span>
                            <span className="border-line"></span>
                          </div>
                        </div>

                        <div className=" mt-2 m-auto mb-2 borderlef1 ">
                          <span className="border-line2"></span>
                          <span className=" poppinfnt ms-2 me-1 ">
                            {board?.width}
                          </span>
                          <span className="poppinfnt  me-2">
                            {board?.unitsOfMeasurment}
                          </span>
                          <span className=" border-line2"></span>
                        </div>
                        <p className="poppinfnt ">
                          <span className="me-2 subct">Remark :</span>{" "}
                          {board?.installationCommentOrNote}
                        </p>
                      </div>
                      <hr></hr>{" "}
                    </>
                  );
                })}
              </div>
            </div>
          </div>{" "}
        </div>
      )}
    </>
  );
}
