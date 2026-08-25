# Village Health Access System — Backend Module 3 API Documentation

**Module**: Healthcare Center Discovery, Referral Tracking, Follow-up Reminders & Village Health Analytics  
**Author**: Backend Developer 3  
**Base URL**: `http://localhost:5000`  
**Git Branch**: `backend/referral-analytics`

---

## 1. Authentication & Security

All mutating endpoints (`POST /api/referrals`, `PUT /api/referrals/:id/status`, `POST /api/followups`, `PUT /api/followups/:id/status`, etc.) are protected.

### Headers:
```http
Authorization: Bearer <JWT_TOKEN>
```
*In local development / automated testing, `x-healthworker-id: <USER_ID>` can be provided directly.*

---

## 2. Healthcare Center Discovery & Management

### 2.1 Discover Nearby Healthcare Centers
*Find healthcare facilities within a given radius sorted by geospatial distance.*

* **Method**: `GET`
* **Endpoint**: `/api/healthcare-centers/nearby`
* **Query Parameters**:
  | Parameter | Type | Required | Default | Description |
  |---|---|---|---|---|
  | `latitude` | Number | **Yes** | - | Latitude coordinate (-90 to 90) |
  | `longitude` | Number | **Yes** | - | Longitude coordinate (-180 to 180) |
  | `radius` | Number | No | `20` | Search radius in kilometers |
  | `emergencySupport` | Boolean | No | - | `true` or `false` |
  | `type` | String | No | - | `PHC`, `CLINIC`, `HOSPITAL`, `EMERGENCY_CENTER`, `CHC` |
  | `service` | String | No | - | Name of specific service (e.g. `Pediatrics`, `Cardiology`) |
  | `limit` | Number | No | `20` | Maximum results to return (1-100) |

* **Example Request**:
```http
GET /api/healthcare-centers/nearby?latitude=17.385&longitude=78.486&radius=25&emergencySupport=true
```

* **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "60c72b2f9b1d8b2badbee002",
      "name": "Narsingi Community Health Centre",
      "type": "CHC",
      "address": "Survey No. 45, Narsingi Junction",
      "village": "Narsingi",
      "district": "Rangareddy",
      "state": "Telangana",
      "distanceKm": 4.2,
      "services": ["General Care", "Pediatrics", "Obstetrics & Gynecology", "Minor Surgery"],
      "emergencySupport": true,
      "phone": "+91-9876500002",
      "operatingHours": {
        "monday": "24 Hours",
        "sunday": "24 Hours"
      }
    }
  ]
}
```

---

### 2.2 List All Healthcare Centers
* **Method**: `GET`
* **Endpoint**: `/api/healthcare-centers`
* **Query Parameters**: `type`, `village`, `district`, `emergencySupport`, `service`, `isActive`
* **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "id": "60c72b2f9b1d8b2badbee001",
      "name": "Kondapur Primary Health Centre",
      "type": "PHC",
      "address": "Near Gram Panchayat Office",
      "village": "Kondapur",
      "district": "Medak",
      "services": ["General Outpatient", "Maternal Care"],
      "emergencySupport": false,
      "phone": "+91-9876500001",
      "isActive": true
    }
  ]
}
```

---

### 2.3 Get Healthcare Center by ID
* **Method**: `GET`
* **Endpoint**: `/api/healthcare-centers/:id`
* **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": "60c72b2f9b1d8b2badbee001",
    "name": "Kondapur Primary Health Centre",
    "type": "PHC",
    "address": "Near Gram Panchayat Office",
    "village": "Kondapur",
    "district": "Medak",
    "location": {
      "type": "Point",
      "coordinates": [78.3612, 17.4689]
    },
    "emergencySupport": false
  }
}
```

---

### 2.4 Create Healthcare Center
* **Method**: `POST`
* **Endpoint**: `/api/healthcare-centers`
* **Request Body**:
```json
{
  "name": "Chevella Emergency Care Centre",
  "type": "EMERGENCY_CENTER",
  "address": "NH 163 Bypass",
  "village": "Chevella",
  "district": "Rangareddy",
  "latitude": 17.3112,
  "longitude": 78.1345,
  "phone": "+91-9876500004",
  "services": ["24/7 Trauma Unit", "Cardiac Emergency", "Ambulance"],
  "emergencySupport": true
}
```

---

## 3. Referral Management & State Tracking

### Status Lifecycle & State Machine:
```text
CREATED ──► SENT ──► ACCEPTED ──► ARRIVED ──► COMPLETED
   │          │
   ▼          ▼
CANCELLED  CANCELLED
```

---

### 3.1 Create Referral
* **Method**: `POST`
* **Endpoint**: `/api/referrals`
* **Request Body**:
```json
{
  "patientId": "60c72b2f9b1d8b2badbee101",
  "consultationId": "60c72b2f9b1d8b2badbee201",
  "healthcareCenterId": "60c72b2f9b1d8b2badbee002",
  "priority": "HIGH",
  "reason": "Severe fever with suspected low platelets requiring pediatric admission",
  "clinicalSummary": "Temp: 103F, BP: 90/60. Suspected Dengue.",
  "notes": "Emergency vehicle arranged"
}
```
* **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "referralId": "60c72b2f9b1d8b2badbee301",
    "id": "60c72b2f9b1d8b2badbee301",
    "status": "CREATED"
  }
}
```

---

### 3.2 Get Referral Details & Tracking
* **Method**: `GET`
* **Endpoint**: `/api/referrals/:id`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": "60c72b2f9b1d8b2badbee301",
    "patientId": {
      "id": "60c72b2f9b1d8b2badbee101",
      "name": "Laxmi Devi",
      "village": "Kondapur",
      "district": "Medak",
      "phone": "+91-9123456701"
    },
    "healthcareCenterId": {
      "id": "60c72b2f9b1d8b2badbee002",
      "name": "Narsingi Community Health Centre",
      "type": "CHC",
      "phone": "+91-9876500002",
      "address": "Survey No. 45, Narsingi Junction",
      "emergencySupport": true
    },
    "priority": "HIGH",
    "reason": "Severe fever with suspected low platelets",
    "clinicalSummary": "Temp: 103F, BP: 90/60",
    "status": "SENT",
    "timestamps": {
      "created": "2026-08-25T05:00:00.000Z",
      "sent": "2026-08-25T05:15:00.000Z"
    }
  }
}
```

---

### 3.3 Update Referral Status
* **Method**: `PUT`
* **Endpoint**: `/api/referrals/:id/status`
* **Request Body**:
```json
{
  "status": "ACCEPTED"
}
```
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Referral status updated to ACCEPTED successfully",
  "data": {
    "id": "60c72b2f9b1d8b2badbee301",
    "status": "ACCEPTED",
    "timestamps": {
      "created": "2026-08-25T05:00:00.000Z",
      "sent": "2026-08-25T05:15:00.000Z",
      "accepted": "2026-08-25T05:30:00.000Z"
    }
  }
}
```
* **Error Example on Invalid Transition (`400 Bad Request`)**:
```json
{
  "success": false,
  "message": "Invalid status transition from 'CREATED' to 'ARRIVED'. Allowed next status: SENT, CANCELLED"
}
```

---

### 3.4 List Referrals (Paginated & Filtered)
* **Method**: `GET`
* **Endpoint**: `/api/referrals`
* **Query Parameters**:
  | Parameter | Type | Description |
  |---|---|---|
  | `page` | Integer | Page number (default: 1) |
  | `limit` | Integer | Items per page (default: 20, max: 100) |
  | `status` | String | `CREATED`, `SENT`, `ACCEPTED`, `ARRIVED`, `COMPLETED`, `CANCELLED` |
  | `priority` | String | `LOW`, `MODERATE`, `HIGH` |
  | `healthcareCenterId` | String | Filter by destination facility ID |
  | `village` | String | Filter by patient village name |
  | `from` | ISO Date | e.g. `2026-08-01` |
  | `to` | ISO Date | e.g. `2026-08-25` |

* **Response (`200 OK`)**:
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 35,
  "totalPages": 2,
  "data": [ ... ]
}
```

---

### 3.5 Get Referrals for a Specific Patient
* **Method**: `GET`
* **Endpoint**: `/api/patients/:patientId/referrals`

---

## 4. Follow-up & Reminder Management

### 4.1 Create Follow-up
* **Method**: `POST`
* **Endpoint**: `/api/followups`
* **Request Body**:
```json
{
  "patientId": "60c72b2f9b1d8b2badbee101",
  "referralId": "60c72b2f9b1d8b2badbee301",
  "type": "REFERRAL",
  "scheduledDate": "2026-09-01T10:00:00.000Z",
  "notes": "Check platelet stabilization after discharge"
}
```
* **Supported Types**: `CONSULTATION`, `MEDICATION_REVIEW`, `VACCINATION`, `REFERRAL`, `GENERAL`

---

### 4.2 Get Upcoming Follow-ups
* **Method**: `GET`
* **Endpoint**: `/api/followups/upcoming`
* **Query Parameters**: `days` (default: 7), `village`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60c72b2f9b1d8b2badbee401",
      "patientId": {
        "id": "60c72b2f9b1d8b2badbee101",
        "name": "Laxmi Devi",
        "village": "Kondapur"
      },
      "type": "REFERRAL",
      "scheduledDate": "2026-08-27T10:00:00.000Z",
      "status": "PENDING",
      "isOverdue": false
    }
  ]
}
```

---

### 4.3 List Follow-ups & Dynamic Overdue Filter
* **Method**: `GET`
* **Endpoint**: `/api/followups?status=OVERDUE`
* *Returns pending follow-ups where `scheduledDate < current time` flagged dynamically with `status: "OVERDUE"` and `isOverdue: true`.*

---

### 4.4 Update Follow-up Status
* **Method**: `PUT`
* **Endpoint**: `/api/followups/:id/status`
* **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
*(Automatically populates `completedAt: <Server UTC Date>`)*

---

## 5. Village Health Analytics

### 5.1 System Overview
* **Method**: `GET`
* **Endpoint**: `/api/analytics/overview`
* **Query Parameters**: `village`, `district`, `from`, `to`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "totalPatients": 120,
    "totalReferrals": 45,
    "pendingReferrals": 12,
    "completedReferrals": 30,
    "highPriorityReferrals": 8,
    "moderatePriorityReferrals": 22,
    "lowPriorityReferrals": 15,
    "pendingFollowups": 18,
    "overdueFollowups": 4
  }
}
```

---

### 5.2 Referral Analytics
* **Method**: `GET`
* **Endpoint**: `/api/analytics/referrals`
* **Query Parameters**: `village`, `district`, `from`, `to`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byPriority": {
      "LOW": 15,
      "MODERATE": 22,
      "HIGH": 8
    },
    "byStatus": {
      "CREATED": 3,
      "SENT": 5,
      "ACCEPTED": 2,
      "ARRIVED": 2,
      "COMPLETED": 30,
      "CANCELLED": 3
    },
    "byHealthcareCenter": [
      {
        "healthcareCenterId": "60c72b2f9b1d8b2badbee002",
        "name": "Narsingi Community Health Centre",
        "type": "CHC",
        "count": 25
      }
    ],
    "completionRate": "71.4%",
    "pending": 12,
    "averageCompletionTimeHours": 18.5
  }
}
```

---

### 5.3 Follow-up Analytics
* **Method**: `GET`
* **Endpoint**: `/api/analytics/followups`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "total": 50,
    "pending": 18,
    "completed": 28,
    "missed": 4,
    "overdue": 4,
    "dueThisWeek": 7
  }
}
```

---

### 5.4 Healthcare Center Utilization Analytics
* **Method**: `GET`
* **Endpoint**: `/api/analytics/healthcare-centers`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "healthcareCenterId": "60c72b2f9b1d8b2badbee002",
      "name": "Narsingi Community Health Centre",
      "type": "CHC",
      "village": "Narsingi",
      "district": "Rangareddy",
      "totalReferrals": 25,
      "completed": 20,
      "pending": 5
    }
  ]
}
```

---

### 5.5 Recorded Health Trends & Observation Frequencies
* **Method**: `GET`
* **Endpoint**: `/api/analytics/health-trends`
* **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "disclaimer": "These metrics represent aggregated recorded observations from frontline consultations and do not constitute epidemiological diagnoses.",
    "symptoms": [
      { "symptom": "High fever", "count": 18 },
      { "symptom": "Chest tightness", "count": 6 }
    ],
    "observedConditions": [
      { "condition": "Suspected Dengue", "count": 14 },
      { "condition": "Hypertensive Urgency", "count": 5 }
    ]
  }
}
```