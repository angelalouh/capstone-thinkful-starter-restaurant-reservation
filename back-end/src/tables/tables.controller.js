const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Validation function for the create handler:
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

function hasTableName(req, res, next) {
  const tableName = req.body.data.table_name;
  res.locals.tableName = tableName;
  if (tableName) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("New table must be given a table_name.");
  return next();
}

function tableNameAtLeastTwoCharLong(req, res, next) {
  const { tableName, errors } = res.locals;
  if (tableName) {
    if (tableName.length >= 2) {
      return next();
    }
    errors.message.push("The table_name must be at least 2 characters long.");
  }
  return next();
}

async function tableNameIsNew(req, res, next) {
  const { tableName, errors } = res.locals;
  const existingTables = await service.list();
  const tableNameExistsAlready = existingTables.find(
    (table) => table.table_name === tableName
  );

  if (tableNameExistsAlready) {
    errors.message.push(
      "This table name exists already. Please choose a new one."
    );
    return next();
  }
  return next();
}

function hasCapacityInProperFormat(req, res, next) {
  const capacity = req.body.data.capacity;
  if (capacity && typeof capacity === "number" && capacity >= 1) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("New table capacity must be at least 1.");
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
 * Validation functions for the update and delete handlers:
 */
async function tableExists(req, res, next) {
  const table = await service.readTable(req.params.table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with id: ${req.params.table_id} does not exist.`,
  });
}

function tableIsNotOccupied(req, res, next) {
  const { table } = res.locals;
  if (table && table.reservation_id) {
    if (req.method === "DELETE") {
      return next();
    }

    if (req.method === "PUT") {
      next({
        status: 400,
        message: `Table ${table.table_name} is currently occupied.`,
      });
    }
  }

  if (req.method === "DELETE") {
    next({
      status: 400,
      message: "Table is currently not occupied.",
    });
  }

  if (req.method === "PUT") {
    return next();
  }
}

/**
 * Validation functions for update handler:
 */
function hasReservationId(req, res, next) {
  const { reservation_id } = req.body.data;
  if (reservation_id) {
    res.locals.reservationId = reservation_id;
    return next();
  }
  next({
    status: 400,
    message: "The reservation_id is missing from the request body.",
  });
}

async function reservationExists(req, res, next) {
  const { reservationId } = res.locals;
  const reservation = await service.readReservation(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with id: ${reservationId} does not exist.`,
  });
}

function reservationHasNotBeenSeated(req, res, next) {
  const { reservation, reservationId } = res.locals;
  if (reservation && reservationId && reservation.status === "seated") {
    next({
      status: 400,
      message: `Reservation ${reservationId} has already been seated.`,
    });
  }
  return next();
}

function tableHasCapacityForReservation(req, res, next) {
  const { table, reservation } = res.locals;
  if (table && reservation && table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `This table does not have sufficient capacity for this reservation (party of ${reservation.people}).`,
  });
}

/**
 * Create handler for tables resources
 */

async function create(req, res) {
  const newTable = await service.create(req.body.data);
  res.status(201).json({
    data: newTable,
  });
}

/**
 * Update handler for tables resources
 */
async function update(req, res) {
  const { table_id } = res.locals.table;
  const { reservation_id } = req.body.data;
  const data = await service.updateTableAssignment(table_id, reservation_id);
  res.json({ data });
}

/**
 * Delete handler for tables resources
 */

async function destroy(req, res) {
  const { table_id, reservation_id } = res.locals.table;
  const data = await service.deleteTableAssignment(table_id, reservation_id);
  res.json({ data });
}

/**
 * List handler for tables resources
 */
async function list(req, res) {
  res.json({ data: await service.list() });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    initializingErrorsObject,
    hasTableName,
    tableNameAtLeastTwoCharLong,
    asyncErrorBoundary(tableNameIsNew),
    hasCapacityInProperFormat,
    captureValidationErrors,
    asyncErrorBoundary(create),
  ],
  update: [
    hasData,
    asyncErrorBoundary(tableExists),
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    reservationHasNotBeenSeated,
    tableHasCapacityForReservation,
    tableIsNotOccupied,
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(tableExists),
    tableIsNotOccupied,
    asyncErrorBoundary(destroy),
  ],
};
