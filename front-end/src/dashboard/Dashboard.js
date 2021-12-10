import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationsView from "../reservations/ReservationsView";
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

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-2">
        <h4 className="mb-0">Reservations for Date: {reservationsDate}</h4>
      </div>
      <DashboardButtons reservationsDate={reservationsDate} />
      <ErrorAlert error={reservationsError} />
      <ReservationsView reservations={reservations} />
      <DashboardTablesList loadReservations={loadReservations} />
    </main>
  );
}

export default Dashboard;
