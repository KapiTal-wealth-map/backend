const propertyService = require('../services/property.services');
const sendEmail = require('../utils/sendEmail');
const { FRONTEND_DEV_URL } = require('../config/env');

exports.getAllProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await propertyService.getAllProperties(page, limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getPropertyById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const property = await propertyService.getPropertyById(id);
    if (!property) return res.status(404).json({ error: 'Property not founddd' });
    res.json(property);
  } catch (error) {
    next(error);
  }
};

exports.filterProperties = async (req, res, next) => {
  const filters = req.query;
  try {
    const properties = await propertyService.filterProperties(filters);
    res.json(properties);
  } catch (error) {
    next(error);
  }
};

exports.addToFavourites = async (req, res, next) => {
  const { propertyIds } = req.body;
  const userId = req.user.id; // Assuming user ID is available in req.User
  try {
    const favourite = await propertyService.addToFavourites(userId, propertyIds);
    res.status(201).json(favourite);
  } catch (error) {
    next(error);
  }
}
exports.getFavourites = async (req, res, next) => {
  const userId = req.user.id; // Assuming user ID is available in req.User
  try {
    const favourites = await propertyService.getFavourites(userId);
    res.status(200).json(favourites,);
  } catch (error) {
    next(error);
  }
};
exports.removeFromFavourites = async (req, res, next) => {
  const { propertyIds } = req.body;
  const userId = req.user.id; // Assuming user ID is available in req.User
  try {
    const result = await propertyService.removeFromFavourites(userId, propertyIds);
    if (!result) return res.status(404).json({ error: 'Favourite not found' });
    res.status(200).json({ message: 'Favourite removed successfully' });
  } catch (error) {
    next(error);
  }
};


exports.createSavedMapView = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const savedView = await propertyService.createSavedMapView(data, userId);
    res.status(201).json(savedView);
  } catch (err) {
    next(err);
  }
}

exports.getSavedMapViews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    const savedViews = await propertyService.getSavedMapViewsForUser(userId, companyId);
    res.json(savedViews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

exports.deleteSavedMapView = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    await propertyService.deleteSavedMapView(id, userId);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: err.message });
  }
}