function AfipRegistros() {

    /**
     * 
     * @param {string} ventasCbte 
     */
    this.ventasCbteToJs = (ventasCbte) => {
        return {
            receiptDate: ventasCbte.substr(0, 8),
            receiptType: ventasCbte.substr(8, 3),
            pointOfSale: ventasCbte.substr(11, 5),
            receiptNumber: ventasCbte.substr(16, 20),
            receiptNumberUntil: ventasCbte.substr(36, 20),
            codeDocumentBuyer: ventasCbte.substr(56, 2),
            receiptNumberId: ventasCbte.substr(58, 20),
            razon: ventasCbte.substr(78, 30),
            totalAmount: ventasCbte.substr(108, 15),
            totalAmountNoTaxed: ventasCbte.substr(123, 15),
            perceptionOfUncategorized: ventasCbte.substr(138, 15),
            AmountExemptOperations: ventasCbte.substr(153, 15),
            paymentAccountNationalTax: ventasCbte.substr(168, 15),
            iibb: ventasCbte.substr(183, 15),
            municipalTax: ventasCbte.substr(198, 15),
            interalTax: ventasCbte.substr(213, 15),
            moneyCode: ventasCbte.substr(228, 3),
            exchageType: ventasCbte.substr(231, 10),
            ivaNumberAliquots: ventasCbte.substr(241, 1),
            operationCode: ventasCbte.substr(242, 1),
            otherTax: ventasCbte.substr(243, 15),
            dueDate: ventasCbte.substr(258, 8),
        }
    }

    /**
     * 
     * @param {string} alicuta 
     */
    this.ventasAlicutaToJs = (alicuta) => {
        return {
            receiptType: alicuta.substr(0, 3),
            pointOfSale: alicuta.substr(3, 5),
            receiptNumber: alicuta.substr(8, 20),
            vendorDocumentCode: alicuta.substr(28, 2),
            vendorIdentificationNumber: alicuta.substr(30, 20),
            netAmountTaxed: alicuta.substr(50, 15),
            ivaAliquot: alicuta.substr(65, 4),
            taxSettled: alicuta.substr(69, 15),
        }
    }

}

(function () {
    let urlDownload = 'https://serviciosjava2.afip.gob.ar/rcel/jsp/exportarComprobante.do?t=v&c=';

    // collect all ids

    //let facturasIds = Array.from(document.querySelectorAll('.jig_par td input[title*="Exportar las ventas"]'))
    //    .map((i, item) => i.onclick.toString().match(/\d+/)[0]);

    let facturasIds = Array.from(document.querySelectorAll('.jig_par td input[title*="Exportar las ventas"], .jig_impar td input[title*="Exportar las ventas"]'))
        .map((i, item) => i.getAttribute('onclick').toString().match(/\d+/)[0]);


    var zip = new JSZip();
    const afipRegistros = new AfipRegistros();

    var a = document.createElement("a");

    //let csv = "Fecha de comprobante o fecha de oficialización,Tipo de comprobante,Punto de venta,Número de comprobante,Despacho de importación,Código de documento del vendedor,Número de identificación del vendedor,Apellido y nombre o denominación del vendedor,Importe total de la operación,Importe total de conceptos que no integran el precio neto gravado,Importe de operaciones exentas,Importe de percepciones o pagos a cuenta del Impuesto al Valor Agregado,Importe de percepciones o pagos a cuenta de otros impuestos nacionales,Importe de percepciones de Ingresos Brutos,Importe de percepciones de Impuestos Municipales,Importe de Impuestos Internos,Código de moneda,Tipo de cambio,Cantidad de alícuotas de IVA,Código de operación,Crédito Fiscal Computable,Otros Tributos,CUIT emisor/corredor,Denominación del emisor/corredor,IVA comisión\n";
    let csv = "";
    function request(url, id) {
        return new Promise(function (resolve) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", url + id);
            httpRequest.responseType = "blob";
            httpRequest.onloadend = function () {

                let receipt = {};
                zip.loadAsync(this.response).then(function (contents) {
                    const promises = []
                    Object.keys(contents.files).forEach(function (filename) {
                        const promise = zip.file(filename).async('string');
                        promises.push(promise);
                        promise.then(function (content) {
                            if (filename.endsWith("_VENTAS.txt")) {
                                let ventaCbte = afipRegistros.ventasCbteToJs(content);
                                Object.assign(receipt, ventaCbte);
                            }

                            if (filename.endsWith("_ALICUOTAS.txt")) {
                                let ventaAlicuota = afipRegistros.ventasAlicutaToJs(content);
                                Object.assign(receipt, ventaAlicuota);
                            }
                        });
                    })
                    Promise.all(promises)
                        .then(() => {
                            if (csv === "") {
                                // column names
                                csv += Object.entries(receipt).map((a)=>a[0]).join() + "\n";
                            }
                        })
                        .then(() => csv += Object.values(receipt).filter(value => !!value).join(","))
                        .then(resolve)
                })
            }
            httpRequest.send()
        })
    }

    //var chromez = chrome;
    Promise.all(facturasIds.map(function (id) {
        return request(urlDownload, id)
    })).then(function () {
        zip.file("facturas.csv", csv)
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