import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { formatAsTime } from "../utils/date-time";
import { setReservationStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function DashboardReservationsTable({ reservations, loadReservations }) {
  const location = useLocation();
  const [error, setError] = useState(null);

  const reservationsTableRows = reservations.map((reservation) => {
    if (
      reservation.status === "finished" ||
      (reservation.status === "cancelled" && location.pathname === "/dashboard")
    ) {
      return null;
    }
    return (
      <tr key={reservation.reservation_id}>
        <th scope="row">{formatAsTime(reservation.reservation_time)}</th>
        <td>{reservation.reservation_id}</td>
        <td>{reservation.first_name}</td>
        <td>{reservation.last_name}</td>
        <td>{reservation.mobile_number}</td>
        <td>{reservation.people}</td>
        <td>
          <p data-reservation-id-status={reservation.reservation_id}>
            {reservation.status}
          </p>
          <SeatButton
            reservation_id={reservation.reservation_id}
            status={reservation.status}
          />
        </td>
        <td>
          {reservation.status === "cancelled" ? null : (
            <>
              <EditReservationButton
                reservation_id={reservation.reservation_id}
              />
              <CancelReservationButton reservation={reservation} />
            </>
          )}
        </td>
      </tr>
    );
  });

  function SeatButton({ reservation_id, status }) {
    if (status === "booked") {
      return (
        <a
          class="btn btn-primary btn-sm"
          href={`/reservations/${reservation_id}/seat`}
          role="button"
        >
          Seat
        </a>
      );
    }
    return null;
  }

  function EditReservationButton({ reservation_id }) {
    return (
      <a
        class="btn btn-secondary btn-sm col-md-8 mb-2"
        href={`/reservations/${reservation_id}/edit`}
        role="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="currentColor"
          class="bi bi-pencil-square mb-1 mr-1"
          viewBox="0 0 16 16"
        >
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
          <path
            fill-rule="evenodd"
            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
          />
        </svg>
        Edit
      </a>
    );
  }

  function CancelReservationButton({ reservation }) {
    return (
      <button
        type="button"
        class="btn btn-danger btn-sm col-md-8"
        data-reservation-id-cancel={reservation.reservation_id}
        onClick={() =>
          handleCancelReservationButtonClick(reservation.reservation_id)
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="currentColor"
          class="bi bi-trash mb-1 mr-1"
          viewBox="0 0 16 16"
        >
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
          <path
            fill-rule="evenodd"
            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
          />
        </svg>
        Cancel
      </button>
    );
  }

  function handleCancelReservationButtonClick(reservation_id) {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      setError(null);
      setReservationStatus(reservation_id, "cancelled", abortController.signal)
        .then(() => loadReservations())
        .catch(setError);
      return () => abortController.abort();
    }
  }

  if (reservations && !reservations.length) {
    return (
      <div class="alert alert-warning py-3" role="alert">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          class="bi bi-patch-exclamation-fill mb-1 mr-1"
          viewBox="0 0 16 16"
        >
          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
        No reservations found.
      </div>
    );
  }
  return (
    <>
      <ErrorAlert error={error} />
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
              <th scope="col">Reservation Status</th>
              <th scope="col">Reservation Options</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
      </div>
    </>
  );
}

export default DashboardReservationsTable;
