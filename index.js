const express= require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
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
    folderBackup: path.join(__dirname, "backup")
}

vect_foldere = ["temp", "backup", "temp1"]
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if (! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}



function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
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

    obGlobal.obImagini=JSON.parse(continut);
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
        let caleFisAbs=path.join(caleAbs,imag.fisier);

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



app.use("/resurse", express.static(path.join(__dirname,"resurse"))) /*pentru a merge CSS-ul*/
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))

app.get("/cerere", function(req, res){  /*cand scriem .../cerere, se afiseaza textul */
    res.send("<p style='color:blue'>Buna seara!</p>");
})
app.get("/fisier", function(req, res){ /*cand scriem .../fisier, serverul trimite direct fisierul package.json */
    res.sendfile(path.join(__dirname,"package.json"));
})
app.get("/istoric", function(req, res){ /* ... */
    res.render("pagini/istoric");
})


/*gakerie statica in pagina galerie_statica */
app.get("/galerie_statica", function(req, res){
    res.render("pagini/galerie_statica", {
        imagini: obGlobal.obImagini.imagini  // sau orice obiect ai folosit și la index
    });
})



// app.get(["/index/a"], function(req, res){
//     res.render("pagini/index");
// })
app.get(["/","/home","/index"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.obImagini.imagini});
})



app.get(/\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res, 403);
})

app.get("/favicon.ico", function(req, res){
    res.sendfile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
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


