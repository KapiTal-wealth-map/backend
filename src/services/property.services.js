const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { normalizeProperty } = require('../utils/BigInt');

exports.getAllProperties = async (page, limit) => {
  const skip = (page - 1) * limit;
  const properties = await prisma.property_1.findMany({
    skip,
    take: limit,
    include: {
      Owner: true, // Include owner details
    }
  });
  return properties.map(normalizeProperty);
};

exports.getPropertyById = async (id) => {
  const property = await prisma.property_1.findUnique({
    where: { id } ,
    include: {
      Owner: true, // Include owner details
    }
  });
  if (!property) {
    throw new AppError('Property not found', 404);
  }
  return normalizeProperty(property);
};

exports.filterProperties = async (filters) => {
  const {
    minPrice, maxPrice,
    minBeds, maxBeds,
    minBaths, maxBaths,
    zip
  } = filters;

  const where = {};

  if (zip) where.zip = zip;
  if (minPrice || maxPrice) where.price = { gte: parseFloat(minPrice) || 0, lte: parseFloat(maxPrice) || Number.MAX_VALUE };
  if (minBeds || maxBeds) where.beds = { gte: parseInt(minBeds) || 0, lte: parseInt(maxBeds) || 100 };
  if (minBaths || maxBaths) where.baths = { gte: parseInt(minBaths) || 0, lte: parseInt(maxBaths) || 100 };

  const properties = await prisma.property_1.findMany({
    where,
    include: {
      Owner: true, // Include owner details
    }
  });
  const normalizedProperties = properties.map(normalizeProperty);
  return properties.map(normalizeProperty);
};

exports.addToFavourites = async (userId, propertyIds) => {
  const existingFavourites = await prisma.favoriteListing.findMany({
    where: {
      userId,
      propertyId: { in: propertyIds }
    }
  });
  if (existingFavourites.length > 0) {
    throw new AppError('Some properties are already in your favourites', 400);
  }
  const favourites = await prisma.favoriteListing.createMany({
    data: propertyIds.map(propertyId => ({
      userId,
      propertyId
    }))
  });
  return favourites;
};

exports.getFavourites = async (userId) => {
  const favourites = await prisma.favoriteListing.findMany({
    where: { userId },
    include: { property: true }
  });
  return favourites;
};

exports.removeFromFavourites = async (userId, propertyIds) => {
  return await prisma.favoriteListing.deleteMany({
    where: {
      userId,
      propertyId: { in: propertyIds }
    }
  });
}


exports.createSavedMapView = async (data, userId) => {
  const {
    name,
    centerLat,
    centerLng,
    zoom,
    filters,
    showProperties,
    showHeatmap,
    showClusters,
    scope,
    sharedUserIds = [],
  } = data;

  // Create the saved view
  const savedMapView = await prisma.savedMapView.create({
    data: {
      name,
      centerLat,
      centerLng,
      zoom,
      filters,
      showProperties,
      showHeatmap,
      showClusters,
      scope,
      userId,
      sharedWith: {
        create: sharedUserIds.map(userId => ({ userId })),
      },
    },
    include: {
      sharedWith: true,
      user: true, // Include the user who created the view
    },
  });

  return savedMapView;
}

exports.getSavedMapViewsForUser = async (userId, companyId) => {
  // User can see:
  // - their own saved views
  // - shared views where they are in sharedWith
  // - company-wide views for their company
  return await prisma.savedMapView.findMany({
    where: {
      OR: [
        { userId: userId },
        {
          scope: 'shared',
          sharedWith: { some: { userId } },
        },
        {
          scope: 'company',
          user: { companyId }, // assumes User has companyId
        },
      ],
    },
    include: {
      sharedWith: true,
      user: true,
    },
  });
}

exports.deleteSavedMapView = async (id, userId) => {
  // Only owner can delete
  const savedMapView = await prisma.savedMapView.findUnique({
    where: { id },
  });

  if (!savedMapView || savedMapView.userId !== userId) {
    throw new Error('Not authorized');
  }

  await prisma.savedMapView.delete({ where: { id } });
}

