const propertyService = require('../services/property.services');

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
    if (!property) return res.status(404).json({ error: 'Property not found' });
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
