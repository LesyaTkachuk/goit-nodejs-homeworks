const Joi = require("joi");
const path = require("path");
const fs = require("fs").promises;
const responseNormalizer = require("../normalizers/responseNormalizer");
const errorNormalizer = require("../normalizers/errorNormalizer");

const contactsPath = path.join(__dirname, "../db", "contacts.json");

class ContactsController {
  get getContacts() {
    return this._getContacts.bind(this);
  }

  get getById() {
    return this._getById.bind(this);
  }

  get addContact() {
    return this._addContact.bind(this);
  }

  get deleteById() {
    return this._deleteById.bind(this);
  }

  get updateById() {
    return this._updateById.bind(this);
  }

  async _getContacts(req, res, next) {
    try {
      const contacts = await this.listContacts(next);

      res.send(contacts);
    } catch (err) {
      next(err);
    }
  }

  async _getById(req, res, next) {
    try {
      const { foundContact } = await this.findContact(
        req.params.contactId,
        res
      );

      if (!foundContact) {
        return;
      }

      return res.send(responseNormalizer(foundContact));
    } catch (err) {
      next(err);
    }
  }

  async _addContact(req, res, next) {
    try {
      const contacts = await this.listContacts(next);
      const id = contacts.length + 1;
      const newContact = { id, ...req.body };
      const newContacts = [...contacts, newContact];

      await fs.writeFile(contactsPath, JSON.stringify(newContacts));

      res.status(201).send(responseNormalizer(newContact));
    } catch (err) {
      next(err);
    }
  }

  async _deleteById(req, res, next) {
    try {
      const { foundContact, id, contacts } = await this.findContact(
        req.params.contactId,
        res
      );

      if (!foundContact) {
        return;
      }

      const newContacts = contacts.filter((contact) => id !== contact.id);

      await fs.writeFile(contactsPath, JSON.stringify(newContacts));

      return res.status(200).send(responseNormalizer("contact deleted"));
    } catch (err) {
      next(err);
    }
  }

  async _updateById(req, res, next) {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send(errorNormalizer("Missing fields"));
    }

    const { foundContact, id, contacts } = await this.findContact(
      req.params.contactId,
      res
    );
    console.log(id);
    if (!foundContact) {
      return;
    }

    const updatedContact = { ...foundContact, ...req.body };
    const nonUpdatedContacts = contacts.filter((contact) => contact.id !== id);
    const newContacts = [...nonUpdatedContacts, updatedContact];

    await fs.writeFile(contactsPath, JSON.stringify(newContacts));

    return res.send(responseNormalizer(updatedContact));
  }

  async listContacts(next) {
    try {
      const unparsedContacts = await fs.readFile(contactsPath, "utf-8");
      const contacts = JSON.parse(unparsedContacts);

      return contacts;
    } catch (err) {
      next(err);
    }
  }

  async findContact(contactId, res, next) {
    try {
      const id = parseInt(contactId, 10);

      const contacts = await this.listContacts(next);

      const foundContact = contacts.find((contact) => id === contact.id);

      if (!foundContact) {
        res.status(404).send(errorNormalizer("Contact not found"));
      }

      return { foundContact, id, contacts };
    } catch (err) {
      next(err);
    }
  }

  validateCreateUser(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    const resultOfValidation = schema.validate(req.body);

    if (resultOfValidation.error) {
      return res.status(400).send(responseNormalizer(resultOfValidation.error));
    }

    next();
  }

  validateUpdateUser(req, res, next) {
    const schema = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });

    const resultOfValidation = schema.validate(req.body);

    if (resultOfValidation.error) {
      return res.status(400).send(responseNormalizer(resultOfValidation.error));
    }

    next();
  }
}

module.exports = new ContactsController();
