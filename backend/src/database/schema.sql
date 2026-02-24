CREATE TABLE IF NOT EXISTS users (
  user_id     SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  deleted_at  TIMESTAMP DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  patient_id  SERIAL PRIMARY KEY,
  user_id     INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  doctor_id    SERIAL PRIMARY KEY,
  user_id      INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  specialty    VARCHAR(100) NOT NULL DEFAULT 'General Practice',
  phone_number VARCHAR(20) DEFAULT NULL,
  address      TEXT DEFAULT NULL,
  deleted_at   TIMESTAMP DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id   SERIAL PRIMARY KEY,
  patient_id       INT NOT NULL REFERENCES patient_profiles(patient_id) ON DELETE CASCADE,
  doctor_id        INT NOT NULL REFERENCES doctor_profiles(doctor_id) ON DELETE CASCADE,
  appointment_time TIMESTAMP NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'canceled', 'completed')),
  deleted_at       TIMESTAMP DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE (patient_id, appointment_time)
);

CREATE TABLE IF NOT EXISTS doctor_ratings (
  rating_id      SERIAL PRIMARY KEY,
  doctor_id      INT NOT NULL REFERENCES doctor_profiles(doctor_id) ON DELETE CASCADE,
  patient_id     INT NOT NULL REFERENCES patient_profiles(patient_id) ON DELETE CASCADE,
  appointment_id INT NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  rating         INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (appointment_id)
);
