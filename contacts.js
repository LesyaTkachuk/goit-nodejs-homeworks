const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;

const contactsPath = path.join(__dirname, "./db/contacts.json");

function listContacts() {
  fs.readFile(contactsPath, "utf-8")
    .then((resp) => JSON.parse(resp))
    .then((contacts) => console.table(contacts))
    .catch((err) => console.log(err));
}

function getContactById(contactId) {
  fs.readFile(contactsPath, "utf-8")
    .then((resp) => JSON.parse(resp))
    .then((contacts) => contacts.find(({ id }) => id === contactId))
    .then((foundContact) => console.log(foundContact))
    .catch((err) => console.log(err));
}

function removeContact(contactId) {
  fs.readFile(contactsPath, "utf-8")
    .then((resp) => JSON.parse(resp))
    .then((contacts) => contacts.filter(({ id }) => id !== contactId))
    .then((newContacts) =>
      fs.writeFile(contactsPath, JSON.stringify(newContacts))
    )
    .catch((err) => console.log(err));
}

function addContact(name, email, phone) {
  const id = uuidv4();
  const newContact = { id, name, email, phone };

  fs.readFile(contactsPath, "utf-8")
    .then((resp) => JSON.parse(resp))
    .then((contacts) => {
      const newContacts = [...contacts, newContact];
      fs.writeFile(contactsPath, JSON.stringify(newContacts));
    })
    .catch((err) => console.log(err));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
