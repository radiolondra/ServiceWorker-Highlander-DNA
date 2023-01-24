// ---------------------------------------------------------------------------
// SERVICEWORKER.JS
// ---------------------------------------------------------------------------


// for websocket tests
importScripts("websockettest.js");

const INTERNAL_TESTALIVE_PORT = "DNA_Internal_alive_test";

const startSeconds = 1;
const nextSeconds = 270;
const SECONDS = 1000;

var alivePort = null;
var isFirstStart = true;
var isAlreadyAwake = false;
var timer = startSeconds*SECONDS;
var firstCall;
var lastCall;

var wakeup = undefined;
var wsTest = undefined;

const DEBUG = false;
var wCounter = 0;

const starter = `-------- >>> ${convertNoDate(Date.now())} UTC - Service Worker with HIGHLANDER DNA is starting <<< --------`;

// Websocket test
(async () => {
    await webSocketTest();        
})()

console.log(starter);

// Start Highlander
letsStart();

// ----------------------------------------------------------------------------------------
function letsStart() {
    if (wakeup === undefined) {
        isFirstStart = true;
        isAlreadyAwake = true;
        firstCall = Date.now();
        lastCall = firstCall;
        timer = startSeconds*SECONDS;
        
        wakeup = setInterval(Highlander, timer);
        console.log(`-------- >>> Highlander has been started at ${convertNoDate(firstCall)}`);
    } else {
        nextRoundTimeInform();
    }
}
// ----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------
// WebSocket test
async function webSocketTest() {      
    await connectToWS();
    
    if (webSocket !== undefined) {
        if (wsTest === undefined) {
            wsTest = setInterval(sendMsg, 30000);
        }            
    }    
}
// ----------------------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(
    async () => await initialize()
);

chrome.tabs.onCreated.addListener(onCreatedTabListener);
chrome.tabs.onUpdated.addListener(onUpdatedTabListener);
chrome.tabs.onRemoved.addListener(onRemovedTabListener);

// Clears the Highlander interval when browser closes.
// This allows the process associated with the extension to be removed.
// Normally the process associated with the extension once the guest browser is closed 
// will be removed after about 5 mins at maximum.
// If the browser is reopened before the system has removed the (pending) process, 
// Highlander will be restarted in the same process which will be not removed anymore.
chrome.windows.onRemoved.addListener( (windowId) => {
    wCounter--;          
    if (wCounter > 0) {
        nextRoundTimeInform();
        return;
    }

    // Browser is closing: no more windows open. Clear Highlander interval (or leave it active forever).
    // Shutting down Highlander will allow the system to remove the pending process associated with
    // the extension in max. 5 minutes.
    if (wakeup !== undefined) {
        // If browser will be open before the process associated to this extension is removed, 
        // setting this to false will allow a new call to letsStart() if needed 
        // ( see windows.onCreated listener )
        isAlreadyAwake = false;

        // if you don't need to maintain the service worker running after the browser has been closed,
        // just uncomment the "# shutdown Highlander" rows below (already uncommented by default)
        sendMsg("Shutting down Highlander", false); // # shutdown Highlander
        clearInterval(wakeup);                      // # shutdown Highlander
        wakeup = undefined;                         // # shutdown Highlander
        
        
    }

    // Websocket: closes connection and clears interval
    // If you don't need to maintain Websocket connection active after the browser has been closed,
    // just uncomment the "# shutdown websocket" rows below (already uncommented by default) 
    // and, if needed, the "# shutdown Highlander" rows to shutdown Highlander.
    if (wsTest !== undefined) { // # shutdown websocket
        closeConn();            // # shutdown websocket
        clearInterval(wsTest);  // # shutdown websocket
        wsTest = undefined;     // # shutdown websocket 
    }                           // # shutdown websocket
});

chrome.windows.onCreated.addListener( async (window) => {
    let w = await chrome.windows.getAll();
    wCounter = w.length;
    if (wCounter == 1) {
        updateJobs();
    }
});

async function updateJobs() {    
    if (isAlreadyAwake == false) {
        letsStart();
    } else nextRoundTimeInform();

    // WebSocket test
    webSocketTest();
}

function nextRoundTimeInform() {
    if (lastCall) {
        const next = nextSeconds*SECONDS - (Date.now() - lastCall);
        const str = `Highlander next round in ${convertNoDate(next)} ( ${next/1000 | 0} seconds )`;
        //console.log(str);
        return str;
    }
}

async function checkTabs() {
    let results = await chrome.tabs.query({});
    results.forEach(onCreatedTabListener);
}

function onCreatedTabListener(tab) {
    if (DEBUG) console.log("Created TAB id=", tab.id);
}

function onUpdatedTabListener(tabId, changeInfo, tab) {
    if (DEBUG) console.log("Updated TAB id=", tabId);
}

function onRemovedTabListener(tabId) {
    if (DEBUG) console.log("Removed TAB id=", tabId);
}

// ---------------------------
// HIGHLANDER
// ---------------------------
async function Highlander() {    

    const now = Date.now();
    const age = now - firstCall;
    lastCall = now;

    const str = `HIGHLANDER ------< ROUND >------ Time elapsed from first start: ${convertNoDate(age)}`;
    sendMsg(str)    
    //console.log(str)
    
    if (alivePort == null) {
        alivePort = chrome.runtime.connect({name:INTERNAL_TESTALIVE_PORT})

        alivePort.onDisconnect.addListener( (p) => {
            if (chrome.runtime.lastError){
                if (DEBUG) console.log(`(DEBUG Highlander) Expected disconnect error. ServiceWorker status should be still RUNNING.`);
            } else {
                if (DEBUG) console.log(`(DEBUG Highlander): port disconnected`);
            }

            alivePort = null;
        });
    }

    if (alivePort) {
                    
        alivePort.postMessage({content: "ping"});
        
        if (chrome.runtime.lastError) {                              
            if (DEBUG) console.log(`(DEBUG Highlander): postMessage error: ${chrome.runtime.lastError.message}`)                
        } else {                               
            if (DEBUG) console.log(`(DEBUG Highlander): "ping" sent through ${alivePort.name} port`)
        }            
    }         
      
    if (isFirstStart) { 
        isFirstStart = false;        
        setTimeout( () => {
            nextRound();
        }, 600);
    }
    
}

function convertNoDate(long) {
    var dt = new Date(long).toISOString()
    return dt.slice(-13, -5) // HH:MM:SS only
}

function nextRound() {
    clearInterval(wakeup);
    timer = nextSeconds*SECONDS;
    wakeup = setInterval(Highlander, timer);    
}

async function initialize() {	
	await checkTabs();
    updateJobs();	
}
// --------------------------------------------------------------------------------------
