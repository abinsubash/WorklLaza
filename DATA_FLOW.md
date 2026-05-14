# WorkLaza - Data Flow Diagrams (DFD)

## Overview
This document defines the complete data flow architecture of WorkLaza at three levels of abstraction, showing how data moves between users, the system, and external entities.

---

## 📊 LEVEL 0 DFD (Context Diagram)

```
                              ┌──────────────────────┐
                              │   WORKLAZA PLATFORM  │
                              │   (Complete System)  │
                              └──────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
            ┌────────────┐        ┌────────────┐        ┌─────────────┐
            │ CUSTOMERS  │        │  WORKERS   │        │   PAYMENT   │
            │  & ADMINS  │        │   (Labor)  │        │   GATEWAY   │
            └────────────┘        └────────────┘        └─────────────┘
                │                      │                      │
                │                      │                      │
    1. User Data, Auth         2. Booking Details      3. Payment Txn
    Profile, Reviews           Service Status         Transaction Info
                │                      │                      │
                └──────────────────────┼──────────────────────┘
                                       ▲
                                       │
                           ┌───────────────────────┐
                           │  WORKLAZA OPERATIONS  │
                           │                       │
                           │ - Authenticate Users  │
                           │ - Match Services      │
                           │ - Process Payments    │
                           │ - Send Notifications  │
                           │ - Calculate Fees      │
                           └───────────────────────┘

LEGEND:
━━━  User/Entity
┌──┐ System
→   Data Flow
```

### External Entities:
1. **CUSTOMERS** - Browse services, book workers, communicate, provide reviews
2. **WORKERS** - List services, manage availability, accept/reject bookings, receive payments  
3. **ADMINS** - Monitor system, manage users, view financial reports
4. **PAYMENT GATEWAY** - Process transactions, wallet credits/debits

---

## 📋 LEVEL 1 DFD (Major Processes & Data Stores)

```
                    ┌─────────────────────────────────────────────┐
                    │      WORKLAZA SYSTEM - LEVEL 1              │
                    └─────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  P1: USER            │   │  P2: BOOKING         │   │  P3: COMMUNICATION   │
│  AUTHENTICATION      │   │  SYSTEM & MATCHING   │   │  & NOTIFICATIONS     │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
    │         │                  │         │                  │         │
    │         │                  │         │                  │         │
    │ D1(Users)│ D2(OTP)          │ D3(Workers)│ D4(Bookings) │ D5(Notifications)│ D6(Chat)
    │         │                  │         │                  │         │
    ▼         ▼                  ▼         ▼                  ▼         ▼

┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  P4: WALLET &        │   │  P5: REVIEWS &       │   │  P6: ADMIN PANEL     │
│  PAYMENT PROCESSING  │   │  RATINGS SYSTEM      │   │  & REPORTING         │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
    │         │                  │         │                  │         │
    │         │                  │         │                  │         │
    │ D7(Wallet)│ D8(Payment)     │ D9(Reviews)│ D10(Ratings)  │ D11(Admin Logs)
    │         │                  │         │                  │         │

═══ DATA STORES (Persistent Storage) ═══
┌─────────────────────────────────────────────────┐
│ D1: USERS DATABASE                              │
│    • Customer profiles, credentials, preferences│
│    • Worker profiles, skills, certifications    │
│    • Admin accounts                             │
│                                                 │
│ D2: OTP STORE                                   │
│    • Temporary OTP codes with expiration        │
│                                                 │
│ D3: WORKERS DATABASE                            │
│    • Worker details, availability, ratings      │
│                                                 │
│ D4: BOOKINGS DATABASE                           │
│    • Booking records, status, history           │
│                                                 │
│ D5: NOTIFICATIONS DATABASE                      │
│    • System alerts, booking updates             │
│                                                 │
│ D6: CHAT DATABASE                               │
│    • Chat messages, conversation history        │
│                                                 │
│ D7: WALLET DATABASE                             │
│    • Wallet balances, transaction history       │
│                                                 │
│ D8: PAYMENT DATABASE                            │
│    • Payment records, transaction IDs           │
│                                                 │
│ D9: REVIEWS DATABASE                            │
│    • User reviews and feedback                  │
│                                                 │
│ D10: RATINGS DATABASE                           │
│    • Worker ratings, averages                   │
│                                                 │
│ D11: ADMIN LOGS DATABASE                        │
│    • System logs, audit trail                   │
└─────────────────────────────────────────────────┘
```

---

## 🔄 LEVEL 2 DFD (Detailed Process Breakdown)

### **P1: User Authentication & Management**
```
CUSTOMER/WORKER/ADMIN REQUEST
            │
            ▼
    ┌──────────────────────┐
    │  P1.1: SIGN UP       │────→ Generate & Send OTP ──→ D2: OTP STORE
    │  (Registration)      │
    └──────────────────────┘
            │
            ├─────────────────────┐
            │                     │
            ▼                     ▼
    ┌──────────────────┐  ┌──────────────────────┐
    │ P1.2: OTP        │  │ P1.3: PROFILE        │
    │ VERIFICATION     │  │ CREATION & SETUP     │
    └──────────────────┘  └──────────────────────┘
            │                     │
            └─────────────┬───────┘
                          ▼
            ┌──────────────────────────┐
            │ P1.4: STORE USER IN DB   │───→ D1: USERS DB
            │ (Create Account)         │
            └──────────────────────────┘
                          │
                          ▼
                    RETURN AUTH TOKEN
                    (JWT Token)
```

### **P2: Booking System & Job Matching**
```
CUSTOMER BROWSE & SEARCH
            │
            ▼
    ┌──────────────────────────┐
    │ P2.1: LIST WORKERS       │───→ D3: WORKERS DB
    │ (Browse All/With Filters)│
    └──────────────────────────┘
            │
            ├─ Apply Filters:
            │  • Location
            │  • Skills/Category
            │  • Availability
            │  • Ratings
            │
            ▼
    ┌──────────────────────────┐
    │ P2.2: CHECK WORKER       │───→ D3: Worker Availability
    │ AVAILABILITY & SLOTS     │     D4: Bookings DB
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P2.3: CUSTOMER CREATES   │
    │ BOOKING REQUEST          │
    └──────────────────────────┘
            │
            ├─ Add Details:
            │  • Date & Time
            │  • Location
            │  • Photos
            │  • Description
            │
            ▼
    ┌──────────────────────────┐
    │ P2.4: STORE BOOKING      │───→ D4: BOOKINGS DB
    │ Status: "CREATED"        │     (Status: Created)
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P2.5: NOTIFY WORKER      │───→ D5: NOTIFICATIONS DB
    │ OF NEW BOOKING REQUEST   │
    └──────────────────────────┘
            │
            ▼
    WORKER RECEIVES & RESPONDS
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
ACCEPTED        REJECTED
    │               │
    ▼               ▼
D4: Status:    D4: Status:
"ACCEPTED"     "REJECTED"
```

### **P3: Real-time Communication & Notifications**
```
CUSTOMER OR WORKER SENDS MESSAGE
            │
            ▼
    ┌──────────────────────────┐
    │ P3.1: MESSAGE            │
    │ SUBMISSION               │
    └──────────────────────────┘
            │
            ├─ WebSocket Connection
            │
            ▼
    ┌──────────────────────────┐
    │ P3.2: STORE CHAT         │───→ D6: CHAT DB
    │ MESSAGE IN DATABASE      │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P3.3: CREATE REAL-TIME   │───→ D5: NOTIFICATIONS DB
    │ NOTIFICATION ENTRY       │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P3.4: BROADCAST TO       │
    │ RECIPIENT (WebSocket)    │
    └──────────────────────────┘
            │
            ▼
    RECIPIENT SEES MESSAGE INSTANTLY
    (In-app Notification + Push Alert)
```

### **P4: Wallet & Payment Processing**
```
BOOKING COMPLETED / PLATFORM FEE DUE
            │
            ▼
    ┌──────────────────────────┐
    │ P4.1: CALCULATE          │
    │ PLATFORM FEE             │
    │ (% of booking amount)    │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P4.2: INITIATE PAYMENT   │───→ PAYMENT GATEWAY
    │ TO PAYMENT PROCESSOR     │     (Stripe/Razorpay)
    └──────────────────────────┘
            │
            ├─ Wait for Response
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
SUCCESS         FAILURE
    │               │
    ▼               ▼
    ┌──────────────┐   ┌──────────────────┐
    │ P4.3a:       │   │ P4.3b: RETRY OR  │
    │ CREATE DEBIT │   │ STORE PENDING    │
    │ ENTRY        │   └──────────────────┘
    └──────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P4.4: STORE PAYMENT      │───→ D8: PAYMENT DB
    │ RECORD IN DATABASE       │     D7: WALLET DB
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P4.5: UPDATE WORKER      │───→ D7: WALLET DB
    │ WALLET BALANCE           │     (Debit Platform Fee)
    │ (Deduct Platform Fee)    │
    └──────────────────────────┘
            │
            ▼
    SEND PAYMENT CONFIRMATION
    TO CUSTOMER & WORKER
```

### **P5: Reviews & Ratings System**
```
BOOKING STATUS = COMPLETED
            │
            ▼
    ┌──────────────────────────┐
    │ P5.1: PROMPT CUSTOMER    │───→ D5: NOTIFICATIONS DB
    │ FOR REVIEW & RATING      │
    └──────────────────────────┘
            │
            ▼
    CUSTOMER SUBMITS REVIEW
    (Rating: 1-5 Stars)
    (Title & Description)
            │
            ▼
    ┌──────────────────────────┐
    │ P5.2: STORE REVIEW &     │───→ D9: REVIEWS DB
    │ RATING IN DATABASE       │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P5.3: RECALCULATE        │───→ D3: WORKERS DB
    │ WORKER AVERAGE RATING    │     (Update Average Rating)
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P5.4: NOTIFY WORKER      │───→ D5: NOTIFICATIONS DB
    │ OF NEW REVIEW            │
    └──────────────────────────┘
            │
            ▼
    DISPLAY REVIEW ON WORKER PROFILE
```

### **P6: Admin Panel & Analytics**
```
ADMIN ACCESSES DASHBOARD
            │
            ▼
    ┌──────────────────────────┐
    │ P6.1: RETRIEVE ALL       │───→ D1: USERS DB
    │ USER/WORKER DATA         │     D3: WORKERS DB
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P6.2: AGGREGATE          │───→ D4: BOOKINGS DB
    │ BOOKING STATISTICS       │     D8: PAYMENT DB
    │ (Total, Completed, etc)  │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P6.3: GENERATE           │───→ D11: ADMIN LOGS
    │ FINANCIAL REPORTS        │     (Store Report)
    │ (Revenue, Fees, Trends)  │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │ P6.4: DISPLAY ADMIN      │
    │ DASHBOARD WITH CHARTS    │
    │ & ANALYTICS              │
    └──────────────────────────┘
            │
            ▼
    ADMIN VIEWS COMPREHENSIVE
    SYSTEM STATISTICS & REPORTS
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
