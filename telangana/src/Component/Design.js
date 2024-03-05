import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import "react-data-table-component-extensions/dist/index.css";
import Col from "react-bootstrap/Col";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Design() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const [recceData, setRecceData] = useState([]);
  const [getreccedata, setgetreccedata] = useState(null);
  const [SelecteddesignIndex, setSelectedDesignIndex] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [RecceIndex, setRecceIndex] = useState(null);
  const [fabricationneed, setFabricationneed] = useState("");
  const [selectedRecceItems1, setSelectedRecceItems1] = useState([]);
  const [designStatus, setdesignStatus] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const [FiltredOutlet, setFiltredOutlet] = useState([]);
  let serialNumber = 0;
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [data1, setdata1] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDatas, setFilteredData] = useState([]);
  let rowsDisplayed = 0;
  useEffect(() => {
    getAllRecce();
    getAllOutlets();
  }, [recceData]);

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "telangana"
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
        let FilterbyOutlet = recceData.flatMap((recce, index) =>
          recce?.outletName?.flatMap((outlet) =>
            res?.data?.outletData
              ?.filter((measurement) => measurement.outletShopId === outlet._id)
              ?.map((measurement) => ({
                brandindex: index + 1,
                brandname: recce.BrandName,
                BrandState: recce.BrandState,
                ...outlet,
                height: measurement.height,
                width: measurement.width,
                angles: measurement.angles,
                category: measurement.category,
                workdonedate: measurement.updatedAt,
                gstNumber: measurement?.gstNumber,
                quantity: measurement?.quantity,
              }))
          )
        );

        setFiltredOutlet(FilterbyOutlet);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    setCurrentPage(1);
  };

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

  const handleExportPDF = () => {
    if (!selectedRecceItems1 || selectedRecceItems1.length === 0) {
      alert("Please select at least one record to export");
      return;
    } else {
      const pdf = new jsPDF();
      const tableColumn = [
        "SI.No",
        "Shop Name",
        "Client Name",
        "state",
        "Job No",
        "Contact",
        "Address",
        "City",
        "Zone",
        "Date",
        "Status",
        "Height",
        "Width",
        "angles",
        "Category",
        "gstNumber",
        "quantity",
      ];

      let serialNumber = 0;

      const tableData = selectedRecceItems1
        ?.flatMap((outletId) => {
          const mappedData = FiltredOutlet.filter(
            (out) => out._id === outletId
          ).map((out) => {
            return {
              siNo: ++serialNumber,
              shopName: out?.ShopName,
              Clientname: out?.BrandName,
              state: out?.BrandState,
              jobNo: `JOB ${out.brandindex}`,
              contact: out?.OutletContactNumber,
              address: out?.OutletAddress,
              city: out?.OutletCity,
              zone: out?.OutletZone,
              date: out?.createdAt
                ? new Date(out?.workdonedate)?.toISOString()?.slice(0, 10)
                : "",
              height: out?.height,
              width: out?.width,
              angles: out?.angles,
              Category: out?.category,
              gstNumber: out?.gstNumber,
              quantity: out?.quantity,
            };
          });

          return mappedData;
        })
        .flat();

      pdf.autoTable({
        head: [tableColumn],
        body: tableData.map((item) => Object.values(item)),
        startY: 20,
        styles: {
          fontSize: 6,
        },
        columnStyles: {
          0: { cellWidth: 10 },
        },
        bodyStyles: { borderColor: "black", border: "1px solid black" },
      });

      pdf.save("Design.pdf");
    }
  };

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };
  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };
  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const filterDateswise = (data) => {
    return data?.filter((item) => {
      const createdAtDate = moment(item?.createdAt, "YYYY-MM-DD");
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

  const filteredData = filterDateswise(recceData);

  const handleUpdate = async () => {
    const formdata = new FormData();

    if (fabricationneed !== undefined && fabricationneed !== null) {
      formdata.append("OutlateFabricationNeed", fabricationneed);
    }

    if (designStatus !== undefined && designStatus !== null) {
      formdata.append("Designstatus", designStatus);
    }

    try {
      const config = {
        url: `/recce/recce/updatereccedata/${RecceIndex}/${getreccedata._id}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "multipart/form-data" },
        data: formdata,
      };

      const res = await axios(config);

      if (res.status === 200) {
        alert("Successfully updated outlet");
        console.log(res.data);
        window.location.reload();
      } else {
        console.error("Received non-200 status code:", res.status);
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      console.log(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  const handleEdit = (selectedSNo, recceItem) => {
    setgetreccedata(selectedSNo);
    setRecceIndex(recceItem._id);
    setSelectedDesignIndex(true);
  };

  const [RecceId, setRecceId] = useState(null);
  const handleOutletToggleSelect = (reccid, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems1.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems1?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems1, outletId];
    }
    setSelectedRecceItems1(updatedSelectedRecceItems);
    setRecceId(reccid);
  };

  const handleOutletSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = filteredData?.flatMap((item) =>
        item?.outletName?.map((outlet) => outlet._id)
      );
      setSelectedRecceItems1(allOutletIds);
    } else {
      setSelectedRecceItems1([]);
    }
  };

  const handleUpdate1 = async () => {
    try {
      for (const recceid of filteredData) {
        for (const outlet of recceid?.outletName) {
          if (selectedRecceItems1?.includes(outlet?._id)) {
            const formdata = new FormData();

            if (fabricationneed !== undefined && fabricationneed !== null) {
              formdata.append("OutlateFabricationNeed", fabricationneed);
            }
            if (designStatus !== undefined && designStatus !== null) {
              formdata.append("Designstatus", designStatus);
            }

            const config = {
              url: `/recce/recce/updatereccedata/${recceid?._id}/${outlet?._id}`,
              method: "put",
              baseURL: ApiURL,
              headers: { "Content-Type": "multipart/form-data" },
              data: formdata,
            };

            const res = await axios(config);

            if (res.status === 200) {
              alert("Successfully updated outlet");

              window.location.reload();
            } else {
              console.error("Received non-200 status code:", res.status);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      console.log(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  return (
    <>
      <Header />

      {!SelecteddesignIndex ? (
        <div className="row  m-auto containerPadding">
          <div className="row mt-3 m-3 m-auto">
            <div className="col-md-8">
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

                <div className="col-md-9 float-end">
                  <div className="row">
                    <label className="col-md-5   mb-2">Start Date:</label>
                    <label className="col-md-6  mb-2">End Date:</label>
                    <div className="col-md-4 ">
                      <Form.Control
                        type="date"
                        value={filterStartDate}
                        onChange={handleFilterStartDateChange}
                      />
                    </div>
                    <div className="col-md-4 ">
                      <Form.Control
                        type="date"
                        value={filterEndDate}
                        onChange={handleFilterEndDateChange}
                      />
                    </div>
                    <div className="col-md-2 ">
                      <Button onClick={handleClearDateFilters}>Clear</Button>
                    </div>
                    <Col className="col-md-1">
                      <Button onClick={handleExportPDF}> Download</Button>
                    </Col>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4 mb-3">
              <div className="col-md-3">
                <label className="mb-2">Approval For Fabrication</label>
                <Form.Select
                  className="shadow-none  bg-light rounded"
                  value={fabricationneed}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue !== "Choose...") {
                      setFabricationneed(selectedValue);
                    }
                  }}
                >
                  <option>Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Form.Select>{" "}
              </div>
              <div className="col-md-3 ">
                {" "}
                <Form.Label>Design Status </Form.Label>
                <Form.Select
                  as="select"
                  className=" shadow-none bg-light rounded"
                  value={designStatus}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue !== "Choose...") {
                      setdesignStatus(selectedValue);
                    }
                  }}
                >
                  <option>Choose...</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </div>
              <Button className="col-md-1 mt-4" onClick={handleUpdate1}>
                Save
              </Button>
            </div>
          </div>

          <div className="row mt-3">
            <table className="t-p">
              <thead className="t-c">
                <tr>
                  <th className="th_s">
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
                  <th className="th_s p-1">Partner Code</th>
                  <th className="th_s p-1">State</th>
                  <th className="th_s p-1">Contact Number</th>
                  <th className="th_s p-1">Zone</th>
                  <th className="th_s p-1">Pincode</th>
                  <th className="th_s p-1">City</th>
                  <th className="th_s p-1">FL Board</th>
                  <th className="th_s p-1">GSB</th>
                  <th className="th_s p-1">Inshop</th>
                  <th className="th_s p-1">Status</th>
                  <th className="th_s p-1">Date</th>
                  <th className="th_s p-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((recceItem, outerIndex) => {
                  const outletDoneItems = [];

                  return recceItem?.outletName
                    ?.filter((outlet) => {
                      let outletDoneItem = OutletDoneData?.find(
                        (ele) => ele.outletShopId === outlet._id
                      );

                      outletDoneItems.push(outletDoneItem);

                      return outletDoneItem?.jobStatus === true;
                    })
                    ?.map((outlet, innerIndex) => {
                      let JobNob = 0;

                      let {
                        ClientName,
                        PartnerCode,
                        ShopName,
                        State,
                        OutletContactNumber,
                        OutletZone,
                        OutletCity,
                        FLBoard,
                        GSB,
                        Inshop,
                        Designstatus,
                        OutletPincode,
                      } = outlet;

                      const pincodePattern = /\b\d{6}\b/;
                      const address = outlet?.OutletAddress;
                      const extractedPincode = address?.match(pincodePattern);

                      if (extractedPincode) {
                        outlet.OutletPincode = extractedPincode[0];
                      }

                      if (rowsDisplayed < rowsPerPage1) {
                        serialNumber++;
                        rowsDisplayed++;

                        JobNob = outerIndex + 1;
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
                                checked={selectedRecceItems1?.includes(
                                  outlet?._id
                                )}
                                onChange={() =>
                                  handleOutletToggleSelect(
                                    recceItem.BrandId,
                                    outlet?._id
                                  )
                                }
                              />
                            </td>

                            <td className="td_S p-1">{serialNumber}</td>
                            <td className="td_S p-1">Job{JobNob}</td>
                            <td className="td_S p-1">{recceItem.BrandName}</td>
                            <td className="td_S p-1">{ShopName}</td>
                            <td className="td_S p-1">{ClientName}</td>
                            <td className="td_S p-1">{PartnerCode}</td>
                            <td className="td_S p-1">{State}</td>
                            <td className="td_S p-1">{OutletContactNumber}</td>
                            <td className="td_S p-1">{OutletZone}</td>
                            <td className="td_S p-1">
                              {extractedPincode
                                ? extractedPincode[0]
                                : OutletPincode}
                            </td>
                            <td className="td_S p-1">{OutletCity}</td>
                            <td className="td_S p-1">{FLBoard}</td>
                            <td className="td_S p-1">{GSB}</td>
                            <td className="td_S p-1">{Inshop}</td>
                            <td className="td_S p-1">{Designstatus}</td>
                            <td className="td_S p-2 text-nowrap text-center">
                              {outletDoneItems[innerIndex]?.createdAt
                                ? new Date(
                                    outletDoneItems[innerIndex].createdAt
                                  )
                                    ?.toISOString()
                                    ?.slice(0, 10)
                                : ""}
                            </td>
                            <td className="td_S ">
                              <span
                                variant="info "
                                onClick={() => {
                                  handleEdit(outlet, recceItem);
                                }}
                                style={{
                                  cursor: "pointer",
                                  color: "skyblue",
                                }}
                              >
                                view
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    });
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row  m-auto containerPadding">
          <div className="row">
            <div className="col-md-1">
              <ArrowCircleLeftIcon
                onClick={(e) => setSelectedDesignIndex(null)}
                style={{ color: "#068FFF" }}
              />{" "}
            </div>
          </div>

          <div className="col-md-8">
            <div className="row mb-5 ">
              <div className="col-md-4 p-2">
                <Form.Label>Approval For Fabricationn</Form.Label>
                <Form.Select
                  className="shadow-none p-3  bg-light rounded"
                  value={fabricationneed}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue !== "Choose...") {
                      setFabricationneed(selectedValue);
                    }
                  }}
                >
                  <option>Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Form.Select>{" "}
              </div>
              <div className="col-md-8  ">
                {" "}
                <div className="row">
                  <Form.Label>Design Status </Form.Label>
                  <div className="col-md-4">
                    <Form.Select
                      as="select"
                      className="row shadow-none p-3  bg-light rounded"
                      value={designStatus}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue !== "Choose...") {
                          setdesignStatus(selectedValue);
                        }
                      }}
                    >
                      <option>Choose...</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </Form.Select>
                  </div>
                  <Button
                    className="col-md-4 p-3 "
                    onClick={(event) => handleUpdate(event, getreccedata._id)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
            <div className="row mt-5"></div>{" "}
          </div>
          <div className="board-container">
            {OutletDoneData?.filter(
              (Ele) => Ele?.outletShopId === getreccedata._id
            )?.map((board, index) => {
              return (
                <div className="board-type mt-3">
                  <p>
                    <span className="cl"> Board : </span>
                    <span>{index + 1}</span>
                  </p>
                  <p>
                    <span className="cl"> Shop Name:</span>
                    <span>{getreccedata.ShopName}</span>
                  </p>
                  <p>
                    <span className="cl"> Partner Code:</span>
                    <span> {getreccedata.PartnerCode}</span>
                  </p>
                  <p>
                    <span className="cl"> Category :</span>
                    <span> {getreccedata.Category}</span>
                  </p>
                  <p>
                    <span className="cl">Outlet Pincode :</span>
                    <span> {getreccedata.OutletPincode}</span>
                  </p>
                  <p>
                    <span className="cl"> Inshop :</span>
                    <span>
                      {getreccedata.Inshop === "Y" || "y"
                        ? getreccedata.Inshop
                        : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="cl"> GSB :</span>
                    <span>
                      {getreccedata.GSB === "Y" || "y"
                        ? getreccedata.GSB
                        : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="cl"> FLBoard :</span>
                    <span>
                      {getreccedata.FLBoard === "Y"
                        ? getreccedata.FLBoard
                        : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="cl"> Hight:</span>
                    <span className="me-2">{board.height}</span>
                    <span>{board.unitsOfMeasurment}</span>
                  </p>
                  <p>
                    <span className="cl"> Width :</span>
                    <span className="me-2">{board.width}</span>
                    <span>{board.unitsOfMeasurment}</span>
                  </p>
                  <p>
                    <span className="cl"> GST Number :</span>
                    <span>{board.gstNumber}</span>
                  </p>{" "}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
