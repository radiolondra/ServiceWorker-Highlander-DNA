// ---------------------------------------------------------------------------
// SERVICEWORKER.JS
// ---------------------------------------------------------------------------

console.log(`-------- >>> ${convertNoDate(Date.now())} UTC - Service Worker with HIGHLANDER DNA is starting <<< --------`);

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
var wakeup;

const DEBUG = false;
var wCounter = 0;

letsStart();

// ----------------------------------------------------------------------------------------
function letsStart() {
    firstCall = Date.now();
    timer = startSeconds*SECONDS;
    isFirstStart = true;
    wakeup = setInterval(Highlander, timer);
    console.log(`-------- >>> Highlander has been started at ${convertNoDate(firstCall)}`);
}
// ----------------------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(
    async () => await initialize()
);

// Clears the Highlander interval when browser closes.
// This allows the process associated with the extension to be removed.
// Comment out or modify this listener if you need your service worker 
// to continue working in the background even after the browser is closed 
// (remote communications, exchanging data with other extensions or applications, etc.).
// Normally the process associated with the extension will be removed after about 5 mins at max, 
// if there are no other external situations that continue to keep the service worker running 
// (e.g., content scripts). 
// If the browser is reopened before the system has eliminated the process, 
// Highlander will be restarted.
chrome.windows.onRemoved.addListener( async (windowId) => {
    wCounter--;          
    if (wCounter > 0) {
        nextRoundTimeInform();
        return;
    }

    // no more windows open. Clear interval.
    if (wakeup)
    {
        // If browser will be opened before the process associated to this extension is removed, 
        // setting this to false will allow a new call to letsStart() ( see windows.onCreated() )
        isAlreadyAwake = false;
        clearInterval(wakeup);
    }
});

chrome.windows.onCreated.addListener( async (window) => {
    let w = await chrome.windows.getAll();
    wCounter = w.length;
    if (wCounter == 1 && isAlreadyAwake == false){
        letsStart();
    }
    nextRoundTimeInform();
});

function nextRoundTimeInform() {
    const next = nextSeconds*SECONDS - (Date.now() - lastCall);
    console.log(`Highlander next round in ${convertNoDate(next)} ( ${next/1000 | 0} seconds )`);
}

chrome.tabs.onCreated.addListener(onCreatedListener);
chrome.tabs.onUpdated.addListener(onUpdatedListener);
chrome.tabs.onRemoved.addListener(onRemovedListener);

async function showTabs() {
    let results = await chrome.tabs.query({});
    results.forEach(onCreatedListener);
}

function onCreatedListener(tab) {
    if (DEBUG) console.log("Created TAB id=", tab.id);
}

function onUpdatedListener(tabId, changeInfo, tab) {
    if (DEBUG) console.log("Updated TAB id=", tabId);
}

function onRemovedListener(tabId) {
    if (DEBUG) console.log("Removed TAB id=", tabId);
}

// HIGHLANDER
async function Highlander() {

    isAlreadyAwake = true;

    const now = Date.now();
    const age = now - firstCall;
    lastCall = now;

    console.log(`HIGHLANDER ------< ROUND >------ Time elapsed from first start: ${convertNoDate(age)}`)
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
	await showTabs();	
}
// --------------------------------------------------------------------------------------

