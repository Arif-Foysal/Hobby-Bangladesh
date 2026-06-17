## ADDED Requirements

### Requirement: Store settings singleton stores configuration
The system SHALL provide a `store_settings` table with `key` (text, unique) and `value` (jsonb) columns for storing store-wide configuration as key-value pairs.

#### Scenario: Setting is retrieved by key
- **WHEN** querying `store_settings` for key `"currency"`
- **THEN** the row returns with value `{"code": "BDT", "symbol": "৳", "position": "before"}`

#### Scenario: Missing setting returns null
- **WHEN** querying `store_settings` for a key that does not exist
- **THEN** no row is returned

#### Scenario: Only admin can modify store settings
- **WHEN** a customer attempts to INSERT or UPDATE `store_settings`
- **THEN** the operation is rejected by RLS

#### Scenario: Public can read store settings
- **WHEN** an unauthenticated visitor queries `store_settings`
- **THEN** the rows are returned (for public display of store name, currency, etc.)

### Requirement: Default store settings are seeded
The system SHALL insert default values for essential store settings when the migration runs.

#### Scenario: Currency defaults to BDT
- **WHEN** the migration script runs
- **THEN** a row with key `"currency"` and value `{"code": "BDT", "symbol": "৳", "position": "before"}` is inserted

#### Scenario: Tax rate defaults to 0%
- **WHEN** the migration script runs
- **THEN** a row with key `"tax"` and value `{"rate": 0, "label": "VAT"}` is inserted

#### Scenario: Shipping defaults are inserted
- **WHEN** the migration script runs
- **THEN** a row with key `"shipping"` and value containing `{"inside_dhaka": 0, "outside_dhaka": 0, "free_shipping_min": 0}` is inserted

### Requirement: Typed helper reads store settings
The system SHALL provide a typed `getStoreSetting(key)` helper that fetches a setting by key and returns it with the correct TypeScript type.

#### Scenario: Currency setting is typed
- **WHEN** calling `getStoreSetting('currency')`
- **THEN** the return type includes `code`, `symbol`, and `position` fields

#### Scenario: Setting is cached for the request duration
- **WHEN** calling `getStoreSetting('currency')` multiple times in the same request
- **THEN** only one database query is executed
