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
var timer = startSeconds*SECONDS;
var firstCall;
var wakeup;

const DEBUG = false;

// ----------------------------------------------------------------------------------------
firstCall = Date.now();
timer = startSeconds*SECONDS;
isFirstStart = true;
wakeup = setInterval(Highlander, timer);
console.log(`-------- >>> Highlander has been started at ${convertNoDate(firstCall)}`);
// ----------------------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(
    async () => await initialize()
);

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

    const now = Date.now();
    const age = now - firstCall;

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
        
    setTimeout( () => {
        nextRound();
    }, 600);
    
}

function convertNoDate(long) {
    var dt = new Date(long).toISOString()
    return dt.slice(-13, -5) // HH:MM:SS only
}

function nextRound() {
    if (isFirstStart) { 
        isFirstStart = false;       
        clearInterval(wakeup);
        timer = nextSeconds*SECONDS;
        wakeup = setInterval(Highlander, timer);
    }    
    console.log(`Next Highlander round in ${nextSeconds} seconds to maintain Service Worker alive`)
}

async function initialize() {	
	await showTabs();	
}
// --------------------------------------------------------------------------------------

