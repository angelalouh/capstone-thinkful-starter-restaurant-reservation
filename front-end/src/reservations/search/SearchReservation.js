import React, { useState } from "react";
import ErrorAlert from "../../layout/ErrorAlert";
import { listReservations } from "../../utils/api";
import SearchReservationForm from "./SearchReservationForm";
import DashboardReservationsTable from "../../dashboard/DashboardReservationsTable";

function SearchReservation() {
  const [phoneNumber, setphoneNumber] = useState({
    mobile_number: "",
  });
  const [foundReservations, setFoundReservations] = useState(null);
  const [error, setError] = useState(null);

  function loadReservations() {
    const abortController = new AbortController();
    setError(null);
    listReservations(phoneNumber, abortController.signal)
      .then(setFoundReservations)
      .catch(setError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1 class="mt-lg-4 mt-1 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          class="bi bi-telephone-fill mb-2 mr-2"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"
          />
        </svg>
        Find Reservation
      </h1>
      <ErrorAlert error={error} />
      <SearchReservationForm
        phoneNumber={phoneNumber}
        setphoneNumber={setphoneNumber}
        setFoundReservations={setFoundReservations}
        setError={setError}
      />
      {foundReservations ? (
        <div class="mt-5">
          <h2>Matched Reservations:</h2>
          <DashboardReservationsTable
            loadReservations={loadReservations}
            reservations={foundReservations}
            setFoundReservations={setFoundReservations}
          />
        </div>
      ) : null}
    </main>
  );
}

export default SearchReservation;
