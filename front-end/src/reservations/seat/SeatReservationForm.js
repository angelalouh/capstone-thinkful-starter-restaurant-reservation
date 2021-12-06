import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { listTables, seatReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";

function SeatReservationForm() {
  const { reservation_id } = useParams();
  const history = useHistory();

  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableAssignment, setTableAssignment] = useState({
    table_id: "",
    reservation_id,
  });

  useEffect(loadDashboard, []);

  function loadDashboard() {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables).catch(setError);
    return () => abortController.abort();
  }

  const tableAssignmentOptions = tables.map((table) => (
    <option value={table.table_id}>
      {table.table_name} - {table.capacity}
    </option>
  ));

  function cancelHandler() {
    history.goBack();
  }

  function submitHandler(event) {
    event.preventDefault();
    seatReservation(tableAssignment)
      .then(() => {
        history.push("/");
      })
      .catch(setError);
  }

  function changeHandler({ target: { name, value } }) {
    setTableAssignment((previousTable) => ({
      ...previousTable,
      [name]: value,
    }));
  }

  return (
    <main>
      <h1>Seating Reservation {reservation_id}</h1>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <div class="row mb-3">
          <label htmlFor="table_assignment" class="col-form-label col-auto pr-1">
            <h5>Table Assignment:</h5>
          </label>
          <div class="col-auto pl-1">
            <select
              id="table_assignment"
              name="table_id"
              class="form-select mb-2 pr-10"
              aria-label="Default select example"
              value={tableAssignment.table_id}
              onChange={changeHandler}
              require={true}
            >
              <option defaultValue>Table Name - Table Capacity</option>
              {tableAssignmentOptions}
            </select>
          </div>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-danger mr-2"
            onClick={cancelHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              class="bi bi-person-x-fill mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708z"
              />
            </svg>
            Cancel
          </button>
          <button type="submit" class="btn btn-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              class="bi bi-person-check-fill mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"
              />
              <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}

export default SeatReservationForm;
