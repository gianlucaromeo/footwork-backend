# Footwork - Backend
Footwork is a dance video management system for dance schools and associations.
<br/>

![footwork-backend-stack](https://github.com/user-attachments/assets/e84c1ef9-292e-487c-b230-10a07ca5d492)

## User Interface
Footwork is an adaptive website, designed for large and small screens. Here's an example of an admin's dashboard.
<br/>

<img width="1800" alt="footwork-sample" src="https://github.com/user-attachments/assets/fb193522-fb59-4bf8-88d6-001b5d42f8e0">

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
