# Skills and Technologies Used

This project comprehensively integrates multiple domains of software engineering, focusing heavily on robust Database Management System (DBMS) concepts, modern frontend design, and scalable backend architecture.

## Database/DBMS Skills Used
- **PostgreSQL**: Chosen for its robust support of advanced relational features.
- **SQL Queries**: Implemented complex queries involving `JOINs`, `GROUP BY`, conditional aggregation (`CASE WHEN`), and date math.
- **Normalization (3NF/BCNF)**: The database avoids transitive and partial dependencies by using explicit foreign keys (e.g., `role_id` instead of string roles) and surrogate primary keys.
- **Triggers**: Automated data integrity by implementing triggers (e.g., updating inventory status automatically upon request fulfillment, preventing expired blood usage before insertion).
- **Stored Procedures**: Encapsulated complex business logic like `approve_blood_request` to ensure FIFO inventory allocation and transaction safety.
- **Views**: Created dynamic logical tables (e.g., `available_blood_stock_view`, `active_donors_view`) to simplify backend queries and improve dashboard aggregation speeds.
- **Transactions**: Leveraged PostgreSQL transactions inside stored procedures to ensure atomic updates (e.g., if blood allocation fails halfway, the entire request rolls back).
- **Constraints & Indexing**: Extensive use of `UNIQUE`, `CHECK` (e.g., age verification for donors), and `FOREIGN KEY` constraints, alongside b-tree indexes on frequently queried columns.
- **ER Modeling**: Represented the complex 1-to-N and N-to-M relationships mapped securely to physical tables.

## Backend Skills Used
- **FastAPI**: Used for high-performance, asynchronous REST APIs.
- **REST APIs**: Designed clean endpoint routing (e.g., `/api/v1/dashboard/stats`).
- **SQLAlchemy ORM**: Mapped Python objects to database tables for seamless interactions while still utilizing raw SQL for advanced views.
- **JWT Authentication**: Implemented secure token-based authentication and route protection.
- **Validation (Pydantic)**: Enforced strict request schema validation for data payloads.
- **Secure Architecture**: Environment variables management for secrets and modular directory structuring (`routers`, `models`, `schemas`, `services`).

## Frontend Skills Used
- **React & Vite**: Built a fast, component-driven UI.
- **TailwindCSS**: Used for a minimalist, utility-first styling approach to achieve a highly professional look without bloated CSS files.
- **shadcn/ui**: Integrated accessible, beautiful radix-ui components using a customized theme variable setup (muted grays, clean spacing).
- **Responsive Design**: Designed the dashboard layout to adapt to varying screen sizes with collapsible sidebars.
- **API Integration**: Set up foundations for Axios to intercept requests and inject JWT tokens.
- **Dashboard UI Design**: Utilized `Recharts` for data visualization and created KPI metric cards reflecting a real-world healthcare SaaS environment.

## Software Engineering Concepts
- **Clean Architecture**: Separated concerns across the frontend (layouts vs pages vs components) and backend (routes vs schemas vs database).
- **Role-Based Access Control**: Different UI experiences mapped to roles (Admin, Staff, Hospital, Donor).
- **Data Validation & Sanitization**: Both frontend-level (HTML5 inputs) and backend-level (Pydantic) validations to prevent malformed data.