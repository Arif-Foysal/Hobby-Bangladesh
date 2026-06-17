## ADDED Requirements

### Requirement: Product images bucket exists
The system SHALL have a Supabase Storage bucket named `products` for storing product images.

#### Scenario: Bucket is created and accessible
- **WHEN** querying Supabase Storage for the `products` bucket
- **THEN** the bucket exists and is ready for uploads

#### Scenario: Bucket is not publicly listable
- **WHEN** an unauthenticated request lists files in the `products` bucket
- **THEN** the request is rejected

### Requirement: Admin-only upload access
The system SHALL restrict image uploads to the `products` bucket to authenticated admin users only.

#### Scenario: Admin can upload an image
- **WHEN** an authenticated admin uploads a file to the `products` bucket
- **THEN** the upload succeeds and returns the public URL

#### Scenario: Customer cannot upload an image
- **WHEN** an authenticated customer attempts to upload a file to the `products` bucket
- **THEN** the upload is rejected with an authorization error

#### Scenario: Public can read images
- **WHEN** a public request accesses a file URL in the `products` bucket
- **THEN** the image is served successfully

### Requirement: Image file validation
The system SHALL validate uploaded images for type (JPEG, PNG, WebP) and size (max 5MB) before storing.

#### Scenario: Valid image is accepted
- **WHEN** an admin uploads a 2MB PNG file
- **THEN** the upload succeeds

#### Scenario: Invalid file type is rejected
- **WHEN** an admin attempts to upload a PDF file
- **THEN** the upload is rejected with a file type error

#### Scenario: Oversized file is rejected
- **WHEN** an admin attempts to upload a 10MB image
- **THEN** the upload is rejected with a file size error
