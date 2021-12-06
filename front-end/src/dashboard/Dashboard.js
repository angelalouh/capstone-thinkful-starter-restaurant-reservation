import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";
import DashboardTablesList from "./DashboardTablesList";
import DashboardButtons from "./DashboardButtons";

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

  const query = useQuery();
  const queryDate = query.get("date");

  useEffect(() => {
    if (queryDate) {
      setReservationsDate(queryDate);
    }
  }, [queryDate]);

  useEffect(loadReservations, [reservationsDate]);

  function loadReservations() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: reservationsDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const reservationsTableRows = reservations.map((reservation) => (
    <tr key={reservation.reservation_id}>
      <th scope="row">{reservation.reservation_time}</th>
      <td>{reservation.reservation_id}</td>
      <td>{reservation.first_name}</td>
      <td>{reservation.last_name}</td>
      <td>{reservation.mobile_number}</td>
      <td>{reservation.people}</td>
      <td>
        <a
          class="btn btn-primary"
          href={`/reservations/${reservation.reservation_id}/seat`}
          role="button"
        >
          Seat
        </a>
      </td>
    </tr>
  ));

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-2">
        <h4 className="mb-0">Reservations for Date: {reservationsDate}</h4>
      </div>
      <DashboardButtons reservationsDate={reservationsDate} />
      <ErrorAlert error={reservationsError} />
      <div>
        <table class="table table-info table-hover">
          <thead class="table-primary">
            <tr>
              <th scope="col">Reservation Time</th>
              <th scope="col">Reservation ID</th>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">Mobile Number</th>
              <th scope="col">Party Size</th>
              <th scope="col">Seat Reservation</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
      </div>
      <DashboardTablesList />
    </main>
  );
}

export default Dashboard;
