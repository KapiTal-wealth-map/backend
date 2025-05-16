const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.get('/filter/search', propertyController.filterProperties);

module.exports = router;
