const express = require("express");
const {
  Types: { ObjectId },
} = require("mongoose");
const Joi = require("joi");
const connection = require("../db/Connection");
const responseNormalizer = require("../normalizers/responseNormalizer");
const errorNormalizer = require("../normalizers/errorNormalizer");
const contactModel = require("./contactModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactModel.find();

    res.send(responseNormalizer(contacts));
  } catch (err) {
    next(err);
  }
});

router.get("/:contactId", validateId, async (req, res, next) => {
  try {
    const foundContact = await contactModel.findById(req.params.contactId);

    if (!foundContact) {
      return res.status(404).send(errorNormalizer("Contact not found"));
    }

    res.send(responseNormalizer(foundContact));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const createdContact = await contactModel.create(req.body);

    return res
      .status(201)
      .send(responseNormalizer("Contact created successfully"));
  } catch (err) {
    next(err);
  }
});

router.put("/:contactId", validateId, async (req, res, next) => {
  try {
    const updatedContact = await contactModel.findByIdAndUpdate(
      req.params.contactId,
      {
        $set: req.body,
      },
      { strict: true, new: true }
    );

    if (!updatedContact) {
      return res.status(404).send(errorNormalizer("Contact was not found"));
    }

    res.send(responseNormalizer("Contact was updated successfully"));
  } catch (err) {
    next(err);
  }
});

router.delete("/:contactId", validateId, async (req, res, next) => {
  try {
    const deletedContact = await contactModel.findByIdAndDelete(
      req.params.contactId
    );

    if (!deletedContact) {
      return res.status(404).send(errorNormalizer("Contact was not found"));
    }

    res.send(responseNormalizer("Contact was deleted successfully"));
  } catch (err) {
    next(err);
  }
});

function validateId(req, res, next) {
  const { contactId } = req.params;

  if (!ObjectId.isValid(contactId)) {
    return res.status(400).send(errorNormalizer("Invalid id"));
  }
  next();
}

module.exports = router;
