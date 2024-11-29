# Footwork - Backend
Footwork is a dance video management system for dance schools and associations.
<br/>

[Check the front-end](https://github.com/gianlucaromeo/footwork-frontend/tree/main)
<br/>

## Tech Stack
![footwork-backend-stack](https://github.com/user-attachments/assets/e84c1ef9-292e-487c-b230-10a07ca5d492)

## Database structure
```mermaid
---
title: Footwork - Database Structure
---
erDiagram
    ADMIN {
        BIG_INT id PK
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING registration_token
        STRING password_hash
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    STUDENT {
        BIG_INT id PK
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING registration_token
        STRING password_hash
        BOOL verified_by_admin
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    COURSE {
        BIG_INT id PK
        STRING name
        STRING image_url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    CHOREOGRAPHY {
        BIG_INT id PK
        STRING title
        STRING image_url
        BIG_INT course_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    VIDEO {
        BIG_INT id PK
        STRING title
        STRING cover_image_url
        STRING video_url
        BIG_INT choreography_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ENROLLMENT {
        BIG_INT student_id FK "Composite PK (student_id, course_id)"
        BIG_INT course_id FK "Composite PK (student_id, course_id)"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    VIDEO ||--|| CHOREOGRAPHY : belongs_to
    CHOREOGRAPHY ||--|| COURSE : belongs_to

    STUDENT ||--o{ ENROLLMENT : enrolls_in
    COURSE ||--o{ ENROLLMENT : contains
```

## Project structure
```
├── app.js
├── index.js
│
├── ... configuration files
│
├── controllers
│   ├── admins.js
│   ├── choreographies.js
│   ├── login.js
│   ├── ...
│
├── db
│   └── db.js
│
├── models
│   ├── admin.js
│   ├── choreography.js
│   ├── ...
│
├── tests
│   ├── admins.test.js
│   ├── choreographies.test.js
│   ├── helper.js
│   ├── ...
│
└── utils
    ├── config.js
    ├── emailSender.js
    ├── logger.js
    ├── middleware.js
    └── s3Upload.js
```

## Notes
More details and images will be uploaded before 29 November! 👀
