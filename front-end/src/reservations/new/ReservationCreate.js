import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";

function ReservationCreate() {
  const history = useHistory();

  const [error, setError] = useState(null);

  const [reservation, setReservation] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

  function cancelHandler() {
    history.goBack();
  }

  function submitHandler(event) {
    event.preventDefault();
    createReservation(reservation)
      .then(() => {
        history.push(`/dashboard?date=${reservation.reservation_date}`);
      })
      .catch(setError);
  }

  function changeHandler({ target: { name, value } }) {
    setReservation((previousReservation) => ({
      ...previousReservation,
      [name]: value,
    }));
  }

  return (
    <main>
      <h1>Create Reservation</h1>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <div>
          <label htmlFor="first_name">First Name:</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            require={true}
            onChange={changeHandler}
            value={reservation.first_name}
          />
        </div>
        <div>
          <label htmlFor="last_name">Last Name:</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            require={true}
            onChange={changeHandler}
            value={reservation.last_name}
          />
        </div>
        <div>
          <label htmlFor="mobile_number">Mobile Number:</label>
          <input
            id="mobile_number"
            name="mobile_number"
            type="tel"
            placeholder="123-456-7890"
            require={true}
            onChange={changeHandler}
            value={reservation.mobile_number}
          />
          <small>Required Format: XXX-XXX-XXXX</small>
        </div>
        <div>
          <label htmlFor="reservation_date">Date of Reservation:</label>
          <input
            id="reservation_date"
            name="reservation_date"
            type="date"
            pattern="\d{4}-\d{2}-\d{2}"
            require={true}
            onChange={changeHandler}
            value={reservation.reservation_date}
          />
        </div>
        <div>
          <label htmlFor="reservation_time">Time of Reservation:</label>
          <input
            id="reservation_time"
            name="reservation_time"
            type="time"
            pattern="[0-9]{2}:[0-9]{2}"
            require={true}
            onChange={changeHandler}
            value={reservation.reservation_time}
          />
          <small>
            Business Hours: 10:30AM to 10:30PM (latest reservation allowed:
            9:30PM)
          </small>
        </div>
        <div>
          <label htmlFor="people">Number of People in Party:</label>
          <input
            id="people"
            name="people"
            type="text"
            pattern="[1-6]"
            require={true}
            onChange={changeHandler}
            value={reservation.people}
          />
          <small>Party size must range from 1-6.</small>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-danger mr-2"
            onClick={cancelHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calendar-x mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708z" />
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
            </svg>
            Cancel
          </button>
          <button type="submit" class="btn btn-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calendar-check mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
            </svg>
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}

export default ReservationCreate;
