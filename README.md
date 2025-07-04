# KapiTal - Wealth Map Backend Repo

## Project Overview

The Wealth Map application is a real estate data visualization platform that helps company employees identify property ownership patterns and wealth concentration across the regions of the United States of America. The platform contains an intuitive interactive map interface that reveals patterns of wealth distribution combining ownership information and property data gathered from a combination of:
- **OpenAddresses**: The free and open global address collection
- **Zillow Research Data**:
  - Zillow Home Value Index (ZHVI)
  - Market Heat Index
- **American Housing Prices**: Dataset from Kaggle containing:
  - Property information
  - Median Household Income

## Live Demo
Experience the application live: [Click Here To Redirect To The Application](https://frontend-peach-three-65.vercel.app)

## Main Functionality

### 1. Interactive Map Interface

- **Real-time property visualization** with color-coded markers indicating property values
- **Heat map overlay** showing wealth concentration by area
- **Layered visualization** allowing users to toggle between different data views (property value, ownership concentration, etc.)
- **Smooth zoom and pan** functionality with clustering for better performance
- **Save and load map views** Users can save favorite properties, map views, searches and share with team members or keep it personal to the user

### 2. Property Information Display

- **Detailed property cards** showing key information (address, size, value, zoning)
- **Valuation trends** with interactive charts

### 3. Region-Specific Trend Analysis

- Display trend lines with selectable time periods and comparison capabilities
- Offer downloadable region-specific reports analysis


### 4. Advanced Search & Filtering

- **Multi-criteria search** by location, property characteristics, owner information
- **Price range filters** with customizable parameters

### 5. Data Export & Reporting

- **Custom report builder** with selectable data points
- **Export options** (PDF, CSV, Excel)

### 6. User Management

- **User registration and MFA with with email or TOTP options**
- **Saved searches and favorites**
- **Customizable dashboard**
- **Admins can view employee activity and usage statistics**
- **Admins can invite employees via email**

## Repositories Structure

We are developing this project as two separate repositories:

- **Frontend Repository**: All client-side code (UI, map, user flows)
- **Backend Repository**: All server-side code (APIs, data processing, integration) 

Can access the frontend repo here: https://github.com/KapiTal-wealth-map/frontend

## Backend Repo
Modular Monolith (microservice-ready) design with clearly separated concerns across controllers, services, models, and routes. This architecture enables future scaling while maintaining development simplicity
- **Technology Stack**   
The backend of Wealth Map is built using the following technologies:
    - **Core**: Node.js with Express.js
    - **Database**: PostgreSQL with PostGIS extension for geospatial queries
    - **ORM**: Prisma for type-safe database access and migrations
    - **Caching**: Redis (Upstash)
    - **Authentication**: OAuth 2.0 + custom MFA with email or TOTP options

- **Repo Structure**

```
/backend
|--/prisma             # Prisma schema & migrations
|--/scripts            # Data ingestion & utilities
|--/src
|   |--/conifg         # Configuration files (env, DB)
|   |--/controllers    # Request and Response handling
|   |--/middleware    # Auth, logging, error handling
|   |--/routes         # API endpoints
|   |--/services       # Business logic
|   |   |--activity.service.js
|   |   |--auth.service.js
|   |   |--property.service.js
|   |   |--user.service.js
|   |--/utils          # Helper functions
|   |--app.js          # Initializes the Express app and middleware
|   |--server.js          # Entry point that starts the server
|--package.json # Project metadata and dependencies
```


## Getting Started
To set up the project locally, follow these steps: 

1. Clone the repository
   ```
   git clone https://github.com/KapiTal-wealth-map/backend.git
   cd backend/
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up your own environment variables in a `.env` file in the directory with the following names:
   ```
   PORT=
   DATABASE_URL=
   JWT_SECRET=
   REDIS_URL=
   REDIS_TOKEN=
   EMAIL_FROM=
   EMAIL_PASS=
   FRONTEND_DEV_URL=
   ```

4. Run the migrations to set up the database schema
     ```
     npx prisma migrate dev --name init
     ```

5. Start server
   ```
   npm run dev
   ```

5. If no port is specified then server runs default on to `http://localhost:5000`


## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.

2. Create a new branch for your feature or bugfix:
   ```
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:
   ```
   git commit -m "Add your message here"
   ```

4. Push to your fork:
   ```
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request and describe your changes.

## License

This project is licensed under the MIT License

## Acknowledgments

- Data providers for real estate and ownership information
- Open source community for the amazing tools and libraries.

## Contact
If you have any questions or would like to collaborate, please don't hesitate to reach out to us.

Kaushik Sai Mamidi : kaushiksaimamidi@gmail.com

Lalitha Taruna Mulugur : t.mulugur@gmail.com