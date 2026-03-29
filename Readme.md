# Movie Reservation System User Manual and Operational Guide

This document serves as the formal instruction manual for the Movie Reservation System, a comprehensive platform designed for modern cinema management and customer engagement.

## 1. System Overview

The Movie Reservation System is a sophisticated web application that facilitates seamless movie discovery, seat selection, and ticket reservation. Built with a robust ASP.NET Core backend and a responsive React frontend, it provides specialized interfaces for system administrators, cinema managers, operational staff, and customers.

## 2. Preliminary Requirements

Successful deployment and operation of the system require the following environment configurations:

1.  **Distributed Database**: Docker Desktop must be installed and active to host the PostgreSQL database instance.
2.  **Server Environment**: .NET 8 SDK is required to build and execute the backend services.
3.  **Client Environment**: Node.js and NPM are required for the frontend application development server.

## 3. Installation and Deployment

### 3.1. Database Initialization
1.  Navigate to the `movieReservation.API` directory.
2.  Execute the command: `docker compose up -d postgres`.
3.  The database will be accessible on port 5433.

### 3.2. Backend Service Deployment
1.  From the `movieReservation.API` directory, execute: `dotnet run`.
2.  The service will initialize at `http://localhost:5176`.
3.  Interactive API documentation is available via Swagger at `http://localhost:5176/swagger`.

### 3.3. Frontend Application Deployment
1.  Navigate to the `movie-reservation` directory.
2.  Perform a clean installation of dependencies: `npm install`.
3.  Launch the development server: `npm run dev`.
4.  Access the user interface at the local host URI provided by the terminal (typically `http://localhost:3000` or `5173`).

## 4. Authentication and Access Control

The platform utilizes role-based access control. The following credentials are provided for initial system verification:

### 4.1. System Administrator
-   **Email**: admin@example.com
-   **Password**: admin123
-   **Privileges**: Full access to global settings, staff management, cinema configurations, and film registries.

### 4.2. Cinema Manager
-   **Email**: manager@example.com
-   **Password**: manager123
-   **Privileges**: Management of local cinema layouts and screening schedules.

### 4.3. Standard Customer
-   **Email**: user@example.com
-   **Password**: password123
-   **Privileges**: Film browsing, ticket reservations, and personal profile management.

## 5. Operational Procedures for Customers

### 5.1. Film Discovery
Users may browse the homepage or the dedicated Movies section to view current and upcoming screenings. Selecting a film allows access to detailed descriptions, cast information, and trailers.

### 5.2. Ticket Reservation
1.  Select the desired film and screening time.
2.  Navigate to the interactive seat map to reserve specific positions.
3.  Confirm the selection and finalize the booking.
4.  Digital tickets are accessible via the My Tickets section.

## 6. Administrative Protocols

### 6.1. Personnel Oversight
Administrators may onboard new staff members, assign roles (Manager or Staff), and audit system activity records to ensure operational integrity.

## 7. Troubleshooting and Technical Support

### 7.1. Database Migration Discrepancies
If the system fails to persist configuration changes, verify that the database schema is current. The backend includes automated migration logic; restarting the `dotnet run` service will typically resolve these issues.

### 7.2. Port Conflicts and CORS Policy
If the frontend is moved to a non-standard port, ensure that the backend `Program.cs` file is updated to include the new origin in the Cross-Origin Resource Sharing (CORS) whitelist.

---
End of Document