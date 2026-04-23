CREATE TABLE surahs (
    id SERIAL PRIMARY KEY,
    surah_number INT NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    revelation_type VARCHAR(20),
    verses_count INT NOT NULL
);

CREATE TABLE verses (
    id BIGSERIAL PRIMARY KEY,
    surah_id INT NOT NULL REFERENCES surahs(id),
    ayah_number INT NOT NULL,
    ayah_key VARCHAR(20) NOT NULL UNIQUE,
    text_uthmani TEXT,
    text_simple TEXT,
    page_number INT,
    juz_number INT,
    hizb_number INT,
    rub_number INT,
    sajdah_flag BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_surah_ayah UNIQUE (surah_id, ayah_number)
);

CREATE INDEX idx_verses_surah_id ON verses(surah_id);
CREATE INDEX idx_verses_ayah_key ON verses(ayah_key);