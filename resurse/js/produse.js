window.onload = function(){ //cand s-a incarcat fereastra
    function eliminaDiacritice(text) {
        const diacritice = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ş': 's', 'ț': 't', 'ţ': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ş': 'S', 'Ț': 'T', 'Ţ': 'T'
        };
        return text.replace(/[ăâîșşțţĂÂÎȘŞȚŢ]/g, c => diacritice[c] || c).toLowerCase();
    }
    
    //FILTRARE PRODUSE
    btn = document.getElementById("filtrare");  //selectez butonul filtrare din pagina 

    btn.onclick = function(){
        
        let checkboxesPret = document.querySelectorAll('input[name="pret"]:checked');
        let intervalePret = Array.from(checkboxesPret).map(cb => cb.value);  // ex: ["0:200", "200:600"]

        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()    //preiau numele introdus de utilizator
        let inpGramaj = document.getElementById("inp-gramaj").value  //preiau gramajul introdus de utilizator
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase()
        let inpMaterial = document.getElementById("inp-material").value.trim().toLowerCase()    //preiau materialul introdus de utilizator, daca este selectat
        
        //VALIDARE: nu permitem cifre in nume
        if (/[0-9]/.test(inpNume)) {
            alert("Numele nu trebuie sa contina cifre.");
            return;
        }


        let produse = document.getElementsByClassName("produs")
        
        for(let prod of produse){   //pt fiecare produs sa preiau numele
            
            prod.style.display = "none";    //aici se ascund produsele care nu se potrivesc cu filtrarea
            
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()    //preiau numele produsului
            let cond1 = (eliminaDiacritice(nume).startsWith(eliminaDiacritice(inpNume)))    //verific daca numele produsului incepe cu numele introdus de utilizator

            let gramaj = parseFloat(prod.getElementsByClassName("val-gramaj")[0].innerHTML.trim())
            let cond2 = (inpGramaj <= gramaj)   
            
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if(intervalePret.length === 0) cond3 = true;
            else
            {
                for(let interval of intervalePret) {
                    let [min, max] = interval.split(":").map(Number);
                    if (pret >= min && pret <= max) {
                        cond3 = true
                        break;
                    } 
                    else {
                        cond3 = false;
                    }
                }
            }

            let categorie=prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase()
            let cond4 =  (inpCategorie == "toate" || inpCategorie == categorie) //verific daca categoria introdusa de utilizator este "toate" sau daca este egala cu categoria produsului

            let material = prod.getElementsByClassName("val-material")[0].innerHTML.trim().toLowerCase()   //preiau materialul produsului
            let cond5 = (inpMaterial == "" || inpMaterial == material); //verific daca materialul introdus de utilizator este gol sau daca este egal cu materialul produsului

            if (cond1 && cond2 && cond3 && cond4 && cond5) {  //daca toate conditiile sunt adevarate
                prod.style.display="block";     //daca toate conditiile sunt adevarate, afisez produsul
            }
        }


        //verificam daca s-a afisat vreun produs
        let produseVizibile = Array.from(produse).filter(p => p.style.display != "none");   ///preiau produsele care sunt vizibile
        if (produseVizibile.length == 0) {
            alert("Nu exista produse conform filtrarii curente.");
        }
    }


    //pt selectarea gramajului minim
    document.getElementById("inp-gramaj").onchange = function(){
        document.getElementById("val-curenta-gramaj").innerHTML = `(${this.value})`
    }



    //pt butonul de resetare
    document.getElementById("resetare").onclick = function(){

        if(confirm("Sigur doriti sa resetati filtrele?")){
            
            //resetam filtrele
            document.getElementById("inp-nume").value = ""
            document.getElementById("inp-gramaj").value = 0
            document.getElementById("val-curenta-gramaj").innerHTML = "(0)"
            document.getElementById("inp-categorie").value = "toate"
            document.getElementById("inp-material").value = ""

            document.querySelectorAll('input[name="pret"]').forEach(cb => cb.checked = false);  //pret

            let produse = document.getElementsByClassName("produs")
            for(let prod of produse){
                prod.style.display="block"
            }
        }
    }

    

    //pt butonul de sortare
    //se sorteaza dupa pret prima data, si dupa dupa nume
    document.getElementById("sortCrescNume").onclick = function(){
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()
        
        if (/[0-9]/.test(inpNume)) {
            alert("Numele nu trebuie sa contina cifre pentru a sorta.");
            return;
        }
        sorteaza(1)
    }


    document.getElementById("sortDescrescNume").onclick = function(){
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()
        
        if (/[0-9]/.test(inpNume)) {
            alert("Numele nu trebuie sa contina cifre pentru a sorta.");
            return;
        }
        sorteaza(-1)
    }

    function sorteaza(semn){
        let produse = document.getElementsByClassName("produs")
        let vProduse = Array.from(produse) //transform in array
        
        vProduse.sort(function(a,b){    //a si b sunt <article>
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if (pretA != pretB) return semn * (pretA - pretB)

            //preturile sunt egale
            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            return semn*numeA.localeCompare(numeB)
        })

        for(let prod of vProduse){
            prod.parentNode.appendChild(prod) //adaug in ordinea sortata
        }
    }

    

    //ALT + C pentru a calcula suma preturilor produselor vizibile
    window.onkeydown = function(e){
        console.log(e)
        if (e.key == "c" && e.altKey){
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()
            
            //VALIDARE: nu permitem cifre in nume
            if (/[0-9]/.test(inpNume)) {
                alert("Numele nu trebuie sa contina cifre.");
                return;
            }

            let produse = document.getElementsByClassName("produs") //preiau toate produsele
            let sumaPreturi = 0

            for(let prod of produse){
                if(prod.style.display != "none"){   //produsul este vizibil
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())  //preiau pretul produsului
                    sumaPreturi += pret
                }
            }

            if (!document.getElementById("suma_preturi")){
                let divRezultat = document.createElement("div") //creez un div pentru a afisa suma preturilor
                divRezultat.innerHTML = `Suma prețurilor: ${sumaPreturi.toFixed(2)} lei`   
                divRezultat.id = "suma_preturi"
                
                // Stilizare pentru pozitie fixa
                divRezultat.style.position = "fixed";
                divRezultat.style.bottom = "20px";
                divRezultat.style.right = "20px";
                divRezultat.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                divRezultat.style.color = "white";
                divRezultat.style.padding = "10px 20px";
                divRezultat.style.borderRadius = "8px";
                divRezultat.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
                divRezultat.style.fontSize = "16px";
                divRezultat.style.zIndex = "9999";


                document.body.appendChild(divRezultat) //il adaug in body

                setTimeout(function(){
                    let div = document.getElementById("suma_preturi")
                    if(div)
                        div.remove() //daca exista, il sterg
                }, 2000)
            }
        }
    }







    window.addEventListener("load", function () {
        const textarea = document.getElementById("textarea-mesaj");
// daca utilizatorul scrie mai putin de 10 caractere, primeste clasa is-invalid. 
// daca scrie destul, se scoate acea clasa si se adauga is-valid.
        function valideazaTextarea() {
            const valoare = textarea.value.trim();

            if (valoare.length < 10) {
                textarea.classList.add("is-invalid");
                textarea.classList.remove("is-valid");
            } 
            else
            {
                textarea.classList.remove("is-invalid");
                textarea.classList.add("is-valid");
            }
        }
        
        //de fiecare data cand scriu sau modific ceva, se apeleaza functia de validare
        textarea.addEventListener("input", valideazaTextarea);
    });



    //PAGINARE
    window.afiseazaPagina = function(P) {
    const K = 4; // produse per pagina
    const produse = document.querySelectorAll('#produse .produs');  // selectam toate produsele(lista) - elementele .produs care sunt în interiorul containerului #produse
    //#produse = id-ul div-ului care contine produsel
    //spatiu = relatie parinte - copil
    
    const N = produse.length; 
    const start = (P - 1) * K;  // indexul primului produs de pe pagina P
    const end = P * K - 1;  // indexul ultimului produs de pe pagina P

    produse.forEach((produs, index) => {
        produs.style.display = (index >= start && index <= end) ? '' : 'none';  // afisam doar produsele din intervalul curent
    }); 

    document.querySelectorAll('#paginare button').forEach((btn, idx) => {   //idx este indexul butonului în listă, adică poziția lui, începând de la 0.
        btn.classList.toggle('active', idx + 1 === P);  // adaugam clasa active butonului corespunzator paginii curente
    });
    };

    // La inceput afiseaza pagina 1
    window.afiseazaPagina(1);



    //cel mai mic pret
    document.getElementById("btn-minim").onclick = function() {
    let produse = document.getElementsByClassName("produs");

    let minProd = null;
    let minPret = Infinity;

    for (let prod of produse) {
        if (prod.style.display != "none") {
        let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            if (pret < minPret) {
                minPret = pret;
                minProd = prod;
            }
        }
    }

    if (minProd) {
        alert(`Produsul cu cel mai mic pret: ${minProd.getElementsByClassName("val-nume")[0].innerHTML.trim()} - ${minPret} lei`);
    } else {
        alert("Nu exista produse vizibile.");
    }
    };
    
}
