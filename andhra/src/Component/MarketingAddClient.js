import Header from "./Header";
import axios from "axios";
import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";

function MarketingAddClient() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [mclientName, setmClientsName] = useState("");
  const [mbusinessName, setMBusinessName] = useState("");
  const [mclientsContact1, setmClientsContact1] = useState("");
  const [mclientsEmail, setmClientsEmail] = useState("");
  const [fileError, setFileError] = useState("");
  const [mClientAddress, setmClientAddress] = useState("");
  const [mpincode, setMPincode] = useState("");
  const [mzone, setMZone] = useState("");
  const [msalesRepresentative, setmsalesRepresentative] = useState("");
  const [mclientImage, setMClientImage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const numericFields = ["mclientsContact1", "mpincode"];

  const validateForm = () => {
    if (
      !mclientName ||
      !mbusinessName ||
      !mclientsContact1 ||
      !mClientAddress ||
      !mclientsEmail ||
      !mpincode ||
      !mzone ||
      !msalesRepresentative ||
      !mclientImage
    ) {
      alert("Please fill in all the required fields.");
      return false;
    }

    for (const field of numericFields) {
      if (isNaN(parseFloat(eval(field)))) {
        alert(`Please enter a valid number for ${field}`);
        return false;
      }
    }

    return true;
  };

  const AddMClientsData = async (e) => {
    e.preventDefault();

    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    let formData = new FormData();
    formData.append("mclientsName", mclientName);
    formData.append("mClientBusinessName", mbusinessName);
    formData.append("mClientsContactNumber1", mclientsContact1);
    formData.append("MClientAddress", mClientAddress);
    formData.append("mClientsEmail", mclientsEmail);
    formData.append("mClientAddress", mClientAddress);
    formData.append("mPincode", mpincode);
    formData.append("mZone", mzone);
    formData.append("msaleexecutive", msalesRepresentative);
    formData.append("mClientImage", mclientImage);
    formData.append("mstate", "Andhrapradesh")
    try {
      const config = {
        url: "/marketingClient/marketingcliend/addmarketingclient",
        baseURL: ApiURL,
        headers: { "Content-Type": "multipart/form-data" },
        method: "post",
        data: formData,
      };

      const response = await axios(config);

      if (response.status === 200) {
        alert("Clients added");
        window.location.href = "/Marketing";
      }
    } catch (err) {
      console.log("Failed to add clients");
    }
  };
  const HandleCancel = () => {
    window.location.href = "/Marketing";
  };

  return (
    <>
      <Header />
      <div className="row containerPadding m-auto">
        <h5>Enter Client Details</h5>
        <Form className="card containerPadding">
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label>Clients Name</Form.Label>
              <Form.Control
                value={mclientName}
                onChange={(e) => setmClientsName(e.target.value)}
                type="text"
                placeholder="First name"
                isInvalid={formSubmitted && !mclientName}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Name
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom02">
              <Form.Label>Client's Business Name</Form.Label>
              <Form.Control
                value={mbusinessName}
                onChange={(e) => setMBusinessName(e.target.value)}
                type="text"
                placeholder="Please Enter Business"
                isInvalid={formSubmitted && !mbusinessName}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Business Name
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom03">
              <Form.Label>Client's Contact Number1</Form.Label>
              <Form.Control
                value={mclientsContact1}
                onChange={(e) => setmClientsContact1(e.target.value)}
                type="text"
                placeholder="Please Enter Number"
                isInvalid={formSubmitted && !mclientsContact1}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Number
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom04">
              <Form.Label>Client's Address</Form.Label>
              <Form.Control
                value={mClientAddress}
                onChange={(e) => setmClientAddress(e.target.value)}
                type="text"
                placeholder="Please Enter Number"
                isInvalid={formSubmitted && !mClientAddress}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Address
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom05">
              <Form.Label>Client's Email</Form.Label>
              <Form.Control
                value={mclientsEmail}
                onChange={(e) => setmClientsEmail(e.target.value)}
                type="text"
                placeholder="Please Enter email"
                isInvalid={formSubmitted && !mclientsEmail}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Email
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom06">
              <Form.Label>Client's image</Form.Label>
              <Form.Control
                type="file"
                name="marketing"
                onChange={(e) => setMClientImage(e.target.files[0])}
                isInvalid={formSubmitted && !mclientImage}
              />
              <Form.Control.Feedback type="invalid">
                Please Upload Image
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md="6" controlId="validationCustom07">
              <Form.Label>Pincode</Form.Label>
              <Form.Control
                value={mpincode}
                onChange={(e) => setMPincode(e.target.value)}
                type="text"
                placeholder="Enter pincode"
                isInvalid={formSubmitted && !mpincode}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Pincode
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom08">
              <Form.Label>Zone</Form.Label>
              <Form.Control
                value={mzone}
                onChange={(e) => setMZone(e.target.value)}
                type="text"
                placeholder="Enter Zone"
                isInvalid={formSubmitted && !mzone}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Zone
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mt-5" style={{ border: "1px solid grey" }}></Row>
          <p className="text-center">Sales Team Information</p>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom09">
              <Form.Label>Sales Representative</Form.Label>
              <Form.Control
                value={msalesRepresentative}
                onChange={(e) => setmsalesRepresentative(e.target.value)}
                required
                type="text"
                placeholder="Enter sales representative name"
                isInvalid={formSubmitted && !msalesRepresentative}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter valid Sales Representative
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Button onClick={AddMClientsData} className="col-md-2 m-auto c_W">
              Add Clients
            </Button>{" "}
            <Button onClick={HandleCancel} className="col-md-2 m-auto c_W">
              Cancel
            </Button>{" "}
            <div className="col-md-6"></div>
          </Row>
        </Form>
      </div>
    </>
  );
}

export default MarketingAddClient;
