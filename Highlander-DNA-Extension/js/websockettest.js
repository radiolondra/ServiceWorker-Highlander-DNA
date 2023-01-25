// ---------------------------------------------------------------------------
// WEBSOCKETTEST.JS
// ---------------------------------------------------------------------------

var webSocket = undefined;
var msgCount = 0;

function connectToWS() {
    // Connect to default WS remote server
    //var endpoint = "wss://ws.ifelse.io";

    // Connect to local WS server. 
    // To be used with WebSocketServerTest server running 
    // and with websocket.html page open in a whatever browser and connected to the server
    // This way you can debug the extension without the extension's host browser open once you set
    // properly the behaviour.
    // See windows.onRemoved listener in serviceworker.js on how to leave the service worker 
    // (and websocket or whatever else service) always active even after closing the host browser.
    var endpoint = "ws://localhost:8000";

    if (webSocket === undefined) {
        webSocket = new WebSocket(endpoint);
    
        webSocket.onmessage = function(event) {        
            console.log(`From ${endpoint}: ${event.data}`);
        }

        webSocket.onopen = function(evt) {
            console.log(`Connected to ${endpoint}`);
        };

        webSocket.onclose = function(evt) {
            console.log(`Connection with ${endpoint} closed.`);
            webSocket = undefined;
            msgCount = 0;
        };

        webSocket.onerror = function(evt) {
            console.log("Error!");
        };
    }
}

function sendMsg(msg = undefined, bs = true) {
    if (webSocket !== undefined && webSocket.readyState === webSocket.OPEN) {        
        if (msg !== undefined)              
            webSocket.send(msg);
        if (bs){
            let message = `Hi WebSocket! - Notice #${++msgCount}`;
            webSocket.send(message);
        }
            
    }
}

function closeConn() {
    webSocket.send("Closing connection");
    webSocket.close();
    webSocket = undefined;
    msgCount = 0;
}