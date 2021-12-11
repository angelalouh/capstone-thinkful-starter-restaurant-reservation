import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ReservationCreate from "../reservations/new/ReservationCreate";
import TableCreate from "../tables-new/TableCreate";
import SeatReservationForm from "../reservations/seat/SeatReservationForm";
import SearchReservation from "../reservations/search/SearchReservation";
import EditReservation from "../reservations/edit/EditReservation";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={{ pathname: "/dashboard", search: `?date=${today()}` }} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      <Route path="/search">
        <SearchReservation />
      </Route>
      <Route path="/reservations/new">
        <ReservationCreate />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatReservationForm />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={{ pathname: "/dashboard", search: `?date=${today()}` }} />
      </Route>
      <Route path="/tables/new">
        <TableCreate />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
