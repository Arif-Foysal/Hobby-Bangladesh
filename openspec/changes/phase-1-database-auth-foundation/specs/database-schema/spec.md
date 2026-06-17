## ADDED Requirements

### Requirement: Database tables exist for all e-commerce entities
The system SHALL have PostgreSQL tables for products, categories, carts, cart_items, orders, order_items, addresses, reviews, and store_settings with appropriate columns, constraints, and foreign keys.

#### Scenario: All tables are created
- **WHEN** the migration script runs against the Supabase database
- **THEN** all tables listed in the schema are created with the correct column types, defaults, and constraints

#### Scenario: Foreign keys enforce referential integrity
- **WHEN** an order is created referencing a non-existent user
- **THEN** the database rejects the insert with a foreign key violation

#### Scenario: Unique constraints prevent duplicates
- **WHEN** a product is created with a slug that already exists
- **THEN** the database rejects the insert with a unique constraint violation

### Requirement: Indexes exist on frequently queried columns
The system SHALL have database indexes on columns used in WHERE clauses, JOINs, and ORDER BY for query performance.

#### Scenario: Product listing by category is indexed
- **WHEN** querying products filtered by category_id and sorted by created_at
- **THEN** the query uses the index on (category_id, created_at) instead of a sequential scan

#### Scenario: Order lookup by user is indexed
- **WHEN** querying orders filtered by user_id and sorted by created_at DESC
- **THEN** the query uses the index on (user_id, created_at)

### Requirement: RLS policies protect all tables
The system SHALL enable Row-Level Security on every table and define policies that restrict access based on the authenticated user's identity and role.

#### Scenario: Customer can only view their own cart
- **WHEN** an authenticated customer queries the carts table
- **THEN** only rows where user_id matches their auth.uid() are returned

#### Scenario: Customer cannot view other users' orders
- **WHEN** an authenticated customer queries the orders table
- **THEN** only rows where user_id matches their auth.uid() are returned

#### Scenario: Customer cannot modify product data
- **WHEN** an authenticated customer attempts to INSERT, UPDATE, or DELETE a product
- **THEN** the operation is rejected by RLS

#### Scenario: Admin can read and modify all products
- **WHEN** an authenticated admin user queries or mutates the products table
- **THEN** the operation succeeds

#### Scenario: Public can read active categories
- **WHEN** an unauthenticated visitor queries categories where is_active = true
- **THEN** the results are returned
