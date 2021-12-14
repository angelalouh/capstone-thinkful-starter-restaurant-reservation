import React, { useEffect, useState } from "react";
import { listTables, deleteTableAssignment } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function DashboardTablesList({ loadReservations }) {
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  useEffect(loadTables, []);

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  const tablesListItem = tables.map((table) => {
    let tableStatus = "Free";
    if (table.reservation_id) {
      tableStatus = "Occupied";
    }

    let occupant = null;
    if (tableStatus === "Occupied") {
      occupant = ` by Reservation ID: ${table.reservation_id}`;
    }

    return (
      <li class="list-group-item col" key={table.table_id}>
        <div class="fw-bold fs-5">{table.table_name}</div>
        <p data-table-id-status={`${table.table_id}`}>
          {tableStatus}
          {occupant}
        </p>
        <FinishButton tableStatus={tableStatus} tableId={table.table_id} />
      </li>
    );
  });

  function FinishButton({ tableStatus, tableId }) {
    if (tableStatus === "Occupied") {
      return (
        <button
          type="button"
          class="btn btn-success btn-sm"
          data-table-id-finish={tableId}
          onClick={() => handleFinishButtonClick(tableId)}
        >
          Finish
        </button>
      );
    }
    return null;
  }

  async function handleFinishButtonClick(tableId) {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      await deleteTableAssignment(tableId);
      loadTables();
      loadReservations();
    }
  }

  return (
    <>
      <ErrorAlert error={tablesError} />
      <div class="mt-4">
        <h4>Tables</h4>
        <ul class="list-group list-group-horizontal-sm">{tablesListItem}</ul>
      </div>
    </>
  );
}

export default DashboardTablesList;
