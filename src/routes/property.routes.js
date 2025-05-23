const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const verifyJWT = require('../middleware/auth'); // assuming JWT middleware

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.get('/filter/search', propertyController.filterProperties);
router.post('/favourite', verifyJWT, propertyController.addToFavourites);
router.get('/get/favourite', verifyJWT, propertyController.getFavourites);
router.delete('/favourite', verifyJWT, propertyController.removeFromFavourites);

module.exports = router;
