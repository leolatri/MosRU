-- Up Migration
CREATE TABLE administrative_okrugs (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT administrative_okrugs_code_unique UNIQUE (code),
    CONSTRAINT administrative_okrugs_code_not_blank CHECK (btrim(code) <> '')
);


CREATE TABLE districts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    okrug_id integer NOT NULL,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT districts_okrug_fk
        FOREIGN KEY (okrug_id)
        REFERENCES administrative_okrugs(id)
        ON DELETE RESTRICT,
    CONSTRAINT districts_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT districts_okrug_name_unique UNIQUE (okrug_id, name)
);


CREATE TABLE object_categories (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT object_categories_name_unique UNIQUE (name),
    CONSTRAINT object_categories_name_not_blank CHECK (btrim(name) <> '')
);


CREATE TABLE problem_topics (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT problem_topics_name_unique UNIQUE (name),
    CONSTRAINT problem_topics_name_not_blank CHECK (btrim(name) <> '')
);


CREATE TABLE category_problem_topics (
    object_category_id integer NOT NULL,
    problem_topic_id integer NOT NULL,

    CONSTRAINT category_problem_topics_pk PRIMARY KEY (object_category_id, problem_topic_id),
    CONSTRAINT category_problem_topics_category_fk
        FOREIGN KEY (object_category_id)
        REFERENCES object_categories(id)
        ON DELETE RESTRICT,
    CONSTRAINT category_problem_topics_topic_fk
        FOREIGN KEY (problem_topic_id)
        REFERENCES problem_topics(id)
        ON DELETE RESTRICT
);


CREATE TABLE response_statuses (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT response_statuses_name_unique UNIQUE (name),
    CONSTRAINT response_statuses_name_not_blank CHECK (btrim(name) <> '')
);


CREATE TABLE violations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_message_id bigint NOT NULL,
    application_number bigint NOT NULL,
    publication_date date NOT NULL,
    district_id integer,
    object_name text NOT NULL,
    object_category_id integer NOT NULL,
    problem_topic_id integer NOT NULL,
    response_deadline date,
    response_status_id integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT violations_source_message_id_unique UNIQUE (source_message_id),
    CONSTRAINT violations_application_number_unique UNIQUE (application_number),
    CONSTRAINT violations_source_message_id_positive CHECK (source_message_id > 0),
    CONSTRAINT violations_application_number_positive CHECK (application_number > 0),
    CONSTRAINT violations_object_name_not_blank CHECK (btrim(object_name) <> ''),
    CONSTRAINT violations_district_fk
        FOREIGN KEY (district_id)
        REFERENCES districts(id)
        ON DELETE RESTRICT,
    CONSTRAINT violations_category_topic_fk
        FOREIGN KEY (object_category_id, problem_topic_id)
        REFERENCES category_problem_topics(
            object_category_id,
            problem_topic_id
        )
        ON DELETE RESTRICT,
    CONSTRAINT violations_response_status_fk
        FOREIGN KEY (response_status_id)
        REFERENCES response_statuses(id)
        ON DELETE RESTRICT,
    CONSTRAINT violations_response_deadline_check
        CHECK (
            response_deadline IS NULL
            OR response_deadline >= publication_date
        )
);


CREATE TABLE users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,

    CONSTRAINT users_email_not_blank CHECK (btrim(email) <> ''),
    CONSTRAINT users_password_hash_not_blank CHECK (btrim(password_hash) <> '')
);

CREATE UNIQUE INDEX users_email_lower_unique_idx ON users (lower(email));
CREATE INDEX violations_publication_date_idx ON violations (publication_date);
CREATE INDEX violations_district_id_idx ON violations (district_id);
CREATE INDEX violations_response_status_id_idx ON violations (response_status_id);
CREATE INDEX violations_category_topic_idx ON violations (object_category_id, problem_topic_id);
CREATE INDEX violations_response_deadline_idx ON violations (response_deadline);


-- Down Migration
DROP TABLE users;
DROP TABLE violations;
DROP TABLE response_statuses;
DROP TABLE category_problem_topics;
DROP TABLE problem_topics;
DROP TABLE object_categories;
DROP TABLE districts;
DROP TABLE administrative_okrugs;