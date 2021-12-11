const knex = require("../db/connection");

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function readTable(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

function readReservation(reservation_id) {
    return knex("reservations").select("*").where({ reservation_id }).first();
}

async function updateTableAssignment(table_id, reservation_id) {
  const trx = await knex.transaction();
  let updatedTable = {};
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "seated" }, "*")
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id }, "*")
        .then((results) => (updatedTable = results[0]))
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

async function deleteTableAssignment(table_id, reservation_id) {
  const trx = await knex.transaction();
  let updatedTable = {};
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "finished" })
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id: null }, "*")
        .then((results) => (updatedTable = results[0]))
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

module.exports = {
  create,
  readTable,
  readReservation,
  updateTableAssignment,
  deleteTableAssignment,
  list,
};
