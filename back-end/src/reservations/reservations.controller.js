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
  if (reservationDate && regex.test(reservationDate)) {
    res.locals.reservationDate = reservationDate;
    return next();
  }
  res.locals.reservationDate = reservationDate;
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_date in this format: MM/DD/YYYY."
  );

  return next();
}

function reservationDateNotInPast(req, res, next) {
  const { reservationDate } = res.locals;

  const date = new Date();
  const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];

  if (reservationDate) {
    const resDateYear = reservationDate.slice(0, 4);
    const resDateMonth = reservationDate.slice(5, 7);
    const resDateDay = reservationDate.slice(8);

    if (
      resDateYear < year ||
      (resDateYear === year && resDateMonth < month) ||
      (resDateYear === year && resDateMonth === month && resDateDay < day)
    ) {
      const { errors } = res.locals;
      errors.message.push(
        "Reservations cannot be made in the past. Only future reservations are allowed."
      );
      return next();
    }
  }
  return next();
}

function reservationDateNotATuesday(req, res, next) {
  const { reservationDate } = res.locals;
  if (reservationDate) {
    const resDateYear = reservationDate.slice(0, 4);
    const resDateMonth = reservationDate.slice(5, 7) - 1;
    const resDateDay = reservationDate.slice(8);
    const resDateDayOfWeek = new Date(resDateYear, resDateMonth, resDateDay)
      .toDateString()
      .slice(0, 3);
    if (resDateDayOfWeek === "Tue") {
      const { errors } = res.locals;
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
  if (reservationTime && regex.test(reservationTime)) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_time in this format: HH:MM."
  );
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
    initializingErrorsObject,
    hasFirstName,
    hasLastName,
    hasMobileNumberInProperFormat,
    hasReservationDateInProperFormat,
    reservationDateNotInPast,
    reservationDateNotATuesday,
    hasReservationTimeInProperFormat,
    hasPeopleInProperFormat,
    captureValidationErrors,
    asyncErrorBoundary(create),
  ],
};
