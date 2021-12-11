import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function TableCreate() {
  const history = useHistory();
  const [error, setError] = useState(null);
  const [table, setTable] = useState({
    table_name: "",
    capacity: "",
  });

  function changeHandler({ target: { name, value } }) {
    setTable((previousTable) => ({
      ...previousTable,
      [name]: value,
    }));
  }

  function cancelHandler() {
    history.goBack();
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();
    setError(null);
    createTable(table, abortController.signal)
      .then(() => history.push("/"))
      .catch(setError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Create Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <div class="col-5 mb-3 pl-1">
          <label htmlFor="table_name" class="form-label">
            Table Name:
          </label>
          <input
            id="table_name"
            name="table_name"
            type="text"
            class="form-control"
            aria-describedby="table_nameHelpBlock"
            onChange={changeHandler}
            value={table.table_name}
          />
          <div id="table_nameHelpBlock" class="form-text">
            Table name must be at least 2 characters long.
          </div>
        </div>
        <div class="col-5 mb-3 pl-1">
          <label htmlFor="capacity" class="form-label">
            Capacity:
          </label>
          <input
            id="capacity"
            name="capacity"
            type="text"
            class="form-control"
            aria-describedby="capacityHelpBlock"
            require={true}
            onChange={changeHandler}
            value={table.capacity}
          />
          <div id="capacityHelpBlock" class="form-text">
            Table capacity must be at least 1.
          </div>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-danger mr-2 ml-1"
            onClick={cancelHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-x-circle mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
            Cancel
          </button>
          <button type="submit" class="btn btn-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-check-circle mr-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
            </svg>
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}

export default TableCreate;
