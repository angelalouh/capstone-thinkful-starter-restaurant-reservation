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
  const { reservationDate } = res.locals;

  const date = new Date();
  const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];

  if (reservationDate) {
    const resDateYear = Number(reservationDate.slice(0, 4));
    const resDateMonth = Number(reservationDate.slice(5, 7));
    const resDateDay = Number(reservationDate.slice(8));
    res.locals.resDateObject = {
      year: resDateYear,
      month: resDateMonth,
      day: resDateDay,
    };

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
    const { resDateObject } = res.locals;
    const resDateDayOfWeek = new Date(
      resDateObject.year,
      resDateObject.month - 1,
      resDateObject.day
    )
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
  const { reservationTime } = res.locals;
  const { errors } = res.locals;
  const resTimeNum = reservationTime.replace(":", "");

  if (Number(resTimeNum) < 1030 || Number(resTimeNum) > 2130) {
    errors.message.push(
      "The reservation time cannot be before 10:30 AM or after 9:30 PM."
    );
    return next();
  }

  const currentHours = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const resTimeHours = Number(resTimeNum.slice(0, 2));
  const resTimeMinutes = Number(resTimeNum.slice(2, 4));

  if (
    resTimeHours < currentHours ||
    (resTimeHours === currentHours && resTimeMinutes < currentMinutes)
  ) {
    errors.message.push("The reservation time cannot be in the past.");
    return next();
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
    hasReservationTimeWithinEligibleTimeframe,
    hasPeopleInProperFormat,
    captureValidationErrors,
    asyncErrorBoundary(create),
  ],
};
