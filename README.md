# ServiceLink

ServiceLink is a comprehensive platform designed to connect service providers with customers seamlessly. It streamlines the process of finding, booking, and managing services, making it an essential tool for modern businesses and consumers.

## Features

- **User Authentication**: Secure login and registration system.
- **Service Marketplace**: Browse and search for various services.
- **Booking Management**: Schedule and track service appointments.
- **User Profiles**: Dedicated profiles for both service providers and customers.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

### Backend

- **Java 21**
- **Spring Boot 4.0.4**
- **Spring Data JPA**
- **MySQL**
- **Spring Security**

### Frontend

- **Next.js**
- **React**
- **Tailwind CSS**

## Getting Started

### Prerequisites

- Java 21 or higher
- Node.js 18 or higher
- MySQL Server

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ServiceLink
   ```

2. **Backend Setup**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Configure your MySQL database in `src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/servicelink
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```
   - Run the backend:
     ```bash
     mvn spring-boot:run
     ```

3. **Frontend Setup**
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run the frontend:
     ```bash
     npm run dev
     ```

## Usage

Once both the backend and frontend are running:

- Open your browser and navigate to `http://localhost:3000`
- Register a new account or log in with existing credentials
- Explore the marketplace and find services
- Book appointments and manage your schedule

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
