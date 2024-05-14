chilliController.interval = 10;
chilliController.host = "192.168.182.1";
chilliController.port = 3990;
chilliController.onUpdate = updateUI ;
chilliController.onError  = handleError ;
chilliClock.onTick = function () { }

if (!window.queryObj) {
    window.queryObj = new Object();
    window.location.search.replace(new RegExp("([^?=&]+)(=([^&]*))?","g"), function($0,$1,$2,$3) { queryObj[$1] = $3; });
}

chilliController.queryObj = window.queryObj;

function ie_getElementsByTagName(str) {
  if (str=="*") return document.all;
  else return document.all.tags(str);
}

if (document.all) 
  document.getElementsByTagName = ie_getElementsByTagName;

function hidePage(page) { 
    var e = document.getElementById(page);
    if (e != null) e.style.display='none';
}

function showPage(page) { 
    var e = document.getElementById(page);
    if (e != null) e.style.display='inline';
}

function setElementValue(elem, val, forceHTML) {
    var e = document.getElementById(elem);
    if (e != null) {
        var node = e;
        if (!forceHTML && node.firstChild) {
            node = node.firstChild;
            node.nodeValue = val;
        } else {
            node.innerHTML = val;
        }
    }
}

chilliClock.onChange = function ( newval ) {
    setElementValue("sessionTime", chilliController.formatTime(newval));
}
    
function updateUI (cmd ) {
    log ( "Update UI is called. chilliController.clientState = " + chilliController.clientState ) ; 
    
    clearTimeout ( delayTimer );

    if ( chilliController.redir ) {
        if (chilliController.redir.originalURL != null &&
            chilliController.redir.originalURL != '') {
            setElementValue('originalURL', '<a target="_blank" href="'+chilliController.redir.originalURL+
                            '">'+chilliController.redir.originalURL+'</a>', true);
        }
        if (chilliController.redir.redirectionURL != null &&
            chilliController.redir.redirectionURL != '') {
            setElementValue('redirectionURL', chilliController.redir.redirectionURL);
        }
    }

    if ( chilliController.message ) {
        setElementValue('logonMessage', chilliController.message);
        chilliController.message = null;
        chilliController.refresh();
    }

    if ( chilliController.location ) {
        setElementValue('locationName', chilliController.location.name);
        chilliController.location = null;
    }

    if ( chilliController.clientState == 0 ) {
        showLoggedOutPage();
                setTimeout('chilliController.refresh()', 1000*chilliController.interval);//WBR for status page only
    }

    if ( chilliController.clientState == 1 ) {
        if ( chilliController.statusURL ) {
                        chilliController.statusWindow = window.open(chilliController.statusURL, "");
                } else {
                        showStatusPage();
        }
    }

    if (chilliController.redir.redirectionURL) {
        //chilliController.nextWindow = window.open(chilliController.redir.redirectionURL,'nextURL');
        window.location.href = chilliController.redir.redirectionURL;
        chilliController.redir.redirectionURL = null;
    }
    
    if ( chilliController.clientState == 2 ) showWaitPage();
}

function handleError( code ) {
    clearTimeout(delayTimer);
    alert(code);
    // showErrorPage(code);
}

/* Action triggered when buttons are pressed */
function connect() {
    var username =  document.getElementById('username').value ;
    var password =  document.getElementById('password').value ;

    if (username == null || username == '')
        return setElementValue('logonMessage', 'Username is required');
    
    showWaitPage(1000);
    chilliController.logon( username , password ) ;
}

function disconnect() {
    if (confirm("Are you sure you want to disconnect now?")) {
        chilliClock.stop();
        showWaitPage(1000);
        chilliController.logoff();
    }
    return false;
}

/* User interface pages update */
function showLoggedOutPage() {
    showPage("loggedOutPage");
    hidePage("statusPage");
    hidePage("waitPage");
    hidePage("errorPage");
    window.setTimeout("closePopup()",1000);
}

function showStatusPage() {
    hidePage("loggedOutPage");
    showPage("statusPage");
    hidePage("waitPage");
    hidePage("errorPage");
    
    // Update message
    if ( chilliController.message ) { 
        setElementValue("statusMessage", chilliController.message);
    }
    
    // Update session
    setElementValue("sessionId",
                    chilliController.session.sessionId ?
                    chilliController.session.sessionId :
                    "Not available");
                        
        setElementValue("userName",
                    chilliController.session.userName ?
                    chilliController.session.userName :
                    "Not available");
                        
    setElementValue("startTime",
                    chilliController.session.startTime ?
                    chilliController.session.startTime.toLocaleString() :
                    "Not available");
    
    setElementValue("sessionTimeout",
                    chilliController.formatTime(chilliController.session.sessionTimeout, 'unlimited'));

    setElementValue("idleTimeout",
                    chilliController.formatTime(chilliController.session.idleTimeout, 'unlimited'));

    setElementValue("maxInputOctets",
                    chilliController.formatBytes(chilliController.session.maxInputOctets));
    setElementValue("maxOutputOctets",
                    chilliController.formatBytes(chilliController.session.maxOutputOctets));
    setElementValue("maxTotalOctets",
                    chilliController.formatBytes(chilliController.session.maxTotalOctets));

    // Update accounting
    setElementValue("sessionTime",
                    chilliController.formatTime(chilliController.accounting.sessionTime));
    
    setElementValue("idleTime",
                    chilliController.formatTime(chilliController.accounting.idleTime));
    
    setElementValue("inputOctets" , chilliController.formatBytes(chilliController.accounting.inputOctets));
    setElementValue("outputOctets", chilliController.formatBytes(chilliController.accounting.outputOctets));
    
    chilliClock.resync (chilliController.accounting.sessionTime);
}

function showWaitPage(delay) {
    /* Wait for delay  */
    clearTimeout(delayTimer);   
    if (typeof(delay) == 'number' && (delay > 10)) {
        delayTimer= setTimeout('showWaitPage(0)' , delay);
        return;
    }
    
    /* show the waitPage */
    hidePage("loggedOutPage");
    hidePage("statusPage");
    showPage("waitPage");
    hidePage("errorPage");
}

function showErrorPage( str )  {
    setTimeout('chilliController.refresh()', 15000);
    
    hidePage("loggedOutPage");
    hidePage("statusPage");
    hidePage("waitPage");
    showPage("errorPage");
    setElementValue("errorMessage", str);
}

var chillijsWindowOnLoad = window.onload;
var delayTimer; // global reference to delayTimer

window.onload = function() {
    if (chillijsWindowOnLoad) 
        chillijsWindowOnLoad();

    //var logonForm = document.getElementById('logonForm');
        var logonForm = document.getElementById('loggedOutPage');

    var head = document.getElementsByTagName("head")[0];
    if (head == null) head = document.body;

    if (logonForm == null) {
        logonForm = document.getElementById('loginForm');
    }
    showWaitPage(); 
    setTimeout('chilliController.refresh()', 500);
}
