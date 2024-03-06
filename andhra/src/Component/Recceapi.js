import React, { useEffect, useState } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import "react-data-table-component-extensions/dist/index.css";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import axios from "axios";

export default function ReceeManagementApi() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [brandName, setBrandName] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [zone, setzone] = useState("");
  // const [clientName, setclientName] = useState("");
  const [ClientInfo, setClientInfo] = useState([]);
  const [brandId, setBrandId] = useState("");

  const [BrandState, setBrandState] = useState("");
  useEffect(() => {
    getAllClientsInfo();
  }, []);
  const AddRecce = async () => {
    try {
      const config = {
        url: "/recce/recce/addrecce",
        baseURL: ApiURL,
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          BrandId: brandId,
          BrandName: brandName,
          BrandState: "Andhrapradesh",
        },
      };

      const response = await axios(config);

      if (response.status === 200) {
        alert("Added Successfully");
        window.location.href = "/ReceeManagement";
        setBrandName("");
        setCity("");
        setContactNumber("");
        setArea("");
        setPincode("");
        setzone("");
      }
    } catch (err) {
      alert(err, "error in add recce");
    }
  };

  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        // Andhrapradesh

        let filterCityWise = res.data.client?.filter(
          (ele) => ele?.state === "Andhrapradesh"
        );
        setClientInfo(filterCityWise);
      }
    } catch (err) {
      alert(err, "err");
    }
  };

  let cliendId = ClientInfo?.map((ele) => ele);

  return (
    <>
      <Header />
      <div className="row  m-auto containerPadding">
        <Form>
          <Col className="col-md-6 m-auto">
            <Form.Group
              md="5"
              className="mb-3"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Label>Select Client</Form.Label>
              <Form.Select
                className="shadow-none p-3 mb-5 bg-light rounded"
                onChange={(e) => {
                  const getBrands = cliendId.find(
                    (item) => item._id === e.target.value
                  );
                  setBrandState(getBrands.City);
                  setBrandId(getBrands);
                  setBrandName(getBrands ? getBrands.clientsBrand : "");
                }}
                type="text"
                placeholder="Enter zone"
              >
                {" "}
                <option>Choose...</option>
                {cliendId?.map((ele) => (
                  <option value={ele._id}>{ele?.clientsBrand}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Row className="row mt-5 text-center ">
            <div className="col-md-4 m-auto">
              <div className="row">
                <Button className="col-md-5 m-1 " onClick={AddRecce}>
                  Save Recce
                </Button>
                <Button
                  className="col-md-5 m-1 text-white "
                  href="/ReceeManagement"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Row>
        </Form>
      </div>
    </>
  );
}
