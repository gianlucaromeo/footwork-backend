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
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING password
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    STUDENT {
        BIG_INT id PK
        STRING first_name
        STRING last_name
        STRING email UK
        BOOL email_confirmed
        STRING password
        BOOL verified_by_admin
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    COURSE {
        BIG_INT id PK
        STRING name
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    CHOREOGRAPHY {
        BIG_INT id PK
        STRING title
        BIG_INT course_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    VIDEO {
        BIG_INT id PK
        STRING cover_image_url
        STRING video_url
        STRING title
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
