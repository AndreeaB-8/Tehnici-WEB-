const express= require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");


const pg = require("pg");     //pt BAZA DE DATE
const Client=pg.Client;

client=new Client({
    database:"proiect",
    user:"andreea",
    password:"andreea",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from bijuterii", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categ_bijuterii))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})



app= express();

console.log("Calea proiectului:",__dirname);
console.log("Calea fisierului index.js:",__filename);
console.log("Calea folderului de lucru:",process.cwd());

app.set("view engine", "ejs")

obGlobal = {
    obErori:null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: null
}
// preia valorile enum din baza de date și a le pune în obGlobal.optiuniMeniu
client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezultat ){
    console.log(err)    
    console.log("Tipuri produse: ", rezultat)
    obGlobal.optiuniMeniu=rezultat.rows;
})



vect_foldere = ["temp", "backup", "temp1"]
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if (! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}


function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){   //daca nu s-a dat calea, se genereaza automat
        let numeFisExt=path.basename(caleScss); //am luat numele fisierului scss
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; //se genereaza calea css din cea scss
    }
    
    if (!path.isAbsolute(caleScss)) //convertim la cai absolute daca sunt relative, atat pt scss cat si pt css
        caleScss=path.join(obGlobal.folderScss,caleScss )   //calea absoluta catre fisierul scss
    if (!path.isAbsolute(caleCss))  //am verificat daca calea este absoluta
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    //crearea folderului de backup
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css"); //se construieste calea pt folderul de backup
    if (!fs.existsSync(caleBackup)) {   //daca nu exista, il creeaza
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si caleCss
    //Face backup pentru fișierul CSS existent
    let numeFisCss=path.basename(caleCss);  //daca fisierul css exista, este copiat in folderul de backup
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))   // +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true}); //compilam fisierul scss 
    fs.writeFileSync(caleCss,rez.css)   //scrie fisierul rez.css in caleCss
}

//compileazaScss("a.scss");
//vFisiere = un array cu numele fisierelor
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){    //verif. daca extensia este scss
        compileazaScss(numeFis);
    }
}

//compilare pe parcurs
//la modificarea/crearea unui fișier acesta va fi compilat automat în css
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){ 
    console.log(eveniment, numeFis);    //afiseaza ce tip de enveniment s-a intamplat
    if (eveniment=="change" || eveniment=="rename"){    //daca s-a modificat sau adaugat un fisier
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);   //construieste calea completa catre fisierul modificat/adaugat
        if (fs.existsSync(caleCompleta)){   //daca fisierul inca exista
            compileazaScss(caleCompleta);   //il compilam din nou
        }
    }
})




function initErori(){
    /* citeste json-ul cu erorile si creeaza un obiect cu datele erorilor */
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut) /* salvam obiectul in proprietatea obErori a variabilei obGlobal */
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){    /*pentru fiecare eroare */
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine) /*setam calea absoluta */
    }
    console.log(obGlobal.obErori)
}
initErori()


//pentru galeria de poze
function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);        /*se citeste fisierul json cu imaginile */
    let vImagini=obGlobal.obImagini.imagini;   

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);  //calea absoluta catre fisierul original

        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);

        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(100).toFile(caleFisMicAbs);

        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
    console.log(obGlobal.obImagini)
}
initImagini();


function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){ /*daca se specifica identificatorul */
        if(eroare.status)   /*se preiau datele din json pentru afisarea erorii */
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;  /*daca titlul e dat ca argument, se afiseaza el, nu cel din json */
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{   /*daca nu se specifica ident. */
        var err=obGlobal.obErori.eroare_default /*se afiseaza o eroare */
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}



app.use("/*", function(req, res, next){ /*pt a putea folosi variabila obGlobal in paginile renderizate */
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    next(); //ca sa mearga mai departe
})

app.use("/resurse", express.static(path.join(__dirname,"resurse"))) /*pentru a merge CSS-ul*/
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))

app.get("/cerere", function(req, res){  /*cand scriem .../cerere, se afiseaza textul */
    res.send("<p style='color:blue'>Buna seara!</p>");
})
app.get("/fisier", function(req, res){ /*cand scriem .../fisier, serverul trimite direct fisierul package.json */
    res.sendFile(path.join(__dirname,"package.json"));
})
app.get("/istoric", function(req, res){ /* ... */
    res.render("pagini/istoric");
})


/*galerie statica in pagina galerie_statica */
app.get("/galerie_statica", function(req, res){
    res.render("pagini/galerie_statica", {
        imagini: obGlobal.obImagini.imagini  // sau orice obiect ai folosit și la index
    });
})




app.get(["/","/home","/index"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.obImagini.imagini});
})



//pt seturi
app.get("/seturi", async (req, res) => {
    
  try {
    const { rows: seturi } = await client.query(`
      SELECT 
        s.id, 
        s.nume_set, 
        s.descriere_set, 
        json_agg(p.*) AS produse,
        SUM(p.pret) AS pret_total,
        COUNT(p.id) AS nr_produse,
        SUM(p.pret) * (1 - LEAST(5, COUNT(p.id)) * 0.05) AS pret_set_reducere
      FROM seturi s
      LEFT JOIN asociere_set a ON s.id = a.id_set
      LEFT JOIN bijuterii p ON a.id_produs = p.id
      GROUP BY s.id, s.nume_set, s.descriere_set
      ORDER BY s.id;
    `);

    res.render("pagini/seturi", { seturi });
  } catch (err) {
    console.error("Eroare la seturi:", err.stack || err);
    res.status(500).send("Eroare la încărcarea seturilor");
  }
});




//pt pagina de produse
app.get("/produse", function(req, res){

    //req.query e un obiect care conține toate datele din partea de după ? din URL.
    console.log(req.query)  //afiseaza in consola toti parametrii din query
    var conditieQuery="";
     
    if (req.query.tip){ //filtram produsele dupa tipul de produs
        conditieQuery = ` where tip_produs = '${req.query.tip}'`
    }

    // categ_bijuterii => enum
    //enum_range = functie
    //unest = desparte array-ul in linii
    queryOptiuni="select * from unnest(enum_range(null::categ_bijuterii))"  //extragem toate valorile din categ_bijuterii(inele, cercei, ...)
    client.query(queryOptiuni, function(err, rezOptiuni){
        console.log(rezOptiuni)

        queryProduse="select * from bijuterii" + conditieQuery  //selectam doar produsele de tipul x 
        
        client.query(queryProduse, function(err, rez){
            if (err){
                console.log(err);
                afisareEroare(res, 2);  //se afiseaza fct de identif. a unei erori cu identificatorul 2
            }
            else{
                //trimitem aceste inf catre pagina produse.ejs
                res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
            }
        })
    });
})

//pt pagina produsului
app.get("/produs/:id", async function(req, res){ 
    try{
        const prodId = req.params.id;   
        const { rows: produse, rowCount } = await client.query(`SELECT * FROM bijuterii WHERE id = $1`, [prodId]);  //selectam produsul dupa id-ul dat in url

        if(rowCount == 0) {
            afisareEroare(res, 404);
        }

        const prod = produse[0];    //produsul selectat dupa id-ul dat in url
        //cautam seturile in care se afla produsul
        const { rows: seturi } = await client.query(`   
            SELECT
                s.id,
                s.nume_set,
                s.descriere_set,
                json_agg(p2.*) AS produse,
                SUM(p2.pret) AS pret_total,
                COUNT(p2.id) AS nr_produse,
                SUM(p2.pret) * (1 - LEAST(5, COUNT(p2.id)) * 0.05) AS pret_set_reducere
            FROM seturi s
            JOIN asociere_set a ON s.id = a.id_set
            JOIN bijuterii p2 ON a.id_produs = p2.id
            WHERE s.id IN (
                SELECT id_set FROM asociere_set WHERE id_produs = $1
            )
            GROUP BY s.id, s.nume_set, s.descriere_set;
    `, [prodId]);

        res.render("pagini/produs", { prod, seturi });  
    }
    catch(err){
        console.log(err);
        afisareEroare(res, 2);
    }
})





app.get(/\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res, 403);
})

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
})

app.get("/*.ejs", function(req, res, next){ /* daca pagina ceruta nu exista, se va afisa eroarea */
    afisareEroare(res, 400);
});




app.get("/*", function(req, res, next){
    try{ /*trateaza orice cerere de forma /pagina*/
        res.render("pagini" + req.url, function(err, rezultatRandare){
            if(err){    /*daca e eroare*/
                console.log(err);
                if(err.message.startsWith("Failed to lookup view")){    /*dc mesajul erorii incepe cu "Failed..."*/
                    afisareEroare(res, 404);    /*daca pg nu exista, afisam eroarea 404*/
                }
                else{
                    afisareEroare(res);
                }
            }
            else{   /*daca nu e eroare*/
                console.log(rezultatRandare);
                res.send(rezultatRandare);
            }
        }) 
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res, 404);
        }
        else{
            afisareEroare(res);
        }
    }
})



app.listen(8080);
console.log("Serverul a pornit")


// STERGERE AUTOMATA BACKUP
const T = 1; // numar de minute
const MILISECUNDE = 60 * 1000;

setInterval(() => {
    const caleBackup = obGlobal.folderBackup;   //calea catre fisierul de backup
    const limita = Date.now() - T * MILISECUNDE;    //stabilim cta de vechi tb sa fie fisierele pt a le sterge

    function stergeVeche(dir) {
        //citim continutul directorului si inf. despre tipul fiecarui element
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {

            if (err) return;    // daca e eroare, iesim din functie
            files.forEach(file => { // pentru fiecare element din director
                const caleFis = path.join(dir, file.name);  // construim calea completa a fisierului

                if (file.isDirectory()) {   //daca elementul e un folder
                    stergeVeche(caleFis);   //apelam recursiv functia pentru a verifica si sterge fisierele din subfoldere
                } 

                else {  //daca elementul e un fisier
                    fs.stat(caleFis, (err, stats) => {  //obtinem data ultimei modificari
                        if (err) return;
                        if (stats.mtimeMs < limita) {   // daca fisierul este mai vechi decat limita stabilita
                            fs.unlink(caleFis, err => { // stergem fisierul
                                if (!err) console.log("Sters:", caleFis);   //mesaj in consola
                            });
                        }
                    });
                }
            });
        });
    }

    stergeVeche(caleBackup);    // apelam functia pentru a incepe stergerea fisierelor vechi
}, 1 * MILISECUNDE); // functia se ruleaza o data la fiecare minut
