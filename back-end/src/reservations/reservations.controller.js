const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Validation functions for the create handler
 */
function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "Request body must have data property." });
}

function initializingErrorsObject(req, res, next) {
  let errors = {
    status: 400,
    message: [],
  };
  res.locals.errors = errors;
  return next();
}

function hasFirstName(req, res, next) {
  const firstName = req.body.data.first_name;
  if (firstName) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("Reservation must include a first_name.");
  return next();
}

function hasLastName(req, res, next) {
  const lastName = req.body.data.last_name;
  if (lastName) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("Reservation must include a last_name.");
  return next();
}

function hasMobileNumberInProperFormat(req, res, next) {
  const mobileNumber = req.body.data.mobile_number;
  const regexTenDigitFormat = new RegExp(/[0-9]{3}-[0-9]{3}-[0-9]{4}/);
  const regexSevenDigitFormat = new RegExp(/[0-9]{3}-[0-9]{4}/);
  if (
    (mobileNumber && regexTenDigitFormat.test(mobileNumber)) ||
    regexSevenDigitFormat.test(mobileNumber)
  ) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a mobile_number in this format: XXX-XXX-XXXX."
  );
  return next();
}

function hasReservationDateInProperFormat(req, res, next) {
  const reservationDate = req.body.data.reservation_date;
  const regex = new RegExp(/\d{4}-\d{2}-\d{2}/);
  res.locals.reservationDate = reservationDate;
  if (reservationDate && regex.test(reservationDate)) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_date in this format: MM/DD/YYYY."
  );
  return next();
}

function reservationDateNotInPast(req, res, next) {
  const { reservationDate, errors } = res.locals;

  // UTC date:
  const date = new Date();

  const [month, day, year] = [
    // local time's month represented as an integer # ranging from 0 to 11
    date.getMonth(),
    date.getDate(),
    date.getFullYear(),
  ];

  const currentDate = new Date(Date.UTC(year, month, day));
  res.locals.currentDate = currentDate;

  if (reservationDate) {
    const resDate = new Date(reservationDate);
    res.locals.resDate = resDate;

    if (resDate < currentDate) {
      errors.message.push(
        "Reservations cannot be made in the past. Only future reservations are allowed."
      );
      return next();
    }
  }
  return next();
}

function reservationDateNotATuesday(req, res, next) {
  const { reservationDate, errors } = res.locals;

  if (reservationDate) {
    const resDateYear = Number(reservationDate.slice(0, 4));
    const resDateMonth = Number(reservationDate.slice(5, 7)) - 1;
    const resDateDay = Number(reservationDate.slice(8));
    const resDateDayOfWeek = new Date(
      resDateYear,
      resDateMonth,
      resDateDay
    ).getDay();

    if (resDateDayOfWeek === 2) {
      errors.message.push(
        "Reservations cannot be made on a Tuesday, when the restuarant is closed."
      );
      return next();
    }
  }
  return next();
}

function hasReservationTimeInProperFormat(req, res, next) {
  const reservationTime = req.body.data.reservation_time;
  const regex = new RegExp(/[0-9]{2}:[0-9]{2}/);
  res.locals.reservationTime = reservationTime;

  if (reservationTime && regex.test(reservationTime)) {
    return next();
  }

  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_time in this format: HH:MM."
  );
  return next();
}

function hasReservationTimeWithinEligibleTimeframe(req, res, next) {
  const { reservationTime, errors, resDate, currentDate } = res.locals;

  if (reservationTime && resDate && currentDate) {
    const resDateTimeInMs = resDate.getTime();
    const currentDateTimeInMs = currentDate.getTime();

    const resTimeNum = reservationTime.replace(":", "");

    if (Number(resTimeNum) < 1030 || Number(resTimeNum) > 2130) {
      errors.message.push(
        "The reservation time cannot be before 10:30 AM or after 9:30 PM."
      );
      return next();
    }

    const currentHours = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const currentTime = currentHours
      .toString()
      .concat(currentMinutes.toString());

    if (resDateTimeInMs === currentDateTimeInMs && resTimeNum < currentTime) {
      errors.message.push("The reservation time cannot be in the past.");
      return next();
    }
  }

  return next();
}

function hasPeopleInProperFormat(req, res, next) {
  const people = req.body.data.people;
  const regex = new RegExp(/[^1-6]/);
  if (people && !regex.test(people) && typeof people === "number") {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must indicate the number of people in a party, ranging from 1 to 6."
  );
  return next();
}

function captureValidationErrors(req, res, next) {
  const { errors } = res.locals;
  const uniqueErrorMessages = errors.message.filter((message, index, array) => {
    return array.indexOf(message) === index;
  });
  errors.message = uniqueErrorMessages;

  if (errors.message.length > 1) {
    next(errors);
  } else if (errors.message.length) {
    errors.message = errors.message[0];
    next(errors);
  }

  return next();
}

/**
 * Validation function for the read handler
 */
async function reservationExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with id: ${req.params.reservation_id} does not exist.`,
  });
}

/**
 * Validation function for create and update handlers
 */
function hasValidStatus(req, res, next) {
  const requestedReservationStatus = req.body.data.status;
  if (
    req.method === "POST" &&
    requestedReservationStatus &&
    requestedReservationStatus !== "booked"
  ) {
    next({
      status: 400,
      message: `New reservation cannot have status of ${requestedReservationStatus}.`,
    });
  }
  if (req.method === "PUT") {
    const { reservation } = res.locals;
    const validStatuses = ["booked", "seated", "finished"];
    if (reservation.status === "finished") {
      next({
        status: 400,
        message: `A finished reservation cannot be updated.`,
      });
    }

    if (!validStatuses.includes(requestedReservationStatus)) {
      next({
        status: 400,
        message: `A reservation cannot be updated if it has a status of ${requestedReservationStatus}.`,
      });
    }
  }
  return next();
}

/**
 * Create handler for reservations resources
 */
async function create(req, res, next) {
  const newReservation = {
    ...req.body.data,
    status: "booked",
  };
  const createdReservation = await service.create(newReservation);
  res.status(201).json({
    data: createdReservation,
  });
}

/**
 * Read handler for reservations resources
 */
function read(req, res) {
  res.json({ data: res.locals.reservation });
}

/**
 * Update handler for reservations resources
 */
async function update(req, res) {
  const { reservation } = res.locals;
  const updatedReservation = {
    ...reservation,
    status: req.body.data.status,
  };
  const data = await service.updateReservationStatus(updatedReservation);
  res.json({ data });
}

/**
 * List handler for reservations resources
 */
 async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    const data = await service.listReservationsOnQueriedDate(date);
    res.json({ data });
  } else if (mobile_number) {
    const data = await service.searchReservationByPhone(mobile_number);
    res.json({ data });
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    initializingErrorsObject,
    hasFirstName,
    hasLastName,
    hasMobileNumberInProperFormat,
    hasReservationDateInProperFormat,
    reservationDateNotInPast,
    reservationDateNotATuesday,
    hasReservationTimeInProperFormat,
    hasReservationTimeWithinEligibleTimeframe,
    hasPeopleInProperFormat,
    hasValidStatus,
    captureValidationErrors,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    hasValidStatus,
    asyncErrorBoundary(update),
  ],
};
