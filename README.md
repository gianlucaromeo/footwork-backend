# footwork-backend
Backend of Footwork: a dance video management system for dance schools and association.

## Database structure - draft
Creted with mermaid. Note: composite keys are not available in mermaid syntax yet.
```mermaid
---
title: Footwork - Database Structure
---
erDiagram
    ADMIN {
        BIG_INT id PK
        TIMESTAMP created_at
        TIMESTAMP updated_at
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING password
    }

    STUDENT {
        BIG_INT id PK
        TIMESTAMP created_at
        TIMESTAMP updated_at
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING password
        BOOL verified_by_admin
    }

    COURSE {
        BIG_INT id PK
        STRING name
    }

    CHOREOGRAPHY {
        BIG_INT id PK
        STRING title
        STRING tag
        BIG_INT course_id FK
    }

    VIDEO {
        BIG_INT id PK
        BLOB cover_image_data
        BLOB video_data
        STRING title
        TIMESTAMP created_at
        TIMESTAMP updated_at
        BIG_INT choreography_id FK
    }

    ENROLLMENT {
        BIG_INT student_id FK "Composite PK (student_id, course_id)"
        BIG_INT course_id FK "Composite PK (student_id, course_id)"
        TIMESTAMP enrolled_at
        TIMESTAMP updated_at
    }
    
    VIDEO ||--|| CHOREOGRAPHY : belongs_to
    CHOREOGRAPHY ||--|| COURSE : belongs_to

    STUDENT ||--o{ ENROLLMENT : enrolls_in
    COURSE ||--o{ ENROLLMENT : contains
```
