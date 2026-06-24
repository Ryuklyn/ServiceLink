# ServiceLink 🔗

ServiceLink is a hybrid **C2C and B2B on-demand service marketplace** built for Nepal.

Individual users can discover and book verified local service providers by time slot. **ServiceLink Pro** provides an enterprise tier for hotels, hospitals, and businesses to source and manage service providers in bulk — making it a complete solution for both everyday consumers and organizations.

---

## 🚀 Key Features

### Core Platform (C2C)
- **WhatsApp OTP Verification** — Twilio Sandbox integration for secure user authentication via WhatsApp
- **Dual Payment Gateway** — eSewa and Khalti integration for seamless Nepal-local transactions
- **Time-Slot Booking** — Providers operate as freelancers, accepting bookings based on availability
- **Role-Based Access Control** — Separate flows and permissions for customers, providers, and admins
- **JWT Authentication** — Secure stateless authentication across all endpoints
- **Media Upload Pipeline** — Supabase Storage for provider profile images/videos, stored as URLs in MySQL
- **SMTP Email Notifications** — Booking confirmations, status updates, and alerts
- **WhatsApp Deep-Link (wa.me)** — Direct communication between users and providers

### ServiceLink Pro (B2B)
- **Enterprise Tier** — Dedicated portal for hotels, hospitals, and businesses
- **Bulk Service Sourcing** — Organizations can request and manage multiple providers simultaneously
- **Business Dashboard** — Manage provider relationships, bookings, and service history at scale

---

## 🛠 Tech Stack

### Backend
- **Java 21**
- **Spring Boot**
- **Spring Security + JWT**
- **Spring Data JPA / Hibernate**
- **MySQL**
- **Twilio (WhatsApp OTP)**
- **JavaMail (SMTP)**

### Frontend
- **Next.js**
- **React**
- **Tailwind CSS**
- **TypeScript**

### Infrastructure & Integrations
- **Supabase** — Media storage
- **eSewa & Khalti** — Payment gateways
- **Git / GitHub** — Version control

---

## 📦 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- MySQL Server
- Supabase account
- Twilio account (Sandbox)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/Ryuklyn/ServiceLink.git
   cd ServiceLink
```

2. **Backend Setup**
```bash
   cd backend
```
Configure `src/main/resources/application.properties`:
```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/servicelink
   spring.datasource.username=your_username
   spring.datasource.password=your_password
```
Run:
```bash
   mvn spring-boot:run
```

3. **Frontend Setup**
```bash
   cd frontend/servicelink
   npm install
   npm run dev
```

4. Open `http://localhost:3000`

---

## 👤 Author

**Rukesh Maharjan**
[LinkedIn](https://linkedin.com/in/rukesh-maharjan) • [GitHub](https://github.com/Ryuklyn)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.