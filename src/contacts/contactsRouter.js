const express = require("express");
const ContactsController = require("./contactsController");

const router = express.Router();

router.get("/", ContactsController.getContacts);

router.get("/:contactId", ContactsController.getById);

router.post(
  "/",
  ContactsController.validateCreateUser,
  ContactsController.addContact
);

router.delete("/:contactId", ContactsController.deleteById);

router.patch(
  "/:contactId",
  ContactsController.validateUpdateUser,
  ContactsController.updateById
);

module.exports = router;
