# SmartProp Manager

SmartProp Manager is a full stack property management application for landlords and tenants.

The system helps landlords manage rental apartments and helps tenants track electricity meter readings, monthly utility payments, payment history, and consumption statistics.

---

## Demo / Preview

This project uses private external services, including a MySQL database and Google Vision API.  
Because of that, running the full version locally requires private credentials that are not included in this public repository.

For reviewers, the recommended way to understand the product is through the project flow, code structure, and demo assets.

> Demo video: https://drive.google.com/file/d/1_JmTgizIruw3oaLow01L87LbCYV0IlXV/view?usp=sharing

### Tenant Side
- View apartments assigned to the tenant
- Upload an electricity meter image and extract the reading automatically using Google Vision API
- Enter meter readings manually when needed
- Track monthly electricity usage and payment history
- View payment status: pending meter upload, pending landlord approval, or paid
- View charts for electricity usage and monthly payments
- Export payment history to Excel

### Landlord Side
- Manage rental apartments
- Add, update, delete, rent, or vacate apartments
- Assign tenants to apartments
- Update electricity price per kWh
- Set bank transfer and Bit payment details
- Review and approve pending tenant payments
- View dashboard statistics and apartment-level payment history
- Export payment reports to Excel

### Electricity & Payment Flow
- Meter readings can be submitted manually or extracted from an uploaded image using Google Vision API OCR
- The backend calculates electricity consumption based on the previous and current meter readings
- The cost is calculated using the landlord's configured electricity rate
- New payment records are saved as pending until approved by the landlord

> Online payment redirection is planned for a future version.  
> The current version focuses on calculation, tracking, and landlord approval.

---

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Google Vision API / OCR
- Maven
- Lombok

### Frontend
- React
- Axios
- Material UI
- Chart.js
- React Chart.js 2
- Formik + Yup
- XLSX export

---

## Backend API Overview

| Area | Description |
| --- | --- |
| `/api/auth` | Login and registration for tenants and landlords |
| `/api/tenants` | Tenant management |
| `/api/landlords` | Landlord data and payment details |
| `/api/properties` | Apartment CRUD, tenant assignment, and vacancy management |
| `/api/electricity` | Meter reading calculation, image-based OCR calculation, and electricity rate settings |
| `/api/payments` | Payment history, pending payments, and landlord approval |

---

## Final Project Structure

The final version of the project is intended to be organized under the `main` branch:

```text
SmartProp-Manager
├── README.md
├── backend/
│   └── SmartProp/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/example/SmartProp/
│       │       │       ├── controller/
│       │       │       ├── model/
│       │       │       ├── repository/
│       │       │       └── service/
│       │       └── resources/
│       └── pom.xml
│
├── frontend/
│   └── rent-meter/
│       ├── src/
│       │   ├── components/
│       │   └── App.js
│       └── package.json
│
└── docs/
    └── screenshots/
```

### Folder Overview

- `backend/` – Contains the server-side application, including REST APIs, database logic, electricity calculations, payment management, and Google Vision API integration.
- `backend/SmartProp/` – Main Spring Boot application folder with controllers, models, repositories, services, Maven configuration, and backend resources.
- `frontend/` – Contains the client-side application for tenant and landlord screens, dashboards, charts, forms, and API communication.
- `frontend/rent-meter/` – Main React application folder with components, dependencies, scripts, and client-side logic.
- `docs/screenshots/` – Optional folder for demo screenshots used by reviewers to understand the application without running it locally.

---

## Branches

The repository also includes separate development branches:

| Branch | Purpose |
| --- | --- |
| `backend-logic` | Used for backend development, including Spring Boot logic, REST APIs, database models, payment flow, and OCR integration |
| `frontend` | Used for frontend development, including React screens, dashboards, charts, forms, and API calls |
| `main` | Intended to contain the final organized version of the project with both backend and frontend folders |

These branches were used to support an organized development workflow between different parts of the project before merging the final code into `main`.

---

## Running Locally

Running the full project locally is optional and requires private configuration.

### Backend Requirements
- Java 17
- Maven
- MySQL
- Google Vision API key

### Frontend Requirements
- Node.js
- npm

### Run Backend

```bash
cd backend/SmartProp
mvn spring-boot:run
```

Backend local URL:

```text
http://localhost:8081
```

### Run Frontend

```bash
cd frontend/rent-meter
npm install
npm start
```

Frontend local URL:

```text
http://localhost:3000
```

Frontend dependencies such as React, Axios, Material UI, Chart.js, Formik, Yup, and XLSX are installed automatically using `npm install`.

---

## Development Notes

- The frontend currently communicates with the backend using local API URLs.
- The backend stores landlords, tenants, apartments, and payments in MySQL.
- OCR is handled through Google Vision API and is used to extract meter readings from uploaded images.
- Payment records are stored first as pending and become approved only after landlord confirmation.
- Sensitive credentials should not be committed to GitHub.
- The project is still under development, with future plans for direct online payment integration.

---

## Future Improvements

- Add real online payment redirection
- Improve authentication and authorization
- Add stronger validation and error handling
- Add deployment configuration
- Add automated tests
- Improve mobile responsiveness
- Add richer reports for gas, electricity, and other utilities

---

## Author

Developed as a full-stack smart property management project.
