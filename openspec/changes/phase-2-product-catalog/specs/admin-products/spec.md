## ADDED Requirements

### Requirement: Admin can view product list
The system SHALL display a table of all products at `/admin/products` with columns for image thumbnail, name, category, price, stock, status, and actions.

#### Scenario: Admin sees all products
- **WHEN** an admin visits `/admin/products`
- **THEN** a table shows all products with first image thumbnail, name, category name, price, stock quantity, and active badge

#### Scenario: Products sorted by newest first
- **WHEN** the product list loads
- **THEN** products are sorted by `created_at DESC`

### Requirement: Admin can create a product
The system SHALL provide a form at `/admin/products/new` to create a product with name, slug (auto-generated), description, short description, price, compare-at price, cost price, SKU, stock quantity, category (dropdown), images (multi-upload), attributes (JSON), and active toggle.

#### Scenario: Successful product creation
- **WHEN** an admin fills in the form and submits
- **THEN** the product is created, images are uploaded to Supabase Storage, and the admin is redirected to `/admin/products`

#### Scenario: Image upload to storage
- **WHEN** an admin selects images and submits the form
- **THEN** each image is uploaded to the `products` bucket with path `products/{product_id}/{timestamp}_{filename}`
- **AND** the public URL is stored in the product's `images` JSONB array

#### Scenario: Required fields validated
- **WHEN** an admin submits without name, price, or stock
- **THEN** the form shows validation errors for the missing fields

### Requirement: Admin can edit a product
The system SHALL provide an edit form at `/admin/products/[id]/edit` pre-filled with the product's current data including existing images.

#### Scenario: Existing images displayed
- **WHEN** an admin opens the edit form
- **THEN** all existing product images are shown with a remove button

#### Scenario: Images can be added or removed
- **WHEN** an admin adds new images or removes existing ones
- **THEN** the product's `images` JSONB array is updated accordingly

### Requirement: Admin can delete a product
The system SHALL allow admins to delete a product with a confirmation dialog.

#### Scenario: Product deleted
- **WHEN** an admin confirms deletion
- **THEN** the product is removed from the database (cart items and order items reference it via ON DELETE)

### Requirement: Admin can toggle product active status
The system SHALL allow admins to toggle a product's active/inactive status directly from the list.

#### Scenario: Toggle from list
- **WHEN** an admin clicks the active badge on a product row
- **THEN** the `is_active` field toggles
