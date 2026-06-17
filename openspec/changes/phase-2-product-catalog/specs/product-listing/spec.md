## ADDED Requirements

### Requirement: Customer can browse products
The system SHALL display a product listing page at `/products` showing active products in a responsive grid.

#### Scenario: Products displayed in grid
- **WHEN** a visitor navigates to `/products`
- **THEN** active products are displayed in a responsive grid (2 columns mobile, 3 tablet, 4 desktop)

#### Scenario: Each product card shows key info
- **WHEN** viewing a product card
- **THEN** it shows the first image, product name, price, and compare-at price (if set, with strikethrough)

### Requirement: Customer can filter by category
The system SHALL allow filtering products by category via a sidebar or dropdown.

#### Scenario: Category filter applied
- **WHEN** a visitor selects a category
- **THEN** only products in that category are shown

#### Scenario: All categories option
- **WHEN** the category filter is set to "All"
- **THEN** all active products are shown

### Requirement: Customer can search products
The system SHALL allow searching products by name via a search input.

#### Scenario: Search by name
- **WHEN** a visitor types a search query
- **THEN** products whose name contains the query (case-insensitive) are shown

### Requirement: Customer can sort products
The system SHALL allow sorting products by price (low to high, high to low) and newest first.

#### Scenario: Sort by price low-high
- **WHEN** a visitor selects "Price: Low to High"
- **THEN** products are sorted by `price ASC`

#### Scenario: Sort by newest
- **WHEN** a visitor selects "Newest"
- **THEN** products are sorted by `created_at DESC`

### Requirement: Products are paginated
The system SHALL paginate the product listing with 12 products per page.

#### Scenario: Pagination controls shown
- **WHEN** there are more than 12 products
- **THEN** pagination controls appear at the bottom

#### Scenario: Page navigation
- **WHEN** a visitor clicks page 2
- **THEN** the next 12 products are shown
