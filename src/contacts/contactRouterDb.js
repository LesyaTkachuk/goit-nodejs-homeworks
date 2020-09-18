const express = require('express');
const { ObjectID } = require('mongodb');
const Joi = require('joi');
const connection = require('../db/Connection');
const responseNormalizer = require('../normalizers/responseNormalizer');
const errorNormalizer = require('../normalizers/errorNormalizer');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const contactsCollection = connection.collection;
    const contacts = await contactsCollection.find({}).toArray();

    res.send(responseNormalizer(contacts));
  } catch (err) {
    next(err);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!ObjectID.isValid(contactId)) {
      return res.status(400).send(errorNormalizer('Invalid id'));
    }

    const contactsCollection = connection.collection;
    const foundContact = await contactsCollection.findOne({
      _id: ObjectID(contactId),
    });

    if (!foundContact) {
      return res.status(404).send(errorNormalizer('Contact not found'));
    }

    res.send(responseNormalizer(foundContact));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const resultOfValidation = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      subscription: Joi.string().required(),
      password: Joi.string().required(),
      token: Joi.string(),
    }).validate(req.body);

    if (resultOfValidation.error) {
      return res.status(400).send(errorNormalizer(resultOfValidation.error));
    }

    const { name, email, phone, subscription, password, token } = req.body;
    const contactsCollection = connection.collection;
    const addedContact = await contactsCollection.insertOne({
      name,
      email,
      phone,
      subscription,
      password,
      token,
    });

    return res
      .status(201)
      .send(responseNormalizer('Contact created successfully'));
  } catch (err) {
    next(err);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!ObjectID.isValid(contactId)) {
      return res.status(400).send(errorNormalizer('Invalid id'));
    }

    const resultOfValidation = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string(),
      password: Joi.string(),
      token: Joi.string(),
    }).validate(req.body);

    if (resultOfValidation.error) {
      return res.status(400).send(errorNormalizer(resultOfValidation.error));
    }

    const contactsCollection = connection.collection;
    const updatedContact = await contactsCollection.updateOne(
      { _id: ObjectID(contactId) },
      { $set: req.body },
    );

    if (!updatedContact.modifiedCount) {
      return res
        .status(404)
        .send(errorNormalizer('Contact has already been updated'));
    }

    res.send(responseNormalizer('Contact was updated successfully'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!ObjectID.isValid(contactId)) {
      return res.status(400).send(errorNormalizer('Invalid id'));
    }

    const contactsCollection = connection.collection;
    const deletedContact = await contactsCollection.deleteOne({
      _id: ObjectID(contactId),
    });

    if (!deletedContact.deletedCount) {
      return res.status(404).send(errorNormalizer("Contact doesn't exist"));
    }

    res.send(responseNormalizer('Contact was deleted successfully'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
