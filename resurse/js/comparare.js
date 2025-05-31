document.addEventListener("DOMContentLoaded", () => {
    const MAX_PRODUSE = 2;
    const TIMP_EXPIRARE = 24 * 60 * 60 * 1000;
    const acum = Date.now();
    const ultimaActiune = parseInt(localStorage.getItem("ultima_actiune_comparare") || "0");

    // Ștergere dacă a expirat sesiunea
    if (acum - ultimaActiune > TIMP_EXPIRARE) {
        localStorage.removeItem("produse_comparate");
        localStorage.removeItem("ultima_actiune_comparare");
    }

    let produse = JSON.parse(localStorage.getItem("produse_comparate") || "[]");

    if (produse.length > 0) {
        afiseazaContainer(produse);
    }
    actualizeazaButoane(produse);

    document.querySelectorAll(".btn-compara").forEach(btn => {
        const nume = btn.dataset.nume;

        btn.addEventListener("click", () => {
            produse = JSON.parse(localStorage.getItem("produse_comparate") || "[]");

            // Verificare dacă produsul este deja adăugat sau limita a fost atinsă
            if (produse.some(p => p.nume === nume) || produse.length >= MAX_PRODUSE) return;

            const produs = {
                nume,
                pret: btn.dataset.pret,
                material: btn.dataset.material,
                gramaj: btn.dataset.gramaj,
                categorie: btn.dataset.categorie
            };

            produse.push(produs);
            localStorage.setItem("produse_comparate", JSON.stringify(produse));
            localStorage.setItem("ultima_actiune_comparare", Date.now().toString());

            if (!document.getElementById("container-comparare")) {
                afiseazaContainer(produse);
            } else {
                actualizeazaContainer(produse);
            }

            actualizeazaButoane(produse);
        });
    });

    function actualizeazaButoane(produse) {
        const dejaSelectate = produse.map(p => p.nume);
        const disableRest = produse.length >= MAX_PRODUSE;

        document.querySelectorAll(".btn-compara").forEach(btn => {
            const esteSelectat = dejaSelectate.includes(btn.dataset.nume);
            btn.disabled = esteSelectat || disableRest;
            btn.title = (!esteSelectat && disableRest) ? "Ștergeți un produs din lista de comparare" : "";
        });
    }

    function afiseazaContainer(produse) {
        const container = document.createElement("div");
        container.id = "container-comparare";
        Object.assign(container.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#fff",
            border: "1px solid #000",
            padding: "12px",
            zIndex: "1000"
        });
        document.body.appendChild(container);
        actualizeazaContainer(produse);
    }

    function actualizeazaContainer(produse) {
        const container = document.getElementById("container-comparare");
        container.innerHTML = "<strong>Produse selectate:</strong>";

        produse.forEach(p => {
            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.marginTop = "6px";

            item.innerHTML = `
                <span>${p.nume}</span>
                <button data-nume="${p.nume}" style="margin-left: 8px;">x</button>
            `;

            item.querySelector("button").addEventListener("click", () => {
                produse = produse.filter(prod => prod.nume !== p.nume);
                localStorage.setItem("produse_comparate", JSON.stringify(produse));
                localStorage.setItem("ultima_actiune_comparare", Date.now().toString());

                if (produse.length === 0) {
                    localStorage.removeItem("produse_comparate");
                    localStorage.removeItem("ultima_actiune_comparare");
                    container.remove();
                } else {
                    actualizeazaContainer(produse);
                }
                actualizeazaButoane(produse);
            });

            container.appendChild(item);
        });

        if (produse.length === MAX_PRODUSE) {
            const btnAfiseaza = document.createElement("button");
            btnAfiseaza.textContent = "Afișează";
            btnAfiseaza.style.marginTop = "10px";
            btnAfiseaza.addEventListener("click", () => afiseazaTabel(produse));
            container.appendChild(btnAfiseaza);
        }
    }

    function afiseazaTabel(produse) {
        const caracteristici = [
            { eticheta: "Pret", cheie: "pret" },
            { eticheta: "Material", cheie: "material" },
            { eticheta: "Gramaj", cheie: "gramaj" },
            { eticheta: "Categorie", cheie: "categorie" }
        ];

        const fereastra = window.open("", "_blank");
        const html = `
            <html>
            <head>
            <title>Comparare Produse</title>
            <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    background-color:rgb(255, 161, 206);
                    padding: 20px;
                    color:#333;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                th, td {
                    padding: 15px;
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    color: #444;
                }
                tr:hover {
                    background-color: #f5f5f5;
                }
                @media (max-width: 600px) {
                    table, tr, td, th {
                        font-size: 14px;
                    }
                }
            </style>
            </head>
            <body>
                <h2>Comparare: ${produse[0].nume} vs ${produse[1].nume}</h2>
                <table border="1" cellpadding="10">
                    <tr>
                        <th>Caracteristică</th>
                        <th>${produse[0].nume}</th>
                        <th>${produse[1].nume}</th>
                    </tr>
                    ${caracteristici.map(c => `
                        <tr>
                            <td>${c.eticheta}</td>
                            <td>${produse[0][c.cheie]}</td>
                            <td>${produse[1][c.cheie]}</td>
                        </tr>`).join("")}
                </table>
            </body>
            </html>`;
        fereastra.document.write(html);
        fereastra.document.close();
    }
});
