window.addEventListener("load", function() 
{ //cand s-a incarcat fereastra
    document.getElementById("schimba-tema").onclick = function() {
        //toggle => adauga sau elimina clasa "dark" din body
        if (document.body.classList.toggle("dark")) {
            localStorage.setItem("tema", "dark")
        }
        else{
            localStorage.removeItem("tema")
        }
    }
})