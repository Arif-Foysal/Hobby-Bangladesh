## ADDED Requirements

### Requirement: Customer can view product detail
The system SHALL display a product detail page at `/products/[slug]` with full product information.

#### Scenario: Product page renders
- **WHEN** a visitor navigates to `/products/[slug]`
- **THEN** the page shows product images, name, price, compare-at price, description, stock status, and add-to-cart button

#### Scenario: 404 for inactive or missing products
- **WHEN** a visitor navigates to a product that does not exist or is inactive
- **THEN** a 404 page is shown

### Requirement: Product images displayed in gallery
The system SHALL display product images in a gallery with thumbnail navigation.

#### Scenario: Multiple images
- **WHEN** a product has multiple images
- **THEN** the first image is shown large, with thumbnails below for navigation

#### Scenario: Single image
- **WHEN** a product has one image
- **THEN** the image is shown without thumbnails

### Requirement: Product shows stock status
The system SHALL display stock availability based on `stock_qty`.

#### Scenario: In stock
- **WHEN** `stock_qty > 0`
- **THEN** "In Stock" is shown in green

#### Scenario: Out of stock
- **WHEN** `stock_qty = 0`
- **THEN** "Out of Stock" is shown in red and the add-to-cart button is disabled

### Requirement: Add-to-cart button present
The system SHALL display an add-to-cart button on the product detail page.

#### Scenario: Add to cart clicked
- **WHEN** a visitor clicks "Add to Cart"
- **THEN** the product is added to their cart (cart implementation in Phase 3 — for now, button exists but action is placeholder)

### Requirement: Product shows category breadcrumb
The system SHALL show the product's category as a breadcrumb above the product name.

#### Scenario: Category breadcrumb
- **WHEN** a product has a category
- **THEN** a breadcrumb shows: Products > [Category Name] > [Product Name]
