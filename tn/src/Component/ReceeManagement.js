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
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import axios from "axios";
import pptxgen from "pptxgenjs";
import jsPDF from "jspdf";
import "jspdf-autotable";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";

const ExcelJS = require("exceljs");
//
export default function ReceeManagement() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const user = JSON.parse(localStorage.getItem("userData"));
  const [selectedIndex, setSelectedIndex] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recceexcel, setrecceexcel] = useState("");
  const [reccedata, setRecceData] = useState([]);
  const [vendordata, setVendorData] = useState([]);
  const [importXLSheet, setImportXLSheet] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedData, setDisplayedData] = useState();
  const [getVendorName, setgetVendorName] = useState(null);
  const [CategoryData, setCategoryData] = useState();
  const [selectedRecceItems, setSelectedRecceItems] = useState([]);
  const [selectedRecceItems1, setSelectedRecceItems1] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [moreoption, setmoreoption] = useState(false);
  const [moreoption1, setmoreoption1] = useState(false);
  const [show, setShow] = useState(false);
  const [selectAction, setselectAction] = useState(false);
  const [selectAction1, setselectAction1] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [outletNames, setOutletNames] = useState(null);
  const [completedStatus, setcompletedStatus] = useState([]);
  const [pendingStatus, setpendingStatus] = useState([]);
  const [cancelledStatus, setcancelledStatus] = useState([]);
  const [selctedVendor, setselctedVendor] = useState(null);
  const [ClientInfo, setClientInfo] = useState([]);
  const [data1, setdata1] = useState(0);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  const [FiltredOutlet, setFiltredOutlet] = useState([]);

  const [viewOutletBoards, setViewOutletBoard] = useState(false);
  const [viewOutletBoardsIdd, setViewOutletBoardIdd] = useState(null);
  const [SelectedBoardStatus, setSelectedBoardStatus] =
    useState("--Select All--");
  const handleClose1 = () => setShow(false);
  useEffect(() => {
    getAllRecce();
    getAllVendorInfo();
    getAllCategory();
    getAllClientsInfo();
    getAllOutlets();
  }, []);
  useEffect(() => {
    getLengthOfStatus();
  }, [reccedata]);

  const getAllOutlets = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        let data = res?.data?.outletData;
        setOutletDoneData(data);
        let FilterbyOutlet = reccedata?.flatMap((recce, index) =>
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
    } finally {
      setLoading(false);
    }
  };

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "tamilnadu"
        );

        setRecceData(filtered);
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const getAllVendorInfo = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/Vendor/vendorInfo/getvendorinfo`
      );

      if (response.status === 200) {
        let vendors = response.data.vendors;
        let filterCityWise = vendors?.filter(
          (ele) => ele.vendorState === "tamilnadu"
        );
        setVendorData(filterCityWise);
      } else {
        alert("Unable to fetch data");
      }
    } catch (err) {
      console.log("can't able to fetch data");
    }
  };
  useEffect(() => {
    setdata1(rowsDisplayed);
  }, [rowsPerPage1]);

  let rowsDisplayed = 0;

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);

    rowsDisplayed = 0;
  };
  useEffect(() => {
    const filteredClients = () => {
      let results = [...reccedata];

      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = Math.min(startIndex + rowsPerPage, results.length);
      const dataToDisplay = results?.slice(startIndex, endIndex);
      setDisplayedData(dataToDisplay);
    };
    filteredClients();
  }, [reccedata, rowsPerPage]);

  function convertToJson(data) {
    const headerRow = data[0];
    return data?.slice(1)?.map((row) => {
      const rowData = {};
      headerRow.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      if (recceexcel && importXLSheet.length === 0) {
        await readFile();
      }
      handleImport();
    };

    fetchData();
  }, [recceexcel, importXLSheet]);

  async function readFile() {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const formattedData = convertToJson(jsonData);

      setDisplayedData(formattedData);
    };

    reader.readAsBinaryString(recceexcel);
  }

  const handleImport = async (outlateid) => {
    if (!outlateid) {
      return;
    }

    if (selectedRecceItems.length === 0) {
      alert("Please select at least one row before importing.");
      return;
    }

    setUploading(true);

    try {
      const outletNames = flattenOutletNames(displayedData);

      const res = await axios.post(
        `${ApiURL}/recce/recce/addreccesviaexcelesheet/${outlateid}`,
        { outletName: outletNames },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        toast.success("Outlet names updated successfully!");
        setOutletNames(outletNames);
        toast.success("Outlet names in recce updated successfully!");
        setrecceexcel(null);
        setDisplayedData([]);
        window.location.reload();
      } else {
        toast.error("Failed to update outlet names. Please check the data.");

        const errorMessage =
          res.data && res.data.message
            ? res.data.message
            : "Error occurred while updating outlet names.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Error occurred while updating outlet names.");
    } finally {
      setUploading(false);
    }
  };

  function flattenOutletNames(data) {
    return data.reduce((acc, item) => {
      if (Array.isArray(item)) {
        return [...acc, ...flattenOutletNames(item)];
      }
      return [...acc, item];
    }, []);
  }

  const handleEdit = (outletid, action) => {
    setgetVendorName(outletid);
    setSelectedIndex({ action });
  };

  const handleOutletView = (idd) => {
    setViewOutletBoardIdd(idd);
    setViewOutletBoard(true);
  };

  const handleDownload = () => {
    if (!selectedRecceItems || selectedRecceItems.length === 0) {
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
        "GST Number",
        "Date",
        "Height",
        "Width",
        "quantity",
        "angles",
        "Category",
      ];

      let serialNumber = 0;

      const tableData = selectedRecceItems
        ?.flatMap((outletId) =>
          displayedData
            ?.filter((recce) => recce?._id === outletId)
            ?.flatMap((recceItem) =>
              recceItem?.outletName.map((outlet) => {
                const mappedData = FiltredOutlet.filter(
                  (out) => out._id === outlet._id
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

                    "GST Number": out?.gstNumber,
                    date: out?.workdonedate
                      ? new Date(out.workdonedate)?.toISOString()?.slice(0, 10)
                      : "",
                    height: out?.height,
                    width: out?.width,
                    quantity: out?.quantity,
                    angles: out?.angles,
                    Category: out?.category,
                  };
                });

                return mappedData;
              })
            )
        )
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

      pdf.save("RecceData.pdf");
    }
  };

  const getAllCategory = async () => {
    try {
      const res = await fetch(`${ApiURL}/Product/category/getcategory`);
      if (res.ok) {
        const data = await res.json();

        const categoriesArray = Object.values(data.category);
        setCategoryData(categoriesArray);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const handleToggleSelect = (itemId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems?.includes(itemId)) {
      updatedSelectedRecceItems = selectedRecceItems?.filter(
        (id) => id !== itemId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems, itemId];
    }

    setSelectedRecceItems(updatedSelectedRecceItems);
    setmoreoption(updatedSelectedRecceItems?.length > 0);
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      setSelectedRecceItems(displayedData?.map((item) => item?._id));
    } else {
      setSelectedRecceItems([]);
    }

    setmoreoption(!selectAll);
  };
  async function deleteRecce(recceId) {
    try {
      const response = await axios.delete(
        `${ApiURL}/recce/recce/deletereccedata/${recceId}`
      );
      if (response.status === 200) {
        alert("Recce deleted successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log("Error while deleting recce");
    }
  }

  const handleDeleteSelectedRecceItems = async () => {
    if (selectedRecceItems.length === 0) {
      return;
    }

    if (window.confirm(`Are you sure you want to delete  clients data ?`)) {
      try {
        for (const recceId of selectedRecceItems) {
          await deleteRecce(recceId);
        }

        setSelectedRecceItems([]);
      } catch (error) {
        console.error("Error while deleting recce items:", error);
      }
    }
  };

  const handleAssignVendor = async () => {
    setShow(true);
  };

  const selectedv = vendordata?.find((vendor) => vendor?._id === selctedVendor);
  const handleUpdate = async (outlet) => {
    try {
      const config = {
        url: `/recce/recce/updatereccedata/${getVendorName}/${outlet}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: { RecceStatus: "Cancelled" },
      };

      const res = await axios(config);

      if (res.status === 200) {
        window.confirm("Are you sure you want to cancelled the job");
        window.location.reload();
      } else {
        console.error("Received non-200 status code:", res.status);
      }
    } catch (err) {
      // console.error("Error:", err.response ? err.response.data : err.message);
      console.log(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  async function AssignVendor(selectedVendor) {
    try {
      const updatedRecceData = [];

      for (const recceId of selectedRecceItems1) {
        const filteredData = reccedata?.map((ele) =>
          ele?.outletName?.filter((item) => {
            if (recceId === item?._id) {
              item.vendor = vendordata?._id;
            }
            return item;
          })
        );

        updatedRecceData.push(...filteredData);

        const config = {
          url: `/recce/recce/outletupdate/${recceId}/${selectedv?._id}`,
          baseURL: ApiURL,
          method: "put",
          headers: { "Content-Type": "application/json" },
          data: { reccedata: updatedRecceData },
        };

        const res = await axios(config);

        if (res.status === 200) {
          alert(`Recce Assign to ${selectedv.VendorFirstName}`);
          window.location.reload();
        }
      }
    } catch (error) {
      console.log("Error while updating outlet:", error.message);
    }
  }

  const updateVendor = async () => {
    if (window.confirm(`Are you sure you want to update clients data?`)) {
      try {
        await AssignVendor(selectedv);
      } catch (error) {
        console.error("Error while updating recce items:", error);
      }
    }
  };

  async function deleteOutlet(recceId) {
    try {
      const response = await axios.delete(
        `${ApiURL}/recce/recce/recceoudelet/${recceId}`
      );

      if (response.status === 200) {
        alert("Outlet deleted successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log("Error while deleting outlet:", error.message);
    }
  }

  const handleDeleteSelectedOutlet = async () => {
    if (selectedRecceItems1.length === 0) {
      return;
    }

    if (window.confirm(`Are you sure you want to delete  clients data ?`)) {
      try {
        for (const recceId of selectedRecceItems1) {
          await deleteOutlet(recceId);
        }

        setSelectedRecceItems1([]);
      } catch (error) {
        console.error("Error while deleting recce items:", error);
      }
    }
  };
  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const filterRecceDate = (data) => {
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

  const filteredData = filterRecceDate(reccedata);
  // outlet filter
  const filteredData1 = filteredData?.filter(
    (outlet) => outlet._id === getVendorName
  );

  const getLengthOfStatus = () => {
    const statusCounts = {
      completed: 0,
      pending: 0,
      cancelled: 0,
      // processing: 0,
    };

    reccedata?.forEach((recceItem) => {
      const outletNameArray = recceItem?.outletName;

      if (Array.isArray(outletNameArray)) {
        outletNameArray?.forEach((outlet) => {
          const OutletDoned = OutletDoneData.find(
            (Ele) => Ele?.outletShopId === outlet._id
          );

          if (OutletDoned && !OutletDoned.jobStatus) {
            statusCounts.pending++;
          } else if (OutletDoned && OutletDoned.jobStatus === true) {
            statusCounts.completed++;
          } else if (outlet.RecceStatus === "Cancelled") {
            statusCounts.cancelled++;
          }
        });
      }
    });

    setcompletedStatus(statusCounts?.completed);
    setpendingStatus(statusCounts?.pending);
    setcancelledStatus(statusCounts?.cancelled);
    // setproccesingStatus(statusCounts?.processing);
  };

  let uniqueOutlets = [];

  for (let outlets of OutletDoneData) {
    if (
      !uniqueOutlets.some((item) => item.outletShopId === outlets.outletShopId)
    ) {
      uniqueOutlets.push(outlets);
    }
  }

  function convertToFeet(value, unit) {
    if (unit === "inch") {
      return Math.round(value / 12);
    } else if (unit === "Centimeter") {
      return Math.round(value * 0.0328084);
    } else if (unit === "Meter") {
      return Math.round(value * 3.28084);
    } else if (unit === "Feet") {
      return value;
    } else {
      console.error("Unknown unit: " + unit);
      return value;
    }
  }

  const Export = () => {
    const extractedData = [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extracted Data");

    if (selectedRecceItems.length === 0 || filteredData.length === 0) {
      alert("Please import outlet or select a brand");
      return;
    }

    try {
      for (const recceId of selectedRecceItems) {
        if (!recceId) {
          continue;
        }

        const recceData = filteredData.find((item) => item._id === recceId);

        for (const outlet of recceData.outletName) {
          const OutletDoned = OutletDoneData?.filter(
            (Ele) => Ele?.outletShopId === outlet._id
          );

          for (const outl of OutletDoned) {
            if (outl?.jobStatus === true) {
              extractedData.push({
                "Outlate Name": outlet.ShopName || null,
                "Outlet Address": outlet.OutletAddress || null,
                "Outlet Contact Number": outlet.OutletContactNumber || null,
                "Board Type": outl.boardType,
                "GST Number": !outlet.GSTNumber
                  ? outl.gstNumber
                  : outlet.GSTNumber,
                "Media .": outl.category || null,
                "A Height": `${outl.height} ${outl.unitsOfMeasurment} ` || null,
                "A Width": `${outl.width} ${outl.unitsOfMeasurment} ` || null,
                "No.Quantity": outl.quantity || null,
                "R Height":
                  `${convertToFeet(
                    outl.height,
                    outl.unitsOfMeasurment
                  )} feet ` || null,
                "R Width":
                  `${convertToFeet(
                    outl.width,
                    outl.unitsOfMeasurment
                  )} feet ` || null,
              });
            }
          }
        }

        const headerRow = worksheet.addRow([
          "Outlate Name",
          "Outlet Address",
          "Outlet Contact Number",
          "Board Type",
          "GST Number",
          "Media .",
          "A Height",
          "A Width",
          "No.Quantity",
          "R Height",
          "R Width",
        ]);
        worksheet.getColumn(1).width = 20;
        worksheet.getColumn(2).width = 30;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 20;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 35;
        worksheet.getColumn(7).width = 8;
        worksheet.getColumn(8).width = 8;
        worksheet.getColumn(9).width = 8;
        worksheet.getColumn(10).width = 8;

        extractedData.forEach((dataItem) => {
          const row = worksheet.addRow([
            dataItem["Outlate Name"],
            dataItem["Outlet Address"],
            dataItem["Outlet Contact Number"],
            dataItem["Board Type"],
            dataItem["GST Number"],
            dataItem["Media ."],
            dataItem["A Height"],
            dataItem["A Width"],
            dataItem["No.Quantity"],
            dataItem["R Height"],
            dataItem["R Width"],
          ]);
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (colNumber <= 10) {
              cell.alignment = { wrapText: true };
            }
          });

          row.getCell(9).numFmt = "0.00";
          row.getCell(10).numFmt = "0.00";
        });

        headerRow.eachCell((cell) => {
          cell.alignment = { wrapText: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "74BDE2" },
          };
          cell.font = {
            size: 12,
          };
        });

        for (let i = 2; i <= worksheet.rowCount; i++) {
          worksheet.getRow(i).eachCell((cell) => {
            cell.font = {
              size: 10,
            };
          });
        }

        const lastRowNumber = worksheet.rowCount;
        for (let i = extractedData.length; i <= lastRowNumber; i++) {
          const cellA = worksheet.getCell(`A${i}`);
          const cellB = worksheet.getCell(`B${i}`);
          if (!cellA.isMerged) {
            worksheet.mergeCells(`A${i}:B${i}`);
          }
          if (!cellB.isMerged) {
            worksheet.mergeCells(`B${i}:C${i}`);
          }
        }
      }
      workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "actual.xlsx";
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        })

        .catch((error) => {
          console.log(error.message);
          console.error("Error creating Excel file:", error);
        });
    } catch (error) {
      // alert("Please import outlate");
      console.error("Error in processing data:");
    }
  };

  const handlePPT = () => {
    const pptx = new pptxgen();

    if (selectedRecceItems.length === 0 || filteredData.length === 0) {
      alert("Please import outlet or select a brand");
      return;
    }

    try {
      for (const recceId of selectedRecceItems) {
        if (!recceId) {
          continue;
        }

        const recceData = filteredData.find((item) => item._id === recceId);

        if (!recceData) {
          alert("Recce data not found for the selected item");
          continue;
        }

        for (const outlet of recceData.outletName) {
          if (outlet.length === 0) {
            alert("Please import outlet");
            continue;
          }

          const OutletDoned = OutletDoneData?.filter(
            (Ele) => Ele?.outletShopId === outlet._id
          );
          for (const outl of OutletDoned) {
            if (outl?.jobStatus === true) {
              const width = outl?.width || 1;
              const height = outl?.height || 1;
              const rHeightInFeet = convertToFeet(
                height,
                outl.unitsOfMeasurment
              );
              const rWidthInFeet = convertToFeet(width, outl.unitsOfMeasurment);

              const slide = pptx.addSlide();

              slide.addText(`Outlet Name: ${outlet?.ShopName}`, {
                x: 1,
                y: 0.3,
                w: "100%",
                fontSize: 12,
              });

              slide.addText(`Address: ${outlet?.OutletAddress}`, {
                x: 1,
                y: 0.6,
                w: "100%",
                fontSize: 12,
              });
              const formattedDimensions = `H${Math.round(
                rHeightInFeet
              )} X W${Math.round(rWidthInFeet)}`;
              // const imageUrls = ["url1.jpg", "url2.jpg", "url3.jpg"];
              const imageWidth = "30%";

              const centerX = "35%";

              const centerY = "30%";

              let currentX = centerX;

              const fullImageUrl = `${ImageURL}/Outlet/${outl.ouletBannerImage}`;

              slide.addImage({
                path: fullImageUrl,
                x: currentX,
                y: centerY,
                w: imageWidth,
              });
              currentX = `+=35%`;

              slide.addText(formattedDimensions, {
                x: 1,
                y: "90%",
                w: "100%",
                fontSize: 12,
              });

              slide.addText(`Category: ${outl?.category}`, {
                x: 1,
                y: "95%",
                w: "100%",
                fontSize: 12,
                align: "left",
              });
            }
          }
        }

        pptx.write("blob").then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "presentation.pptx";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        });
      }
    } catch (err) {
      console.error("Error:", err);
      console.log(`An error occurred: ${err.message}`);
    }
  };

  const handleEstimate = () => {
    const extractedData = [];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extracted Data");
    const headerRow = worksheet.getRow(1);
    headerRow.height = 10 / 9;
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 35;
    worksheet.getColumn(7).width = 8;
    worksheet.getColumn(8).width = 8;
    worksheet.getColumn(9).width = 8;
    worksheet.getColumn(10).width = 8;
    worksheet.getColumn(11).width = 8;
    worksheet.getColumn(12).width = 8;
    worksheet.getColumn(13).width = 10;
    worksheet.getColumn(14).width = 10;
    worksheet.getColumn(15).width = 20;

    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      cell.alignment = { wrapText: true };
    });
    if (selectedRecceItems.length === 0 || filteredData.length === 0) {
      alert("Please import outlet or select brand");
      return;
    }

    try {
      for (const recceId of selectedRecceItems) {
        if (!recceId) {
          continue;
        }

        const recceData = filteredData.find((item) => item._id === recceId);

        if (!recceData) {
          alert("Recce data not found for selected item");
          continue;
        }

        recceData.outletName.forEach((outlet) => {
          if (outlet.length === 0) {
            throw new Error("Please import outlet");
          }

          const OutletDoned = OutletDoneData.filter(
            (Ele) => Ele?.outletShopId === outlet._id
          );

          for (const outl of OutletDoned) {
            if (outl?.jobStatus === true) {
              const rHeightInFeet = convertToFeet(
                outl.height,
                outl.unitsOfMeasurment
              );
              const rWidthInFeet = convertToFeet(
                outl.width,
                outl.unitsOfMeasurment
              );
              extractedData.push({
                "Outlet Name": outlet.ShopName,
                "Outlet Address": outlet.OutletAddress,
                "Board Type": outl.boardType,
                "Outlet Contact Number": outlet.OutletContactNumber,
                "GST Number": !outlet.GSTNumber
                  ? outl.gstNumber
                  : outlet.GSTNumber,
                "Media .": outl.category,
                "GSB/inshop": outlet.GSB || outlet.Inshop,
                "No.Quantity": outl.quantity || 0,

                Height: rHeightInFeet || 0,
                Width: rWidthInFeet || 0,
                SFT: outlet.SFT,
                "Production Rate": outlet.ProductionRate,
                "Production Cost": outlet.ProductionCost,
                "Installation Rate": outlet.InstallationRate,
                "Installation Cost": outlet.InstallationCost,
                "transportation rate": outlet.transportationRate,
                "transportation cost": outlet.transportationcost,
                "Production Cost + Installation Cost + transportation cost":
                  0 + 18 + 0,
              });
            }
          }
        });

        const firstRow = extractedData.length + 1;
        const secondRow = firstRow + 1;
        const thirdRow = secondRow + 1;

        extractedData.push({
          "GST @18%": `M${firstRow}`,
          "Gross Amount": `M${secondRow}`,
          Rof: `M${thirdRow}`,

          "transportation rate": `O${firstRow}`,
          "transportation cost": `O${secondRow}`,
          "Production Cost + Installation Cost + transportation cost": `O${thirdRow}`,
        });

        const headerRow = worksheet.addRow([
          "Outlet Name",
          "Outlet Address",
          "Board Type",
          "Outlet Contact Number",
          "GST Number",
          "Media .",
          "GSB/inshop",
          "No.Quantity",
          "Height",
          "Width",
          "SFT",
          "Production Rate",
          "Production Cost",
          "Installation Rate",
          "Installation Cost",
          "transportation cost",
          "Production Cost + Installation Cost + transportation cost",
        ]);

        extractedData.forEach((dataItem) => {
          const row = worksheet.addRow([
            dataItem["Outlet Name"],
            dataItem["Outlet Address"],
            dataItem["Board Type"],
            dataItem["Outlet Contact Number"],
            dataItem["GST Number"],
            dataItem["Media ."],
            dataItem["GSB/inshop"],
            dataItem["No.Quantity"],
            dataItem["Height"],
            dataItem["Width"],
            dataItem["SFT"],
            dataItem["Production Rate"],
            dataItem["Production Cost"],
            dataItem["Installation Rate"],
            dataItem["Installation Cost"],
            dataItem["transportation cost"],
            dataItem[
              "Production Cost + Installation Cost + transportation cost"
            ],
          ]);
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (colNumber <= 10) {
              cell.alignment = { wrapText: true };
            }
          });

          row.getCell(9).numFmt = "0.00";
          row.getCell(10).numFmt = "0.00";
        });

        headerRow.eachCell((cell) => {
          cell.alignment = { wrapText: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "74BDE2" },
          };
          cell.font = {
            size: 12,
          };
        });

        for (let i = 2; i <= worksheet.rowCount; i++) {
          worksheet.getRow(i).eachCell((cell) => {
            cell.font = {
              size: 10,
            };
          });
        }

        const lastRowNumber = worksheet.rowCount;
        for (let i = extractedData.length; i <= lastRowNumber; i++) {
          const cellA = worksheet.getCell(`A${i}`);
          const cellB = worksheet.getCell(`B${i}`);
          if (!cellA.isMerged) {
            worksheet.mergeCells(`A${i}:B${i}`);
          }
          if (!cellB.isMerged) {
            worksheet.mergeCells(`B${i}:C${i}`);
          }
        }
      }
      workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "estimate.xlsx";
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        })

        .catch((error) => {
          alert(error.message);
          console.error("Error creating Excel file:", error);
        });
    } catch (error) {
      console.log("Please import outlate");
      console.error("Error in processing data:", error);
    }
  };

  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        let filterCityWise = res.data.client?.filter(
          (ele) => ele?.state === "tamilnadu"
        );
        setClientInfo(filterCityWise);
      }
    } catch (err) {
      console.log("err");
    }
  };

  const handleOutletToggleSelect = (item, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems1?.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems1?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems1, outletId];
    }

    setSelectedRecceItems1(updatedSelectedRecceItems);
    setmoreoption1(updatedSelectedRecceItems.length > 0);
  };

  const handleOutletSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = reccedata.flatMap((item) =>
        item?.outletName.map((outlet) => outlet._id)
      );
      setSelectedRecceItems1(allOutletIds);
    } else {
      setSelectedRecceItems1([]);
    }

    setmoreoption1(!selectAll);
  };

  const [FilterStartDate1, setFilterStartDate1] = useState();
  const [FilterEndDate1, setFilterEndDate1] = useState();

  const handleClearDateFilters1 = () => {
    setFilterStartDate1("");
    setFilterEndDate1("");
  };
  const handleFilterEndDateChange1 = (event) => {
    setFilterEndDate1(event.target.value);
  };
  const handleFilterStartDateChange1 = (event) => {
    setFilterStartDate1(event.target.value);
  };

  const findingPending = reccedata?.flatMap((ele) =>
    ele.outletName.filter((item) => item.vendor !== null)
  );

  const outletData = findingPending?.filter((item) =>
    OutletDoneData?.some((fp) => fp.outletShopId === item._id)
  );

  const findingCompleteAndRemove = findingPending?.filter(
    (ite) => !outletData.some((rr) => rr._id === ite._id)
  );

  const [filteredData2, setfilteredData2] = useState([]);
  useEffect(() => {
    const filteredDataByStatusAndDate = filteredData1?.map((recce) => ({
      ...recce,
      outletName: recce?.outletName?.filter((item) => {
        let JobStatus = null;
        let cancelledStatus = null;

        if (item?.vendor !== null) {
          const outletStatus = OutletDoneData?.find(
            (fp) => fp.outletShopId === item?._id
          );

          JobStatus =
            outletStatus?.jobStatus === true ? "Completed" : "Pending";
        }

        if (item.RecceStatus === "Cancelled") {
          cancelledStatus = "Cancelled";
        }

        const finalStatus =
          cancelledStatus === "Cancelled" ? "Cancelled" : JobStatus;

        const createdAtDate = moment(item.createdAt, "YYYY-MM-DD");
        const startDate = FilterStartDate1
          ? moment(FilterStartDate1, "YYYY-MM-DD").startOf("day")
          : null;
        const endDate = FilterEndDate1
          ? moment(FilterEndDate1, "YYYY-MM-DD").endOf("day")
          : null;

        if (startDate && !createdAtDate.isSameOrAfter(startDate)) {
          return false;
        }

        if (endDate && !createdAtDate.isSameOrBefore(endDate)) {
          return false;
        }

        return (
          finalStatus === SelectedBoardStatus ||
          SelectedBoardStatus === "--Select All--"
        );
      }),
    }));

    setfilteredData2(filteredDataByStatusAndDate);
  }, [
    filteredData1,
    OutletDoneData,
    SelectedBoardStatus,
    FilterStartDate1,
    FilterEndDate1,
  ]);

  return (
    <>
      <Header />
      <div className="row m-auto containerPadding">
        <ToastContainer position="top-right" />

        {!selectedIndex ? (
          <div className="row m-auto containerPadding">
            <div className="row ">
              <div className="col-md-8">
                <div className="row">
                  <Button className="col-md-2 m-1 c_W" href="/Recceapi">
                    Add Recce
                  </Button>

                  <Button
                    className="col-md-2 btn btn-danger m-1"
                    onClick={handleDownload}
                    style={{ backgroundColor: "#a9042e", border: 0 }}
                  >
                    Download
                  </Button>
                  <Button
                    onClick={handlePPT}
                    className="col-md-1 btn btn-danger m-1"
                    style={{ backgroundColor: "#a9042e", border: 0 }}
                  >
                    PPT
                  </Button>
                  <Button
                    onClick={handleEstimate}
                    className="col-md-2 btn btn-danger m-1"
                    style={{ backgroundColor: "#a9042e", border: 0 }}
                  >
                    Estimate
                  </Button>
                  <button
                    className="col-md-2 btn btn-danger m-1"
                    onClick={Export}
                    style={{ backgroundColor: "#a9042e", border: 0 }}
                  >
                    Actual
                  </button>
                  <div className="col-md-2 ">
                    {moreoption ? (
                      <>
                        <p
                          className="mroe m-1"
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
                              top: "21%",
                            }}
                          >
                            <Card
                              className="m-auto p-3"
                              style={{ width: "6rem" }}
                            >
                              <li onClick={handleDeleteSelectedRecceItems}>
                                <span style={{ color: "red" }}>Delete</span>
                              </li>
                            </Card>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="row ">
                  <div className="col-md-6">
                    <Form.Label
                      className="btn btn-outline-danger"
                      style={{ borderColor: "#a9042e" }}
                      htmlFor="icon-button-file"
                    >
                      <input
                        className="col-md-3 p-0"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: "none" }}
                        id="icon-button-file"
                        type="file"
                        disabled={selectedRecceItems?.length === 0}
                        onChange={(e) => {
                          setrecceexcel(e.target.files[0]);
                        }}
                      />
                      Import Excel
                    </Form.Label>
                  </div>
                  <div className="col-md-1">
                    {recceexcel && (
                      <Button
                        className="btn btn-danger"
                        style={{ backgroundColor: "#a9042e", border: 0 }}
                        onClick={() => handleImport(selectedRecceItems[0])}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Modal show={show} onHide={handleClose1}>
              <Modal.Header closeButton>
                <Modal.Title>Assign Recce </Modal.Title>
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
                        <option disabled>Choose..</option>
                        {vendordata?.map((vendorele) => (
                          <option key={vendorele?._id} value={vendorele?._id}>
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
            <div className="row m-auto mt-3">
              <Card
                className={`col-md-3 m-2 c_zoom ${"active1"}`}
                style={{ height: "125px" }}
              >
                <div className="row "></div>
                <div className="row m-auto">
                  <p
                    style={{
                      fontSize: "25px",
                      color: "green",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {completedStatus}
                  </p>
                  <p style={{ color: "black", textAlign: "center" }}>
                    Total Completed{" "}
                  </p>
                </div>
              </Card>
              <Card
                className={`col-md-3 m-2 c_zoom ${"active1"}`}
                style={{ height: "125px" }}
              >
                <div className="row "></div>
                <div className="row m-auto">
                  <p
                    style={{
                      fontSize: "25px",
                      color: "red",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {findingCompleteAndRemove.length}
                  </p>
                  <p style={{ color: "black", textAlign: "center" }}>
                    Total Pending{" "}
                  </p>
                </div>
              </Card>

              <Card
                className={`col-md-3 m-2 c_zoom ${"active1"}`}
                style={{ height: "125px" }}
              >
                <div className="row "></div>
                <div className="row m-auto">
                  <p
                    style={{
                      fontSize: "25px",
                      color: "red",
                      textAlign: "center",
                    }}
                  >
                    {cancelledStatus}
                  </p>
                  <p style={{ color: "black", textAlign: "center" }}>
                    Total Cancelled
                  </p>
                </div>
              </Card>
            </div>
            <div className="row mt-3">
              <div className="col-md-2 ">
                <label className="col-md-6">
                  {displayedData?.length} of: {reccedata?.length}
                </label>
                <Form.Control
                  as="select"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
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

              <div className="col-md-6 float-end">
                <div className="row">
                  <label className="col-md-3  m-auto">Start Date:</label>
                  <label className="col-md-6 m-auto">End Date:</label>
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
            </div>

            <div className=" row mt-3">
              <table>
                <thead className="t-c">
                  <tr>
                    <th className="th_s poppinfnt p-2">
                      <input
                        type="checkbox"
                        style={{
                          width: "15px",
                          height: "15px",
                          marginRight: "5px",
                        }}
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </th>
                    <th className="th_s poppinfnt p-2">SI.No.</th>
                    <th className="th_s poppinfnt p-2">Job.No.</th>
                    <th className="th_s poppinfnt p-2">Client Name </th>
                    <th className="th_s poppinfnt p-2">Contact Number</th>
                    <th className="th_s poppinfnt p-2"> Date</th>
                    <th className="th_s poppinfnt p-2">Action</th>
                    <th className="th_s poppinfnt p-2">Outlate</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData?.map((item, index) => {
                    const desiredClient = ClientInfo?.find(
                      (client) => client._id === item.BrandId
                    );
                    return (
                      <tr key={item._id}>
                        <td className="td_S poppinfnt p-1">
                          <input
                            style={{
                              width: "15px",
                              height: "15px",
                              marginRight: "5px",
                            }}
                            type="checkbox"
                            checked={selectedRecceItems?.includes(item._id)}
                            onChange={() => handleToggleSelect(item._id)}
                          />
                        </td>
                        <td className="td_S poppinfnt ">{index + 1}</td>
                        <td className="td_S poppinfnt ">Job {index + 1}</td>
                        <td className="td_S poppinfnt ">{item?.BrandName}</td>
                        <td className="td_S poppinfnt ">
                          {desiredClient?.ClientsContactNumber1}
                        </td>
                        <td className="td_S poppinfnt p-2 text-nowrap text-center">
                          {item.createdAt
                            ? new Date(item.createdAt)
                                ?.toISOString()
                                ?.slice(0, 10)
                            : ""}
                        </td>

                        <td className="td_S poppinfnt ">
                          <span
                            variant="info "
                            onClick={() => {
                              handleEdit(item._id, "details");
                            }}
                            style={{ cursor: "pointer", color: "skyblue" }}
                          >
                            Details
                          </span>
                        </td>
                        <td className="td_S poppinfnt ">
                          <span
                            variant="info "
                            onClick={() => {
                              handleEdit(item._id, "view");
                            }}
                            style={{ cursor: "pointer", color: "skyblue" }}
                          >
                            view
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="row  m-auto containerPadding">
            <>
              {selectedIndex.action === "details" ? (
                <div className="col-md-8">
                  <div className="row">
                    {console.log(getVendorName, "getVendorName")}
                    <div className="col-md-1">
                      <ArrowCircleLeftIcon
                        onClick={(e) => setSelectedIndex(null)}
                        style={{ color: "#068FFF" }}
                      />{" "}
                    </div>
                  </div>
                  <div className="row">
                    {filteredData1
                      ?.filter((ele) => ele._id === getVendorName)
                      ?.map((recce) => {
                        let { BrandName, ContactNumber } = recce;
                        return (
                          <>
                            <p>
                              <span className="me-3 clr">Brand Name:</span>
                              <span className="me-3 ">{BrandName}</span>
                            </p>

                            <p>
                              <span className="me-3 clr">Contact Number :</span>
                              {ContactNumber}
                            </p>
                          </>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <>
                  {viewOutletBoards ? (
                    <>
                      <div className="col-md-1 mb-3">
                        <ArrowCircleLeftIcon
                          onClick={() => setViewOutletBoard(false)}
                          style={{ color: "#068FFF", cursor: "pointer" }}
                        />
                      </div>
                      <div className="row">
                        {OutletDoneData.filter(
                          (Ele) => Ele?.outletShopId === viewOutletBoardsIdd
                        ).map((board, ind) => {
                          return (
                            <>
                              <div className="col-md-4 ">
                                <p className="poppinfnt ">
                                  <span className="me-2 subct">
                                    {" "}
                                    Outlet ShopName :
                                  </span>{" "}
                                  {board?.outletShopName
                                    ?.charAt(0)
                                    ?.toUpperCase() +
                                    board?.outletShopName?.slice(1)}
                                </p>
                                <p className="poppinfnt ">
                                  <span className="me-2 subct">
                                    Board Type :
                                  </span>
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
                                  <span className="me-2 subct">
                                    GST Number :
                                  </span>{" "}
                                  {board?.gstNumber}
                                </p>

                                <div className="row">
                                  <img
                                    width={200}
                                    height={200}
                                    className="col-md-8 banrrad"
                                    alt=""
                                    src={`${ImageURL}/Outlet/${board?.ouletBannerImage}`}
                                  />
                                  <div className="col-md-1 borderlef">
                                    <span className="border-line"></span>
                                    <span className="poppinfnt ms-5 me-3">
                                      {board?.height}
                                    </span>
                                    <span className="poppinfnt ms-5 me-3">
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
                                  {board?.remark}
                                </p>
                              </div>
                              <hr></hr>{" "}
                            </>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="row " style={{ height: "10vh" }}>
                        <div className="col-md-1 ">
                          <ArrowCircleLeftIcon
                            onClick={() => setSelectedIndex(null)}
                            style={{ color: "#068FFF", cursor: "pointer" }}
                          />
                        </div>
                        <div className="col-md-1 ">
                          {moreoption1 ? (
                            <>
                              <p
                                className="mroe "
                                onClick={() => setselectAction1(!selectAction1)}
                                style={{
                                  border: "1px solid white",
                                  height: "38px",
                                  width: "35px",
                                  textAlign: "center",
                                  borderRadius: "100px",
                                  backgroundColor: "#F5F5F5",
                                }}
                              >
                                <span className="text-center">
                                  <MoreVertIcon />
                                </span>
                              </p>
                              {selectAction1 ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    zIndex: "10px",
                                    top: "22%",
                                  }}
                                >
                                  <Card
                                    className="m-auto p-3"
                                    style={{ width: "12rem" }}
                                  >
                                    <p
                                      className="cureor"
                                      onClick={handleAssignVendor}
                                    >
                                      Assign to recce
                                    </p>

                                    <p
                                      className="cureor"
                                      style={{ color: "red" }}
                                      onClick={handleDeleteSelectedOutlet}
                                    >
                                      <span style={{ color: "red" }}>
                                        Delete
                                      </span>
                                    </p>
                                  </Card>
                                </div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="row ">
                          <div className="col-md-2 ">
                            <label className="col-md-9 mb-2">
                              <span>{data1}</span> <span>Of </span>
                              {filteredData2?.map((recceItem, index) => {
                                let d;

                                if (getVendorName == recceItem._id) {
                                  d = recceItem?.outletName?.length;
                                }
                                return <span>{d}</span>;
                              })}
                            </label>
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
                          </div>

                          <div className="col-md-6 ">
                            <div className="row">
                              <label className="col-md-5   mb-2">
                                Start Date:
                              </label>
                              <label className="col-md-6  mb-2">
                                End Date:
                              </label>
                              <div className="col-md-5 ">
                                <Form.Control
                                  type="date"
                                  value={FilterStartDate1}
                                  onChange={handleFilterStartDateChange1}
                                />
                              </div>
                              <div className="col-md-5 ">
                                <Form.Control
                                  type="date"
                                  value={FilterEndDate1}
                                  onChange={handleFilterEndDateChange1}
                                />
                              </div>
                              <div className="col-md-2 ">
                                <Button onClick={handleClearDateFilters1}>
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-2 ">
                            <label className="col-md-9 mb-2 ">Status</label>
                            <Form.Select
                              value={SelectedBoardStatus}
                              className="shadow-none p-2 bg-light rounded"
                              onChange={(e) => {
                                setSelectedBoardStatus(e.target.value);
                              }}
                            >
                              <option value="--Select All--">
                                --Select All--
                              </option>
                              <option value="Completed">Completed</option>
                              <option value="Pending">Pending</option>
                              <option value="Cancelled">Cancelled</option>
                            </Form.Select>{" "}
                          </div>
                        </div>
                      </div>

                      <table>
                        <thead className="t-c">
                          <tr>
                            <th className="th_s poppinfnt p-1">
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
                            <th className="th_s poppinfnt p-1">SI.No</th>
                            <th className="th_s poppinfnt p-1">Job.No</th>
                            <th className="th_s poppinfnt p-1">Brand </th>
                            <th className="th_s poppinfnt p-1">Shop Name</th>
                            <th className="th_s poppinfnt p-1">Client Name</th>
                            <th className="th_s poppinfnt p-1">State</th>
                            <th className="th_s poppinfnt p-1">
                              Contact Number
                            </th>
                            <th className="th_s poppinfnt p-1">Zone</th>
                            <th className="th_s poppinfnt p-1">Pincode</th>
                            <th className="th_s poppinfnt p-1">City</th>
                            <th className="th_s poppinfnt p-1">FL Board</th>
                            <th className="th_s poppinfnt p-1">GSB</th>
                            <th className="th_s poppinfnt p-1">Inshop</th>
                            <th className="th_s poppinfnt p-1">Vendor Name</th>
                            <th className="th_s poppinfnt p-1">Date</th>
                            <th className="th_s poppinfnt p-1">
                              Assigned Date
                            </th>

                            <th className="th_s poppinfnt p-1">Status</th>
                            <th className="th_s poppinfnt p-1">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredData2?.map((recceItem, index) =>
                            recceItem?.outletName?.map(
                              (outlet, outletArray) => {
                                let JobNob = 0;
                                let {
                                  ShopName,
                                  ClientName,
                                  OutletContactNumber,
                                  OutletZone,
                                  OutletCity,
                                  FLBoard,
                                  GSB,
                                  Inshop,
                                  date,
                                  State,
                                  OutletPincode,
                                  RecceStatus,
                                  OutletAddress,
                                  _id,
                                } = outlet;
                                reccedata?.forEach((recceItem, recceIndex) => {
                                  recceItem?.outletName?.forEach((item) => {
                                    if (outlet._id === item._id) {
                                      JobNob = recceIndex + 1;
                                    }
                                  });
                                });

                                if (rowsDisplayed < rowsPerPage1) {
                                  const selectedVendorId = outlet?.vendor;
                                  const Vendordata = vendordata?.find(
                                    (ele) => ele?._id === selectedVendorId
                                  );
                                  let JobStatus;
                                  let RecceCompletedDate;
                                  if (outlet.vendor !== null) {
                                    JobStatus = OutletDoneData?.filter(
                                      (fp) => fp.outletShopId === outlet._id
                                    );
                                    RecceCompletedDate =
                                      JobStatus[0]?.createdAt;
                                    JobStatus =
                                      JobStatus[0]?.jobStatus === true
                                        ? "Completed"
                                        : "Pending";
                                  }

                                  rowsDisplayed++;
                                  const pincodePattern = /\b\d{6}\b/;

                                  const address = OutletAddress;
                                  const extractedPincode =
                                    address?.match(pincodePattern);

                                  if (extractedPincode) {
                                    OutletPincode = extractedPincode[0];
                                  }

                                  return (
                                    <tr className="tr_C" key={outlet._id}>
                                      <td className="td_S poppinfnt p-1">
                                        <input
                                          style={{
                                            width: "15px",
                                            height: "15px",
                                            marginRight: "5px",
                                          }}
                                          type="checkbox"
                                          checked={selectedRecceItems1?.includes(
                                            _id
                                          )}
                                          onChange={() =>
                                            handleOutletToggleSelect(
                                              recceItem?.BrandId,
                                              _id
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {outletArray + 1}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        Job{JobNob}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {recceItem?.BrandName}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {ShopName}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {ClientName}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {State}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {OutletContactNumber}
                                      </td>

                                      <td className="td_S poppinfnt p-1">
                                        {OutletZone}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {!OutletPincode
                                          ? extractedPincode
                                          : OutletPincode}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {OutletCity}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {FLBoard}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {GSB}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        {Inshop}
                                      </td>

                                      <td className="td_S poppinfnt p-1">
                                        {Vendordata?.VendorFirstName}
                                      </td>
                                      <td className="td_S poppinfnt p-2 text-nowrap text-center">
                                        {RecceCompletedDate
                                          ? moment(RecceCompletedDate).format(
                                              "DD MMMM YYYY"
                                            )
                                          : ""}
                                      </td>

                                      <td className="td_S poppinfnt p-1">
                                        {date
                                          ? moment(date).format("DD MMMM YYYY")
                                          : ""}
                                      </td>

                                      <td
                                        className={`td_S poppinfnt p-1 ${
                                          JobStatus === "Completed"
                                            ? "grrn"
                                            : ""
                                        }`}
                                      >
                                        {RecceStatus === "Cancelled"
                                          ? RecceStatus
                                          : JobStatus}
                                      </td>
                                      <td className="td_S poppinfnt p-1">
                                        <p
                                          style={{
                                            color: "red",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => handleUpdate(_id)}
                                        >
                                          Cancel Job
                                        </p>
                                        <p
                                          onClick={() => handleOutletView(_id)}
                                        >
                                          View
                                        </p>
                                      </td>
                                    </tr>
                                  );
                                }
                              }
                            )
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              )}
            </>
          </div>
        )}
      </div>

      <Modal show={show} onHide={handleClose1}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Recce </Modal.Title>
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
                    <option key={vendorele?._id} value={vendorele?._id}>
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
          <Button variant="primary" onClick={AssignVendor}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
