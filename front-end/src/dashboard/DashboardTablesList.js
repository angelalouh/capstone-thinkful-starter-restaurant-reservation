import React, { useEffect, useState } from "react";
import { listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function DashboardTablesList() {
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
        <p data-table-id-status={`${table.table_id}`}>{tableStatus}{occupant}</p>
      </li>
    );
  });

  return (
    <>
      <ErrorAlert error={tablesError} />
      <div>
        <h4>Tables:</h4>
        <ul class="list-group list-group-horizontal-sm">{tablesListItem}</ul>
      </div>
    </>
  );
}

export default DashboardTablesList;
