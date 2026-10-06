# PawFit

**Dog apparel that fits real measurements.**

PawFit is a thesis e-commerce application for dog apparel and accessories. It combines browsing, measurement-based sizing, and an interactive 3D virtual fitting preview. Checkout is a demonstration simulation; no real payments are processed.

## Live Site and Screenshots

- Live site: **https://pawfit-shop.vercel.app/**
- Home: ``
- Product page: ``

## Features

### Shoppers
- Browse products and color options.
- Save pet profiles with breed, neck girth, chest girth, and back length.
- Receive a size recommendation and 3D virtual fitting preview.
- Use the cart, simulated checkout, order history, and My Account.

### Admins
- Use the Add Product wizard for basics, colors, inventory, sizing, 3D models, and review.
- Manage categories, per-color GLB uploads, up to three product images, and orders through Processing.

### Super Admin
- Review statistics, accounts, products, orders, categories, audit history, and store settings.
- Add admins, manage user/admin roles and account activation, complete orders, and transfer ownership.

## Size Recommendation

Sizing uses the pet's actual measurements, not breed. Each product defines minimum and maximum neck girth, chest girth, and back length for every size; a recommendation is made only when all three measurements are in range. Breed only selects the 3D model. If a breed model is unavailable, a general reference model is shown and sizing still works. Stock is separate: an unavailable size can still be recommended.

## Supported 3D Breeds

The account interface and repository model assets currently support exactly four breeds:

- Labrador Retriever
- Dachshund
- Pomeranian
- Aspin / Mixed breed

## Roles and Access

| Role | Access |
| --- | --- |
| `user` | Storefront, pet profiles, cart, checkout, and account history. |
| `admin` | `/admin` product, inventory, category, 3D model, and order management. |
| `superadmin` | `/superadmin` owner controls plus store management. |

There is exactly one superadmin account. There is no public navigation link to Super Admin; role-based redirection happens through the normal sign-in page.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| 3D preview | Three.js, React Three Fiber, drei |
| Backend | Node.js, Express |
| Database | MongoDB Atlas through Mongoose |
| Media | Cloudinary |

## Project Structure

```text
frontend/                 React and Vite client
  src/                    Pages, components, contexts, API client, styles
  public/                 Public browser assets
  vercel.json             Vercel SPA rewrite configuration
backend/                  Express API
  src/models/             Mongoose models
  src/controllers/        Request handlers
  src/routes/             API routes
  src/middleware/         Authentication and upload middleware
  src/uploads/            Local GLB model assets and uploads
```

## Getting Started

### Prerequisites

- Node.js and npm. The repository does not declare a required Node version.
- MongoDB Atlas connection.
- Cloudinary account and credentials.

### Install

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and use placeholder-free credentials.

| Variable | Purpose | Example placeholder |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://USER:PASSWORD@CLUSTER/pawfit` |
| `JWT_SECRET` | Authentication token secret | `replace-with-a-long-random-secret` |
| `PORT` | API port; defaults to 5000 | `5000` |
| `CLIENT_URL` | Additional allowed browser origins | `https://your-frontend.example` |
| `NODE_ENV` | Runtime environment | `development` |
| `FLAT_SHIPPING_FEE` | Simulated shipping fee; defaults to 100 | `100` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `SUPERADMIN_EMAIL` | Owner seed email | `owner@example.com` |
| `SUPERADMIN_PASSWORD` | Owner seed password | `replace-with-a-strong-password` |
| `VITE_API_URL` | Optional frontend API base URL; defaults to `/api` | `https://your-api.example/api` |

### Development

From `backend`:

```bash
npm run dev
```

From `frontend`:

```bash
npm run dev
```

The API defaults to port 5000. Vite uses its configured local development port.

### Production Build

From `frontend`:

```bash
npm run build
```

## Super Admin Setup

For older installations, run this from `backend`:

```bash
npm run migrate:roles
```

Set `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` in `backend/.env`, then run once:

```bash
npm run seed:superadmin
```

The script creates the first owner only when one does not exist. Sign in normally to be redirected to `/superadmin`. Ownership can be transferred to an active admin in Settings while the one-owner rule remains enforced.

## Available npm Scripts

### Backend

| Script | Command | Purpose |
| --- | --- | --- |
| `start` | `node src/server.js` | Start the API. |
| `dev` | `nodemon src/server.js` | Start the API with file watching. |
| `test` | `echo "Error: no test specified" && exit 1` | Current placeholder test script. |
| `seed-admin` | `node src/adminSeed.js` | Existing admin seed script. |
| `seed:superadmin` | `node src/superadminSeed.js` | Create the first superadmin. |
| `migrate:roles` | `node src/migrateRoles.js` | Migrate legacy roles. |

### Frontend

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Start the development server. |
| `build` | `vite build` | Create a production build. |

## Deployment Notes

The frontend includes Vercel SPA rewrite configuration. Set environment variables on each host. Run `npm run seed:superadmin` against the intended production database only when needed. The repository does not include a backend host configuration.

## Scope and Limitations

- Checkout is a simulation; no payment gateway is integrated.
- Delivery is marked manually by the Super Admin; there is no logistics partner integration.

## Acknowledgements

PawFit is a thesis project at Mapúa University by Cordero, Zamoras, and Javier, under the guidance of Antoinette Gabriel.
