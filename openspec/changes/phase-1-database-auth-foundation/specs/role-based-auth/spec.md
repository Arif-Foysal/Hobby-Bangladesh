## ADDED Requirements

### Requirement: Profiles table extends auth.users
The system SHALL maintain a `profiles` table with a one-to-one relationship to `auth.users` via the `id` column (UUID, primary key, foreign key to `auth.users`).

#### Scenario: Profile is auto-created on signup
- **WHEN** a new user signs up via Supabase Auth
- **THEN** a row is automatically inserted into `profiles` with the same `id`, `role` set to `'customer'`, and `created_at` set to now

#### Scenario: Profile stores additional user data
- **WHEN** viewing a user profile
- **THEN** the response includes `name`, `phone`, `avatar_url`, and `role` fields

#### Scenario: Profile update restricted to owner
- **WHEN** a customer attempts to update another user's profile
- **THEN** the operation is rejected by RLS

### Requirement: Admin role distinguishes privileged users
The system SHALL support an `admin` role on the profiles table that grants access to admin-only pages and database operations.

#### Scenario: Admin can access admin dashboard
- **WHEN** a user with `role = 'admin'` visits `/admin`
- **THEN** the admin layout is rendered with the sidebar navigation

#### Scenario: Customer is redirected from admin
- **WHEN** a user with `role = 'customer'` visits `/admin`
- **THEN** they are redirected to the homepage with an unauthorized message

#### Scenario: Unauthenticated user is redirected from admin
- **WHEN** an unauthenticated visitor tries to access `/admin`
- **THEN** they are redirected to `/auth/login`

#### Scenario: Role default is customer
- **WHEN** a new profile is created via the signup trigger
- **THEN** the `role` field defaults to `'customer'`

#### Scenario: Customers cannot self-elevate to admin
- **WHEN** a customer attempts to UPDATE their own profile `role` to `'admin'`
- **THEN** the operation is rejected by RLS

### Requirement: Session identity is verified server-side
The system SHALL call `supabase.auth.getClaims()` on every server-side request to verify the session is valid before performing any role-based operations.

#### Scenario: Expired session rejects admin access
- **WHEN** a request with an expired session cookie hits an admin route
- **THEN** `getClaims()` returns no user data and the request is redirected to login

#### Scenario: Valid session provides user identity
- **WHEN** a request with a valid session cookie hits a protected route
- **THEN** `getClaims()` returns the user's identity including profile data for role checks
