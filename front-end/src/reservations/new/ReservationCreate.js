import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { today } from "../../utils/date-time";
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
        history.push("/dashbord");
      })
      .catch(setError);
  }

  function changeHandler({ target: { name, value } }) {
    setReservation((previousReservation) => ({
      ...previousReservation,
      [name]: value,
    }));
  }

  console.log(reservation);

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
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
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
            min={today()}
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
            min="10:30"
            max="21:30"
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
          <select
            id="people"
            name="people"
            require={true}
            onChange={changeHandler}
            value={reservation.people}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>
        <div>
          <button type="button" onClick={cancelHandler}>
            Cancel
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </main>
  );
}

export default ReservationCreate;
