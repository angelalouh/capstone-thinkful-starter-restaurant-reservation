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

function update(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

module.exports = {
  create,
  readTable,
  readReservation,
  update,
  list,
};
