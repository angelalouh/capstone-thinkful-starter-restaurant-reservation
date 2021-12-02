const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Validation functions for the create handler
 */

function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "req body must have data property." });
}

function hasFirstName(req, res, next) {
  const firstName = req.body.data.first_name;
  if (firstName) {
    return next();
  }
  next({ status: 400, message: "Reservation must include a first_name." });
}

function hasLastName(req, res, next) {
  const lastName = req.body.data.last_name;
  if (lastName) {
    return next();
  }
  next({ status: 400, message: "Reservation must include a last_name." });
}

function hasMobileNumberInProperFormat(req, res, next) {
  const mobileNumber = req.body.data.mobile_number;
  const regex = new RegExp(/[0-9]{3}-[0-9]{3}-[0-9]{4}/);
  if (mobileNumber && regex.test(mobileNumber)) {
    return next();
  }
  next({
    status: 400,
    message:
      "Reservation must include a mobile_number in this format: XXX-XXX-XXXX.",
  });
}

function hasReservationDateInProperFormat(req, res, next) {
  const reservationDate = req.body.data.reservation_date;
  const regex = new RegExp(/\d{4}-\d{2}-\d{2}/);
  if (reservationDate && regex.test(reservationDate)) {
    res.locals.reservationDate = reservationDate;
    return next();
  }
  next({
    status: 400,
    message:
      "Reservation must include a reservation_date in this format: MM/DD/YYYY.",
  });
}

function reservationDateNotInPast(req, res, next) {
  const { reservationDate } = res.locals;
  if (Date.parse(reservationDate) < Date.now()) {
    next({
      status: 400,
      message:
        "Reservation cannot be made in the past. Only future reservations are allowed.",
    });
  }
  return next();
}

function reservationDateNotATuesday(req, res, next) {
  const { reservationDate } = res.locals;
  const resDateYear = reservationDate.slice(0, 4);
  const resDateMonth = reservationDate.slice(5, 7) - 1;
  const resDateDay = reservationDate.slice(8);
  const resDateDayOfWeek = new Date(resDateYear, resDateMonth, resDateDay)
    .toDateString()
    .slice(0, 3);
  if (resDateDayOfWeek === "Tue") {
    next({
      status: 400,
      message:
        "Reservations cannot be made on a Tuesday, when the restuarant is closed.",
    });
  }
  return next();
}

function hasReservationTimeInProperFormat(req, res, next) {
  const reservationTime = req.body.data.reservation_time;
  const regex = new RegExp(/[0-9]{2}:[0-9]{2}/);
  if (reservationTime && regex.test(reservationTime)) {
    return next();
  }
  next({
    status: 400,
    message:
      "Reservation must include a reservation_time in this format: HH:MM.",
  });
}

function hasPeopleInProperFormat(req, res, next) {
  const people = req.body.data.people;
  const regex = new RegExp(/[^1-6]/);
  if (people && !regex.test(people) && typeof people === "number") {
    return next();
  }
  next({
    status: 400,
    message:
      "Reservation must indicate the number of people in a party, ranging from 1 to 6.",
  });
}

/**
 * List handler for reservations resources
 */
async function list(req, res) {
  const queriedResDate = req.query.date;
  const data = await service.listReservationsOnQueriedDate(queriedResDate);
  res.json({ data });
}

/**
 * Create handler for reservations resources
 */
async function create(req, res) {
  const newReservation = await service.create(req.body.data);
  res.status(201).json({
    data: newReservation,
  });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasFirstName,
    hasLastName,
    hasMobileNumberInProperFormat,
    hasReservationDateInProperFormat,
    reservationDateNotInPast,
    reservationDateNotATuesday,
    hasReservationTimeInProperFormat,
    hasPeopleInProperFormat,
    asyncErrorBoundary(create),
  ],
};
