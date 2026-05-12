# WorkLaza - Data Flow Diagrams (DFD)

## Overview
This document defines the complete data flow architecture of WorkLaza at three levels of abstraction, showing how data moves between users, the system, and external entities.

---

## 📊 Level 0 DFD - Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      WorkLaza Platform                          │
│                   (Complete System)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    1. User Data         2. Booking Data    3. Payment Data
    Auth & Profile       Service Request    Transaction Info
         │                    │                    │
         ▼                    ▼                    ▼
    ┌────────────┐      ┌────────────┐      ┌────────────┐
    │ Customers  │      │  Workers   │      │   Payment  │
    │  & Admins  │      │   (Labor)  │      │   Gateway  │
    └────────────┘      └────────────┘      └────────────┘
```

### External Entities:
1. **Customers** - Browse services, book workers, communicate, provide reviews
2. **Workers** - List services, manage availability, accept/reject bookings, receive payments
3. **Admins** - Monitor system, manage users, view financial reports
4. **Payment Gateway** - Process transactions, wallet credits/debits

---

## 📋 Level 1 DFD - Major Processes & Data Stores

```
                        ┌─────────────────────────────────────────┐
                        │     WorkLaza System (Level 1)            │
                        └─────────────────────────────────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
            
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │  P1: Authentication  │  │  P2: Booking System  │  │  P3: Communication   │
    │   & User Management  │  │   & Job Matching     │  │    & Notifications   │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
           ▲    │ │                  ▲    │ │                  ▲    │ │
           │    │ │                  │    │ │                  │    │ │
         D1│    │ │D2               D3│    │ │D4               D5│    │ │D6
      (User)    │ │(OTP)         (Worker)│ │(Booking)      (Notification)│(Chat)
           │    │ │                  │    │ │                  │    │ │
           ▼    ▼ ▼                  ▼    ▼ ▼                  ▼    ▼ ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │    P4: Wallet &      │  │   P5: Reviews &      │  │   P6: Admin Panel    │
    │  Payment Processing  │  │     Ratings System   │  │   & Reporting        │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
           ▲    │ │                  ▲    │ │                  ▲    │ │
           │    │ │                  │    │ │                  │    │ │
         D7│    │ │D8               D9│    │ │D10               │    │ │
    (Wallet)    │ │(Payment)      (Review) │ │(Rating)          │    │ │
           │    │ │                  │    │ │                  │    │ │
           ▼    ▼ ▼                  ▼    ▼ ▼                  ▼    ▼ ▼
```

### Data Stores (Persistent Storage):
- **D1: Users DB** - Customer, Worker, Admin profiles & authentication
- **D2: OTP Store** - Temporary OTP codes with expiration
- **D3: Workers DB** - Worker profiles, skills, availability, ratings
- **D4: Bookings DB** - Booking details, status, history
- **D5: Notifications DB** - System notifications, alerts
- **D6: Chat DB** - Chat messages, conversation history
- **D7: Wallet DB** - User wallet balance, transaction history
- **D8: Payment DB** - Payment records, transaction IDs
- **D9: Reviews DB** - Reviews, comments, ratings
- **D10: Admin Logs** - System logs, audit trail

---

## 🔄 Level 2 DFD - Detailed Process Breakdown

### **P1: Authentication & User Management**
```
Customer/Worker/Admin Request
            │
            ▼
    ┌──────────────────┐
    │  P1.1: Sign Up   │ ──→ Generate & Send OTP → D2: OTP Store
    └──────────────────┘
            │
            ├─────────────────────┐
            │                     │
            ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ P1.2: OTP        │  │ P1.3: Profile    │
    │ Verification     │  │ Creation         │
    └──────────────────┘  └──────────────────┘
            │                     │
            └─────────────┬───────┘
                          ▼
                ┌──────────────────────┐
                │ P1.4: Store User in  │ ──→ D1: Users DB
                │ D1 (Users Database)  │
                └──────────────────────┘
                          │
                          ▼
                    Return Auth Token
                    (JWT Token)
```

### **P2: Booking System & Job Matching**
```
Customer Browse & Search
            │
            ▼
    ┌──────────────────────┐
    │ P2.1: List Workers   │ ──→ D3: Workers DB
    │ (with filters)       │
    └──────────────────────┘
            │
            ├─ Apply Filters ─→ Location, Skills, Ratings
            │
            ▼
    ┌──────────────────────┐
    │ P2.2: Check Worker   │ ──→ D3: Workers Availability
    │ Availability         │     D4: Bookings DB
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P2.3: Customer       │
    │ Creates Booking      │
    └──────────────────────┘
            │
            ├─ Add Details: date, time, location, photos, description
            │
            ▼
    ┌──────────────────────┐
    │ P2.4: Store Booking  │ ──→ D4: Bookings DB
    │ (Status: Created)    │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P2.5: Notify Worker  │ ──→ D5: Notifications DB
    │ of New Booking       │     P3: Communication
    └──────────────────────┘
            │
            ▼
    Worker Accepts/Rejects
            │
    ┌───────┴───────┐
    ▼               ▼
Accepted        Rejected
    │               │
    ▼               ▼
Update DB   Update DB
Status:     Status:
accepted    rejected
```

### **P3: Communication & Notifications**
```
Customer or Worker Sends Message
            │
            ▼
    ┌──────────────────────┐
    │ P3.1: Message        │ ──→ WebSocket/Push
    │ Submission           │     Notification
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P3.2: Store Chat     │ ──→ D6: Chat DB
    │ Message              │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P3.3: Create         │ ──→ D5: Notifications DB
    │ Notification Entry   │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P3.4: Send Real-Time │
    │ Alert to Recipient   │
    └──────────────────────┘
            │
            ▼
    Recipient Receives Notification
```

### **P4: Wallet & Payment Processing**
```
Booking Completed / Platform Fee Due
            │
            ▼
    ┌──────────────────────┐
    │ P4.1: Calculate      │
    │ Platform Fee         │
    │ (from booking total) │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P4.2: Initiate       │ ──→ Payment Gateway
    │ Payment to Gateway   │     (Razorpay/Stripe)
    └──────────────────────┘
            │
            ├─ Payment Success / Failure
            │
    ┌───────┴───────┐
    ▼               ▼
Success         Failure
    │               │
    ▼               ▼
    ┌──────────────┐   ┌──────────────┐
    │ P4.3a:       │   │ P4.3b: Retry │
    │ Create Debit │   │ Transaction  │
    │ Entry        │   └──────────────┘
    └──────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P4.4: Store Payment  │ ──→ D8: Payment DB
    │ Record               │     D7: Wallet DB
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P4.5: Update Worker  │ ──→ D7: Wallet DB
    │ Wallet Balance       │
    │ (Debit Platform Fee) │
    └──────────────────────┘
```

### **P5: Reviews & Ratings**
```
Booking Status = Completed
            │
            ▼
    ┌──────────────────────┐
    │ P5.1: Prompt         │ ──→ D5: Notifications DB
    │ Customer for Review  │
    └──────────────────────┘
            │
            ▼
    Customer Submits Review
    (Rating, Title, Description)
            │
            ▼
    ┌──────────────────────┐
    │ P5.2: Store Review   │ ──→ D9: Reviews DB
    │ & Rating             │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P5.3: Update Worker  │ ──→ D3: Workers DB
    │ Average Rating       │
    │ (Recalculate)        │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P5.4: Notify Worker  │ ──→ D5: Notifications DB
    │ of New Review        │
    └──────────────────────┘
```

### **P6: Admin Panel & Reporting**
```
Admin Dashboard Access
            │
            ▼
    ┌──────────────────────┐
    │ P6.1: Retrieve All   │ ──→ D1: Users DB
    │ User/Worker Data     │     D3: Workers DB
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P6.2: Aggregate      │ ──→ D4: Bookings DB
    │ Booking Statistics   │     D8: Payment DB
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P6.3: Generate       │ ──→ D10: Admin Logs
    │ Financial Reports    │
    │ (Revenue, Fees, etc) │
    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ P6.4: Display Admin  │
    │ Dashboard with Graphs│
    │ & Charts             │
    └──────────────────────┘
            │
            ▼
    Admin Views Reports
```

---

## 🔄 Complete End-to-End Data Flow: Booking Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE BOOKING LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: User Login
────────────────
Customer logs in → P1: Authentication → D1: Users DB → JWT Token Generated
                                            ▼
                                    Frontend stores token

STEP 2: Browse Workers
──────────────────────
Customer searches → P2.1: List Workers → Query D3: Workers DB → Display results
                   (Apply filters)

STEP 3: View Worker Details
────────────────────────────
Click on Worker → P2.2: Check Availability → Query D3, D4 → Display slots
                                                ▼
                                        Show available dates/times

STEP 4: Create Booking
──────────────────────
Customer fills booking form → P2.3: Create Booking → P2.4: Store in D4
                                                            ▼
                                            Status: "created"

STEP 5: Notify Worker
─────────────────────
P2.5: Send Notification → Create entry in D5 → P3: Send WebSocket alert to Worker
                                                       ▼
                                            Worker receives notification

STEP 6: Worker Response
───────────────────────
Worker accepts/rejects → P2.5: Update Booking in D4
                                ▼
                        Status: "accepted" or "rejected"

STEP 7: Communication
──────────────────────
Customer/Worker Chat → P3: Store messages in D6 → Real-time updates via WebSocket
                                                        ▼
                                            Both parties see messages instantly

STEP 8: Service Completion
───────────────────────────
Worker marks complete → Update D4 → Status: "completed"
                            ▼
                    Trigger notification to customer

STEP 9: Review & Rating
───────────────────────
Customer submits review → P5: Store in D9 → Update worker rating in D3
                                                    ▼
                                        Worker average rating recalculated

STEP 10: Payment Processing
────────────────────────────
Auto-trigger P4 → Calculate platform fee → Send to Payment Gateway
                        ▼
              Payment Success → Create Debit entry in D7 → Update wallet in D7
                        ▼
          Send payment confirmation to both parties

STEP 11: Admin Reporting
────────────────────────
Admin dashboard refreshes → P6: Aggregates data from D4, D8, D3
                                      ▼
                            Generate statistics & reports
```

---

## 📡 Frontend ↔ Backend Data Exchange

### API Endpoints & Data Flow

| Process | Frontend | Backend Endpoint | Data Store | Response |
|---------|----------|------------------|-----------|----------|
| **Login** | Sign In Form | `POST /user/login/` | D1 | JWT Token |
| **OTP Verify** | OTP Input | `POST /user/verify-otp/` | D2 | Auth Token |
| **Get Workers** | Search Page | `GET /worker/list/` | D3 | Workers List + D9 (Ratings) |
| **Book Service** | Booking Form | `POST /worker/booking/` | D4 | Booking Confirmation |
| **Send Message** | Chat Component | `WebSocket /chat/` | D6 | Message Stored & Broadcast |
| **Submit Review** | Review Form | `POST /worker/review/` | D9, D3 | Review Confirmation |
| **Process Payment** | Cart/Checkout | `POST /payment/initiate/` | D8, D7 | Payment Status |
| **Admin Dashboard** | Admin Panel | `GET /admin_view/statistics/` | D1,D3,D4,D8 | Dashboard Data |

---

## 🔐 Data Security & Flow Considerations

### Authentication Flow
```
Frontend                          Backend
   │                                │
   ├─→ Login Credentials ──────────→│
   │                          ┌──→ D1: Verify User
   │                          │
   │←─ JWT Token ─────────────┘
   │
   ├─→ API Request + Token ──────→ Middleware: Verify JWT
   │                                │
   │←─ Authorized Response ────────┘
```

### Payment Security Flow
```
Frontend (Checkout)
        │
        ├─→ Payment Details (NOT to backend)
        │     ↓
        └────→ Payment Gateway (Razorpay/Stripe)
               │
               ├─→ Process Payment
               │
               └─→ Payment Webhook to Backend ──→ P4: Update D8, D7
                                                     │
                                              Send confirmation to Frontend
```

---

## 📊 System Scalability & Data Volume

### Expected Data Growth
- **Users**: Customer + Worker profiles grow with registration
- **Bookings**: Increases with active users and platform usage
- **Chat Messages**: Real-time data, needs efficient indexing
- **Payment Records**: Permanent audit trail, rarely deleted
- **Notifications**: Can be archived after user views

### Optimization Points
1. **Database Indexing**: On user_id, worker_id, booking_status, created_date
2. **Caching**: Worker listings, popular services (Redis)
3. **API Response Pagination**: Limit results per page
4. **Lazy Loading**: Frontend loads data as needed
5. **Archive Old Data**: Move completed bookings to archive DB after 1 year

---

## ✅ Checklist for DFD Implementation

- [x] Level 0: Context Diagram (System boundary & external entities)
- [x] Level 1: Main processes & data stores (6 primary processes)
- [x] Level 2: Detailed process breakdown (sub-processes)
- [x] End-to-end booking lifecycle documented
- [x] API endpoints mapped to data flows
- [x] Security considerations included
- [x] Database tables identified
- [x] Real-time communication flows (WebSocket, Notifications)
- [x] Payment processing flow
- [x] Admin dashboard data aggregation

---

## 📚 Related Documentation
- See [README.md](README.md) for system overview
- See [FRONTEND_PAGE_REVIEW.md](FRONTEND_PAGE_REVIEW.md) for frontend architecture
- Backend API: `backend/backend/urls.py` for all endpoints
- Database Models: `backend/*/models.py` for data structure
