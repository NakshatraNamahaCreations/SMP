import React, { useEffect, useState } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
function Marketingshedule() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [reshedule, setReshedule] = useState(false);
  const [sheduledData, setSheduleData] = useState([]);

  const [ClientData, setClientData] = useState([]);
  const [EditSheduled, setEditSheduled] = useState({});
  useEffect(() => {
    getAllClientsInfo();
  }, []);
  const location = useLocation();
  const id = location?.state?.id;

  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/marketingClient/marketingcliend/getbyidd/${id}`
      );
      const cliendata = await axios.get(
        `${ApiURL}/marketingClient/marketingcliend/clientbyid/${id}`
      );
      if (cliendata.status === 200) {
        setClientData(cliendata.data.clientdata);
      }
      if (res.status === 200) {
        setSheduleData(res.data.shedule);
      }
    } catch (err) {
      console.log(err, "err");
    }
  };

  const handleEditSheduleMeeting = (item) => {
    const selectedDate = new Date(item.newMeetingTime);
    const selectedTime = selectedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    setEditSheduled(item);
    setReshedule(!reshedule);
  };

  const groupedByDate = {};

  sheduledData?.forEach((item) => {
    if (item.newMeetingTime && !isNaN(new Date(item?.newMeetingTime))) {
      const date = new Date(item.newMeetingTime);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const key = `${year}-${month}-${day}`;

      if (!groupedByDate[key]) {
        groupedByDate[key] = [];
      }
      groupedByDate[key].push(item);
    }
  });

  const handleDeleteShedule = async (idd) => {
    const res = await axios.post(
      `${ApiURL}/marketingClient/marketingcliend/deleteshedule/${idd}`
    );
    if (res.status === 200) {
      alert("shedule deleted succesfully");
      window.location.reload("");
    }
  };

  const handleMettingStatus = async (idd) => {
    try {
      const config = {
        url: `/marketingClient/marketingcliend/updateShedule/${idd}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          MeetingStatus: true,
        },
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert("shedule updated succesfully");
        window.location.reload("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const dateString = EditSheduled.newMeetingTime;
  const dateObject = new Date(dateString);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = dateObject.getFullYear();
  const month = months[dateObject.getMonth()];
  const day = dateObject.getDate();
  let hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedDate = `${month} ${day}, ${year} ${hours}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return (
    <>
      <Header />
      <div className="row m-auto mt-4">
        <div className="row ">
          {reshedule ? (
            <>
              <div className="row">
                <div className="col-md-1">
                  <ArrowCircleLeftIcon
                    onClick={() => setReshedule(!reshedule)}
                    style={{ color: "#068FFF" }}
                  />{" "}
                </div>
              </div>

              <p>
                <span>Time : {formattedDate}</span>
              </p>
              <p>
                <span>
                  Sheduled Call With Client: {ClientData[0]?.mclientsName}
                </span>
              </p>

              <Button
                className="col-md-2 m-2 c_W"
                onClick={() => handleDeleteShedule(EditSheduled._id)}
              >
                delete
              </Button>
              <Button
                className="col-md-2 m-2 c_W"
                onClick={() => handleMettingStatus(EditSheduled._id)}
              >
                Metting End
              </Button>
            </>
          ) : (
            <div className="col-md-7 m-auto">
              <div className="calendar ">
                <div className="calendar__month mb-4 row">
                  <div className="col-md-1">
                    <Link to="/Marketing">
                      <ArrowCircleLeftIcon style={{ color: "#068FFF" }} />
                    </Link>{" "}
                  </div>
                  <div className="col-md-3"></div>
                  <div className="col-md-8">
                    {Object.keys(groupedByDate).length === 0 &&
                    groupedByDate.constructor === Object ? (
                      <h3> No Events Sheduled</h3>
                    ) : (
                      <h3>Upcoming Events</h3>
                    )}
                  </div>
                </div>
                <div className="row p-3">
                  {sheduledData?.map((key) => {
                    const scheduledTime = new Date(key?.newMeetingTime);
                    const currentDate = new Date();

                    const day = scheduledTime.getDate();
                    const monthName = scheduledTime.toLocaleString("en-US", {
                      month: "long",
                    });
                    const year = scheduledTime.getFullYear();

                    const formattedDateString = scheduledTime.toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        timeZone: "Asia/Kolkata",
                      }
                    );

                    const isMeetingExpired = scheduledTime < currentDate;
                    const timeDifference = scheduledTime - currentDate;

                    const timeDifferenceInMinutes =
                      timeDifference / (1000 * 60);

                    const isMeetingAboutToStart =
                      timeDifferenceInMinutes > 0 &&
                      timeDifferenceInMinutes <= 10;

                    if (isMeetingAboutToStart) {
                      toast(
                        `Meeting With Client ${
                          ClientData[0]?.mclientsName
                        }  is about to start in ${Math.floor(
                          timeDifferenceInMinutes
                        )} minutes!`
                      );
                    } else {
                      console.log("Meeting is not about to start.");
                    }
                    return (
                      <div key={key}>
                        <div>
                          <p className="clr1 clr">
                            {day} {monthName} {year}
                          </p>
                        </div>

                        <div>
                          <div className="row" key={key?._id}>
                            <span className="clr1 col-md-1 m-auto">{day}</span>{" "}
                            <span className="col-md-4 m-auto">
                              Scheduled Google Meet with{" "}
                              {ClientData[0]?.mclientsName}
                            </span>
                            <span className="col-md-3 m-auto">
                              Schedule Status{" "}
                              {isMeetingExpired ? (
                                <span style={{ color: "red" }}>
                                  Expired: {formattedDateString}
                                </span>
                              ) : (
                                <span>
                                  {key?.MeetingStatus === true
                                    ? "Completed"
                                    : "Pending"}{" "}
                                  {formattedDateString}
                                </span>
                              )}
                            </span>
                            <span
                              className="col-md-2 m-auto text-end cursor"
                              onClick={() => handleEditSheduleMeeting(key)}
                              style={{ color: "blue" }}
                            >
                              Details
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-md-2 m-auto">
                <Button className=" mt-4 c_W" href="/Marketing">
                  Sheduled
                </Button>
              </div>
            </div>
          )}
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition="Bounce"
        />
      </div>
    </>
  );
}

export default Marketingshedule;
