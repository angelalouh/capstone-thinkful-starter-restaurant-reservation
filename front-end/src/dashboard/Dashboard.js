import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, previous, next } from "../utils/date-time";
import DashboardButtons from "./DashboardButtons";
import formatReservationTime from "../utils/format-reservation-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationsDate, setReservationsDate] = useState(date);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ reservationsDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  console.log("reservations:", reservations);

  const reservationsOnCurrentDate = reservations.filter(
    (reservation) => reservation.reservation_date === reservationsDate
  );

  console.log("res time formatted with fxn:", formatReservationTime(reservations));

  console.log("res on current date:", reservationsOnCurrentDate);

  const sortedReservations = reservations.sort((reservationA, reservationB) => {
    const resATimeArray = reservationA.reservation_time.split("");
    const resATimeWithoutColon = resATimeArray.filter(char => char !== ":");
    const resATime = resATimeWithoutColon.join("");

    const resBTimeArray = reservationB.reservation_time.split("");
    const resBTimeWithoutColon = resBTimeArray.filter(char => char !== ":");
    const resBTime = resBTimeWithoutColon.join("");
    
    return resATime - resBTime;
  });

  console.log("sorted res:", sortedReservations);

  const reservationsTableRows = reservations.map((reservation) => (
    <tr key={reservation.reservation_id}>
      <th scope="row">{reservation.reservation_time}</th>
      <td>{reservation.reservation_id}</td>
      <td>{reservation.first_name}</td>
      <td>{reservation.last_name}</td>
      <td>{reservation.mobile_number}</td>
      <td>{reservation.people}</td>
    </tr>
  ));

  // {JSON.stringify(reservations)}

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-2">
        <h4 className="mb-0">Reservations for Date: {reservationsDate}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <DashboardButtons setReservationsDate={setReservationsDate} />
      <table class="table table-info table-hover">
        <thead class="table-primary">
          <tr>
            <th scope="col">Reservation Time</th>
            <th scope="col">Reservation ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Party Size</th>
          </tr>
        </thead>
        <tbody>{reservationsTableRows}</tbody>
      </table>
    </main>
  );
}

export default Dashboard;
