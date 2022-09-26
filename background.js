chrome.runtime.onInstalled.addListener(function () {

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { 
                    hostEquals: 'fe.afip.gob.ar', 
                    pathEquals: '/rcel/jsp/buscarComprobantesGenerados.do'},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
