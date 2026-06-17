## ADDED Requirements

### Requirement: Admin can view category list
The system SHALL display a table of all categories at `/admin/categories` with columns for name, slug, parent, sort order, active status, and actions.

#### Scenario: Admin sees all categories
- **WHEN** an admin visits `/admin/categories`
- **THEN** a table shows all categories with name, slug, parent category, sort order, and active badge

#### Scenario: Active status shown as badge
- **WHEN** a category has `is_active = true`
- **THEN** the status column shows a green "Active" badge
- **WHEN** a category has `is_active = false`
- **THEN** the status column shows a gray "Inactive" badge

### Requirement: Admin can create a category
The system SHALL provide a form at `/admin/categories/new` to create a category with name, slug (auto-generated from name), description, image URL, parent category (optional), sort order, and active toggle.

#### Scenario: Successful category creation
- **WHEN** an admin fills in the form and submits
- **THEN** the category is created in the database and the admin is redirected to `/admin/categories`

#### Scenario: Duplicate slug rejected
- **WHEN** an admin submits a category with a slug that already exists
- **THEN** the form shows an error: "A category with this slug already exists"

### Requirement: Admin can edit a category
The system SHALL provide an edit form at `/admin/categories/[id]/edit` pre-filled with the category's current data.

#### Scenario: Successful category update
- **WHEN** an admin edits a category and submits
- **THEN** the category is updated and the admin is redirected to `/admin/categories`

### Requirement: Admin can delete a category
The system SHALL allow admins to delete a category with a confirmation dialog.

#### Scenario: Confirmation before delete
- **WHEN** an admin clicks delete on a category
- **THEN** a confirmation dialog appears: "Are you sure you want to delete [name]?"

#### Scenario: Category deleted
- **WHEN** an admin confirms deletion
- **THEN** the category is deleted (products in this category have their `category_id` set to NULL via ON DELETE SET NULL)

### Requirement: Admin can toggle category active status
The system SHALL allow admins to toggle a category's active/inactive status directly from the list.

#### Scenario: Toggle from list
- **WHEN** an admin clicks the active badge on a category row
- **THEN** the `is_active` field toggles and the badge updates
