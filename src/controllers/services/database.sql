CREATE DATABASE fileserver;

CREATE TABLE users(
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  roles VARCHAR(255) 
);

CREATE TABLE file(
  file_id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL
);


--admin user
INSERT INTO users (user_name, user_email, user_password, roles) VALUES ('jackie', 'jackie213@gmail.com', 'chan8822', 'Admin');
