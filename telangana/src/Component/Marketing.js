import { useEffect, useState } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import "react-data-table-component-extensions/dist/index.css";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
// getmarketingclient
export default function Marketing() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [MAddClients, setMAddClients] = useState([]);
  const [getMclient, setgetMclient] = useState();
  const [Data, setData] = useState([]);
  useEffect(() => {
    getAllClientsInfo();
    getById();
  });
  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/marketingClient/marketingcliend/getmarketingclient`
      );
      if (res.status === 200) {
        let filterCityWise = res.data.mclient?.filter(
          (ele) => ele?.mstate === "telangana"
        );
        setMAddClients(filterCityWise);
      }
    } catch (err) {
      alert(err, "err");
    }
  };
  const getById = async () => {
    try {
      if (getMclient?.hasOwnProperty("_id")) {
        const res = await axios.get(
          `${ApiURL}/marketingClient/marketingcliend/getremarks/${getMclient._id}`
        );
        if (res.status === 200) {
          setData(res.data.remarks);
        }
      } else {
        console.error("getMclient is undefined or does not have _id property");
      }
    } catch (err) {
      alert(err, "err");
    }
  };

  const [selectedIndex, setSelectedIndex] = useState(false);
  const handleEdit = (clinet) => {
    setgetMclient(clinet);
    setSelectedIndex(true);
  };
  const [remarks, setRemarks] = useState(false);
  const [saveDate, setSaveDate] = useState(false);
  const [shedule, setShedule] = useState(false);
  const [sheduledDate, setSheduledDate] = useState(false);

  const creatMeeting = () => {
    setShedule(!shedule);
  };

  const addMeetingTime = async () => {
    if (!sheduledDate) {
      return alert("Please Select Time");
    }

    try {
      const config = {
        url: "/marketingClient/marketingcliend/addmeetingtime",
        method: "post",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          clientId: getMclient?._id,
          newMeetingTime: sheduledDate,
        },
      };

      const res = await axios(config);

      if (res.status === 200) {
        alert("Successfully added meeting time");
        window.location.reload("");
      }
    } catch (err) {
      alert("Not able to add", err);
    }
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleAddRemarks = async () => {
    try {
      const config = {
        url: "/marketingClient/marketingcliend/addremarks",
        method: "post",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          clientId: getMclient?._id,
          Remarks: remarks,
        },
      };

      const res = await axios(config);
      if (res.status === 200) {
        alert("Remarks added succesfully");
        window.location.reload("");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDeleteShedule = async (idd) => {
    const res = await axios.post(
      `${ApiURL}/marketingClient/marketingcliend/deleteClient/${idd}`
    );
    if (res.status === 200) {
      alert("Client deleted succesfully");
      window.location.reload("");
    }
  };
  return (
    <>
      <Header />
      {!selectedIndex ? (
        <>
          <div className="row  m-auto containerPadding">
            <div className="col-md-12 ">
              <Button
                className="col-md-2 c_W"
                href="/MarketingAddClient"
                style={{ marginRight: "5px", color: "white" }}
              >
                Add Clients
              </Button>
              {/* <Button
                href="/Marketingshedule"
                style={{ color: "white" }}
                className="col-md-2 m-1 c_W"
              >
                Sheduled Meeting
              </Button> */}
            </div>
          </div>
          <div className="row  m-auto containerPadding">
            <div className=" row mt-3">
              <table>
                <thead className="t-c">
                  <tr>
                    <th className="th_s ">SI.No.</th>
                    <th className="th_s ">Client Name</th>{" "}
                    <th className="th_s ">Business Name</th>
                    <th className="th_s ">Contact Number</th>
                    <th className="th_s ">Email</th>
                    <th className="th_s ">Pincode</th>
                    <th className="th_s ">Zone</th>
                    <th className="th_s ">Sales executive </th>
                    <th className="th_s "> Date</th>
                    <th className="th_s ">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MAddClients?.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td className="td_S ">{index + 1}</td>
                        <td className="td_S ">{item.mclientsName}</td>
                        <td className="td_S ">{item.mClientBusinessName}</td>
                        <td className="td_S ">{item.mClientsContactNumber1}</td>
                        <td className="td_S ">{item.mClientsEmail}</td>

                        <td className="td_S ">{item.mPincode}</td>
                        <td className="td_S"> {item.mZone}</td>
                        <td className="td_S ">{item.msaleexecutive}</td>

                        <td className="td_S ">
                          {item.createdAt
                            ? new Date(item.createdAt)
                                ?.toISOString()
                                ?.slice(0, 10)
                            : ""}
                        </td>

                        <td className="td_S ">
                          <span
                            variant="info "
                            onClick={() => {
                              handleEdit(item);
                            }}
                            style={{
                              cursor: "pointer",
                              color: "skyblue",
                              marginRight: "10px",
                            }}
                          >
                            View
                          </span>
                          <span
                            variant="info "
                            onClick={() => {
                              handleDeleteShedule(item._id);
                            }}
                            style={{ cursor: "pointer", color: "red" }}
                          >
                            delete
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>{" "}
            </div>
          </div>{" "}
        </>
      ) : (
        <>
          <div className="row  m-auto">
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-6 mt-3">
                  <img
                    width={"50px"}
                    height={"50px"}
                    style={{
                      borderRadius: "100%",
                    }}
                    src={`${ImageURL}/marketing/${getMclient.mClientImage}`}
                    alt=""
                  />
                </div>
              </div>{" "}
              <div className="row">
                <div className="col-md-8">
                  <p>
                    <span className="clr me-2">Name :</span>{" "}
                    <span>{getMclient?.mclientsName}</span>{" "}
                  </p>
                  <p>
                    <span className="clr me-2">Sales Exicutive Name :</span>{" "}
                    <span>{getMclient?.msaleexecutive}</span>{" "}
                  </p>
                  <p>
                    <span className="clr me-2">Client Added Date :</span>{" "}
                    <span>
                      {getMclient?.createdAt
                        ? new Date(getMclient.createdAt)
                            ?.toISOString()
                            ?.slice(0, 10)
                        : ""}
                    </span>{" "}
                  </p>
                  <p>
                    <span className="clr me-2">Number :</span>{" "}
                    <span>{getMclient?.mClientsContactNumber1}</span>
                  </p>
                  <p>
                    <span className="clr me-2">Business Name :</span>
                    <span>{getMclient?.mClientBusinessName}</span>
                  </p>
                  <p>
                    {" "}
                    <span className="clr me-2">Email :</span>
                    <span>{getMclient?.mClientsEmail}</span>
                  </p>
                  <p>
                    {" "}
                    <span className="clr me-2">Pincode :</span>
                    <span>{getMclient?.mPincode}</span>
                  </p>
                  <p>
                    {" "}
                    <span className="clr me-2">Zone :</span>
                    <span>{getMclient?.mZone}</span>
                  </p>
                  <p>
                    {" "}
                    <span className="clr me-2">Address :</span>
                    <span>{getMclient?.mClientAddress}</span>
                  </p>
                  <span>Meeting Sheduled at : {saveDate}</span>
                </div>
              </div>
              <div className="row mt-3">
                <Button className="col-md-3 m-1 c_W" onClick={creatMeeting}>
                  <VideoCallIcon />
                  New meeting
                </Button>
                <Button className="col-md-3 m-1 c_W" onClick={addMeetingTime}>
                  Save meeting
                </Button>
                <Button className="col-md-3 m-1 c_W">
                  <Link to="/Marketingshedule" state={{ id: getMclient._id }}>
                    Sheduled Meeting
                  </Link>
                </Button>

                <Button className="col-md-3 m-1 c_W" onClick={handleShow}>
                  Add Remarks
                </Button>
              </div>
              <div className={!shedule ? " hide" : ""}>
                <Card className="col-md-6">
                  <p>
                    <LinkIcon />
                    Create a meeting for later
                  </p>
                  <p>
                    <AddIcon />
                    Start an instant meeting
                  </p>
                  <p>
                    <span>
                      <label>
                        <input
                          style={{ width: "20px", border: "none" }}
                          type="datetime-local"
                          value={sheduledDate}
                          onChange={(e) => setSheduledDate(e.target.value)}
                        />
                      </label>
                    </span>{" "}
                  </p>
                </Card>
              </div>{" "}
            </div>
            <table>
              <thead className="t-c">
                <tr>
                  <th className="th_s ">SI.No.</th>
                  <th className="th_s ">Remarks</th>{" "}
                  <th className="th_s "> Date</th>
                  <th className="th_s "> Time</th>
                </tr>
              </thead>
              <tbody>
                {Data?.map((item, index) => {
                  return (
                    <tr key={item._id}>
                      <td className="td_S ">{index + 1}</td>
                      <td className="td_S ">{item?.Remarks}</td>

                      <td className="td_S ">
                        {item?.createdAt
                          ? new Date(item?.createdAt)?.toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : ""}
                      </td>

                      <td className="td_S ">
                        {item?.createdAt
                          ? new Date(item?.createdAt)?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>{" "}
          </div>
        </>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Control
                type="text"
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddRemarks}>
            Save Remarks
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
