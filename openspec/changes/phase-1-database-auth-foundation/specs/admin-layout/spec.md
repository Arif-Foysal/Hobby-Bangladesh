## ADDED Requirements

### Requirement: Admin layout shell with sidebar navigation
The system SHALL provide a protected admin layout at `/admin` with a collapsible sidebar, header bar, and content area using shadcn/ui components and the new-york style.

#### Scenario: Admin visits dashboard
- **WHEN** an authenticated admin visits `/admin`
- **THEN** the admin layout renders with sidebar navigation and the dashboard content

#### Scenario: Customer is blocked from admin
- **WHEN** an authenticated customer visits any `/admin` route
- **THEN** they are redirected to `/` with an "Access denied" message

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** an unauthenticated visitor visits any `/admin` route
- **THEN** they are redirected to `/auth/login`

### Requirement: Sidebar includes navigation links for admin sections
The system SHALL render a sidebar with navigation links for Dashboard, Products, Categories, Orders, Reviews, Customers, and Settings sections.

#### Scenario: Sidebar links navigate to correct sections
- **WHEN** an admin clicks "Products" in the sidebar
- **THEN** they are navigated to `/admin/products`

#### Scenario: Active link is highlighted
- **WHEN** an admin is viewing `/admin/products`
- **THEN** the "Products" sidebar link has the active/highlighted style

#### Scenario: Sidebar collapses on mobile
- **WHEN** viewing admin on a mobile viewport (below 768px width)
- **THEN** the sidebar is collapsed by default and toggles with a hamburger button

### Requirement: Admin dashboard page shows placeholder content
The system SHALL render a dashboard page at `/admin` with a welcome message and placeholder cards for key metrics (total revenue, orders today, pending orders, products count).

#### Scenario: Dashboard renders for admin
- **WHEN** an admin visits `/admin`
- **THEN** the page displays four stat cards with "Coming soon" placeholders and the current store name from settings

### Requirement: Admin header shows user info and logout
The system SHALL display the current admin's email and a logout button in the admin header bar.

#### Scenario: Admin sees their email in the header
- **WHEN** an admin is authenticated on any admin page
- **THEN** the header bar shows their email address

#### Scenario: Admin can log out from admin area
- **WHEN** an admin clicks the logout button in the admin header
- **THEN** their session ends and they are redirected to `/auth/login`
