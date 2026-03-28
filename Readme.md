# Movie Reservation System - Technical Documentation and Operation Guide

This document provides comprehensive instructions for the installation, configuration, and maintenance of the Movie Reservation System.

---

## 1. System Installation and Initialization

The system architecture consists of two primary components: the Backend (ASP.NET API) and the Frontend (Vite + React).

### 1.1. Database Configuration (Docker)
The local environment requires Docker Desktop to be installed and active.
1. Open the terminal within the following directory: `movie/movieReservation.API`.
2. Execute the command: `docker compose up -d postgres`.
3. Connectivity: The database is configured to operate on port 5433.

### 1.2. Backend Service Initialization (API)
The environment requires the .NET 8 SDK.
1. Open the project in JetBrains Rider or Visual Studio Code.
2. Execute the application via the IDE or the terminal command: `dotnet run`.
3. Base URL: `http://localhost:5176`.
4. API Documentation (Swagger): `http://localhost:5176/swagger`.

### 1.3. Frontend Application Initialization
The environment requires Node.js.
1. Navigate to the following directory: `movie/movie-reservation`.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.
4. Access URL: `http://localhost:5173`.

---

## 2. Pre-configured Administrative Credentials

The system includes seeded accounts for development and testing purposes:

| Role | Email | Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| Admin | admin@example.com | admin123 | Management of films, theaters, and email services. |
| Manager | manager@example.com | manager123 | Management of theaters and screening schedules. |
| Customer | user@example.com | password123 | Ticket reservations and booking history access. |

---

## 3. SMTP Email Configuration

Administrative users must configure SMTP settings to enable automated welcome messages and ticket confirmations:
1. Authenticate with an Admin account.
2. Navigate to Settings > Email Configuration.
3. Input the following parameters:
    - SMTP Host: `smtp.gmail.com`
    - Port: `587`
    - Username: Authorized Gmail address.
    - Password: 16-character Google App Password.
    - From Email/Name: Designated sender identity.
4. Set the Status toggle to Enabled.
5. Select Save All Settings.

---

## 4. Dynamic Email Template Management

The system supports real-time modification of email content via the administrative interface without requiring source code changes.

### 4.1. Placeholders (Dynamic Variables)
The following variables are supported within the templates for automated data injection:
- `{{name}}`: Recipient name.
- `{{movieTitle}}`: Reserved film title.
- `{{seats}}`: Seat designations (e.g., A1, A2).
- `{{totalPrice}}`: Aggregate reservation cost.
- `{{bookingId}}`: Unique reservation identifier (utilized for QR Code generation).

### 4.2. Modification Procedure
1. Extract the HTML content from the `email_templates.md` file.
2. Insert the code into the Welcome Email or Booking Email editor.
3. Commit changes by selecting Save.

---

## 5. Troubleshooting and Maintenance

### 5.1. Error: "Fail to save settings"
- Root Cause: Potential schema mismatch between the current database and new configuration columns (e.g., WelcomeEmailSubject).
- Resolution: The system utilizes a self-healing mechanism in `Program.cs`. Restarting the API service will trigger an automatic database migration to resolve schema discrepancies.

### 5.2. Issue: Email Delivery Failure
- Verify the accuracy of the Google App Password.
- Ensure the Enabled status is active in the Email Configuration settings.
- Inspect the recipient's spam folder.

### 5.3. Error: CORS (Cross-Origin Resource Sharing)
- If the Frontend port is modified (e.g., to port 3001), the new origin must be explicitly added to the `WithOrigins` list within the Backend `Program.cs` file.

---
End of Document