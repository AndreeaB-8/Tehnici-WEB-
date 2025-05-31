DROP TABLE IF EXISTS prajituri;
DROP TYPE IF EXISTS categ_bijuterii;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_bijuterii AS ENUM( 'comanda speciala', 'aniversara', 'editie limitata', 'pentru copii', 'unicat','comuna');
CREATE TYPE tipuri_produse AS ENUM('coliere', 'bratari', 'inele', 'cercei');


CREATE TABLE IF NOT EXISTS bijuterii (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(10,2) NOT NULL CHECK(pret >= 0),
   material_principal VARCHAR(100),
   gramaj INT NOT NULL CHECK (gramaj>=0),   
   tip_produs tipuri_produse,
   categorie categ_bijuterii DEFAULT 'comuna',
   pietre_pretioase VARCHAR[],
   personalizabila BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

-- CERCEI
INSERT INTO bijuterii (nume, descriere, pret, material_principal, gramaj, tip_produs, categorie, pietre_pretioase, personalizabila, imagine) VALUES
('Cercei Emma', 'Cercei din argint cu finisaj lucios, ideali pentru ținute elegante sau casual.', 220.00, 'Argint 925', 9, 'cercei', 'comuna', '{}', FALSE, 'cercei-emma.jpg'),

('Cercei Alexandra', 'Cercei din aur galben cu pietre de zirconiu, stil clasic.', 450.00, 'Aur 14K', 11, 'cercei', 'aniversara', '{"zirconiu"}', FALSE, 'cercei-alexandra.jpg'),

('Cercei Victoria', 'Cercei lungi din aur alb, potriviți pentru ocazii speciale.', 720.00, 'Aur alb 18K', 14, 'cercei', 'editie limitata', '{"topaz"}', FALSE, 'cercei-victoria.jpg'),

-- INELE
('Inel Laura', 'Inel cu un design subtil, realizat din argint și zirconiu transparent.', 190.00, 'Argint 925', 10, 'inele', 'comuna', '{"zirconiu"}', FALSE, 'inel-laura.jpg'),

('Inel Cristina', 'Inel cu safir natural, montat în aur galben, perfect pentru un cadou.', 980.00, 'Aur 18K', 13, 'inele', 'aniversara', '{"safir"}', FALSE, 'inel-cristina.jpg'),

('Inel Adriana', 'Inel personalizabil, cu spațiu pentru gravură interioară.', 240.00, 'Argint 925', 12, 'inele', 'comanda speciala', '{}', TRUE, 'inel-adriana.jpg'),

-- COLIERE
('Colier Elena', 'Colier fin din aur galben, cu un pandantiv delicat în formă de inimă.', 680.00, 'Aur alb 18K', 42, 'coliere', 'editie limitata', '{}', FALSE, 'colier-elena.jpg'),

('Colier Gabriela', 'Colier din argint cu lanț subțire și pandantiv minimalist.', 280.00, 'Argint 925', 38, 'coliere', 'comuna', '{}', FALSE, 'colier-gabriela.jpg'),

('Colier Roxana', 'Colier elegant cu perlă naturală, perfect pentru ținute de seară.', 540.00, 'Argint 925', 48, 'coliere', 'aniversara', '{"perla"}', FALSE, 'colier-roxana.jpg'),

-- BRĂȚĂRI
('Brățară Ioana', 'Brățară clasică din aur galben, potrivită pentru purtare zilnică.', 390.00, 'Aur 14K', 26, 'bratari', 'comuna', '{}', FALSE, 'bratara-ioana.jpg'),

('Brățară Daniela', 'Brățară elegantă din argint cu pietre semiprețioase.', 310.00, 'Argint 925', 30, 'bratari', 'aniversara', '{"ametist", "cuart roz"}', FALSE, 'bratara-daniela.jpg'),

('Brățară Camelia', 'Brățară personalizabilă din oțel inoxidabil cu charm-uri interschimbabile.', 120.00, 'Oțel inoxidabil', 33, 'bratari', 'comanda speciala', '{}', TRUE, 'bratara-camelia.jpg');
