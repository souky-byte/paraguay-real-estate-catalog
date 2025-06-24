-- Create the properties table
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR PRIMARY KEY,
    title TEXT NOT NULL,
    price BIGINT,
    currency VARCHAR(10),
    m2 INTEGER,
    link TEXT,
    address TEXT,
    description_short TEXT,
    reference_code VARCHAR(50),
    property_type VARCHAR(50),
    zone VARCHAR(100),
    description_full TEXT,
    bathrooms TEXT,
    bedrooms TEXT,
    garages TEXT,
    year_built TEXT,
    built_area_m2 TEXT,
    image_urls TEXT[], -- Array of image URLs
    price_per_sqm_avg_price TEXT,
    price_per_sqm_diff_percent TEXT,
    sale_price_avg_price TEXT,
    sale_price_diff_percent TEXT,
    publication_time_avg TEXT,
    publication_time_diff_percent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(zone);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_m2 ON properties(m2);
CREATE INDEX IF NOT EXISTS idx_properties_sold ON properties(sold);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
