(function () {
    let urlDownload = 'https://serviciosjava2.afip.gob.ar/rcel/jsp/exportarComprobante.do?t=v&c=';

    // collect all ids

    //let facturasIds = Array.from(document.querySelectorAll('.jig_par td input[title*="Exportar las ventas"]'))
    //    .map((i, item) => i.onclick.toString().match(/\d+/)[0]);

    let facturasIds = Array.from(document.querySelectorAll('.jig_par td input[title*="Exportar las ventas"]'))
        .map((i, item) => i.getAttribute('onclick').toString().match(/\d+/)[0]);


    console.log(facturasIds);
    var zip = new JSZip();

    var a = document.createElement("a");

    console.log("por descargar los ids")

    function request(url, id) {
        return new Promise(function (resolve) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", url + id);
            httpRequest.responseType = "blob";
            httpRequest.onloadend = function () {
                zip.file(id + ".zip", this.response, { binary: true });

                resolve()
            }
            httpRequest.send()
        })
    }

    //var chromez = chrome;
    Promise.all(facturasIds.map(function (id) {
        console.log(urlDownload + id)
        return request(urlDownload, id)
    })).then(function () {
        zip.generateAsync({
            type: "blob"
        })
            .then(function (content) {
                const btn = document.querySelector("#contenido>input")
                a.download = "ventas-" + new Date().getTime();
                a.href = URL.createObjectURL(content);
                a.innerHTML = "<span> Descargar todas juntas </span>";

                document.querySelector("#contenido").insertBefore(a, btn)

            });
    })
})();