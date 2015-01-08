/*TODO:
 * 1. Rework this to use different callbacks depending on how we're sending the sdp data
 * 2. Somehow make this work with the initialization procedure in ideas.txt
 * 3. Channels and PeerConnections should be stored in the node's bucket in DHT once the node's ID is known*/


//These help to reduce compatibility issues across browsers
var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
//This isn't used, lel, but I left it in because I don't want to look if up if I actually do need it
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

//A list of STUN and TURN servers to aid in establishing p2p connections
//If you aren't worried about huge sdp messages, you should
// find as many of these servers as possible and put them in
// this list, because it'll make connecting a bit more reliable
var server = {
    iceServers: [
        {url: "stun:23.21.150.121"},
        {url: "stun:stun.l.google.com:19302"}
    ]
};

//Don't fuck with this unless you know damn well what you're doing
//Chrome is EXTREMELY picky about what you put here
var options = {
    optional: [
        {DtlsStrpKeyAgreement: true}
    ]
};

//Callback function for errors if/when they occur
var errorHandler = function(err) {
    console.error(err);
};

//A list of peerconnections, not actually sure whether this app works with
//multiple connections, too lazy to test
//I imagine it probably doesn't unless you add in code to clear the answer field
//after the message has been processed
var peerconnections = {};

//Our ID
var ID = "";

//Useful for generating channel names
function getRandomString(n)
{
    //Make 24 the default size if none is specified
    n = (n == undefined) ? 24 : n;
    var ret = "";
    var pool = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for(var i = 0; i < n; ++i)
    {
        ret += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    
    return ret;
}

//This function gets called whenever we paste an sdp string into tha answer field
//It'll wait a bit to be sure the data's there, and then do something with the sdp message
//really it should use something like onload, but I'm not sure if that works for text
function getResponse(event)
{
    setTimeout(function() {
        processResponse(getResponseTextboxText());
    }, 50);
}


//This gets called whenever we click that "make offer" button
//It makes the initial sdp offer
function createOffer()
{
    //Initialize our ID if we haven't already
    if(ID == "") ID = getIdAsHexString(getID());
    
    //Start up a new peer connection
    var temp_pc = new PeerConnection(server, options);
    
    //Get a random channel name, probably not the best way to go about it, but meh
    var channelname = getRandomString();
    
    //Add the new peerconnection to our map of them
    peerconnections[channelname] = {peerconnection:temp_pc};
    
    //Now wait until we've generated some ice candidates
    temp_pc.onicecandidate = function (e) {
        // When e.candidate is null, we're done generating candidates, so if
        // we grab the sdp offer now, it'll be nice and full of candidates
        // If you don't do this, chrome will be an asshole and just not put any
        //  candidates in your offer
        if(e.candidate == null) {
            //Lets make an offer, encapsulate it in some json
            var offerstring = JSON.stringify({id:ID, messagetype:"offer", data:{channel:channelname, sdp:temp_pc.localDescription}});
            setSDPOfferTextboxText(offerstring);
        }
    };
    
    //Create a data channel for our peer connection
    peerconnections[channelname].channel = temp_pc.createDataChannel(channelname, {reliable:true});
    bindEvents(peerconnections[channelname].channel);
    
    //This actually creates the offer
    temp_pc.createOffer(function(offer) {
        temp_pc.setLocalDescription(offer);
    }, errorHandler);
}

//Here's where we process our sdp response, and act accordingly
function processResponse(response)
{
    //Parse the response
    var responsecontents = JSON.parse(response);
    var tempconnection;
    
    //Initialize our ID if we haven't already
    if(ID == "") ID = getIdAsHexString(getID());
    
    //If we're dealing with an answer
    if(responsecontents.messagetype == "answer")
    {
        //Find the peerconnection we sent the offer for
        tempconnection = peerconnections[responsecontents.data.channel].peerconnection;
        //Set that connection's remote description to our offer, shit should connect automatically after this is done
        tempconnection.setRemoteDescription(
            new SessionDescription(responsecontents.data.sdp));
    } else
    {
        //We got an offer, so create a new channel to deal with this new connection
        tempconnection = new PeerConnection(server, options);
        //add the connection to our list
        peerconnections[responsecontents.channel] = {peerconnection:tempconnection};
        //We can't just create a data channel if we didn't make an offer, so we have to wait
        //for it to be created
        tempconnection.ondatachannel = function(e) {
            bindEvents(e.channel);
            peerconnections[responsecontents.channel].channel = e.channel;
        };

        //Now set our remote description to that offer sdp
        tempconnection.setRemoteDescription(new SessionDescription(responsecontents.data.sdp));
        //Also create an answer, we're not some sort of deaf-mute
        tempconnection.createAnswer(function (answer) {
            //Our local description is just the answer
            tempconnection.setLocalDescription(answer);
        }, errorHandler);
        tempconnection.onicecandidate = function (e) {
            // When e.candidate is null, we're done generating candidates, so if
            // we grab the sdp answer now, it'll be nice and full of candidates
            // If you don't do this, chrome will be an asshole and just not put any
            //  candidates in your answer
            if(e.candidate == null) {
                //Lets make an answer, encapsulate it in some json
                var answerstring = JSON.stringify({id:ID, messagetype:"answer", data:{channel:responsecontents.data.channel, sdp:tempconnection.localDescription}});
                setSDPOfferTextboxText(answerstring);
                setSDPModalMessage("Answer available in response window, please send to other user");
            }
        };
    }
}

//This binds callbacks to certain events that the data channel can generate
function bindEvents(connection)
{
    //When the data channel is open and ready for transmission
    connection.onopen = function(e) {
        console.log("Yep.");
        //Let's send a message so the other guy knows we're alive
        connection.send(JSON.stringify({id:ID, messagetype:"chatmessage", data:{username:"", text:"lel"}}));
        resetSDPModalBox();
        clearSDPModalBox();
    };
    
    //We got a message
    connection.onmessage = function(e) {
        /*var parseddata = JSON.parse(e.data);
        chatbox = document.getElementById('chatboxdiv');
        chatbox.innerHTML += "<hr />" + parseddata.data.username + ": " + parseddata.data.text;
        chatbox.scrollTop = chatbox.scrollHeight;*/
        handleMessage(e.data);
    };
}

//This should maybe probably send messages to all peerconnections we're connected to
//If we're connected to more than one
//It at least works just for the one
/*function sendMessage()
{
    var chattextdiv = document.getElementById('messagetext');
    var chatboxdiv = document.getElementById('chatboxdiv');
    var un = document.getElementById('namefield').value;
    
    //For each person we're connected to
    for(chan in peerconnections) {
        //Generate a message
        var senddata = {id:ID, messagetype:"chatmessage", data:{username:un, text:chattextdiv.value}};
        //Send that shit
        peerconnections[chan].channel.send(JSON.stringify(senddata));
    }
    
    chatboxdiv.innerHTML += "<hr />" + un + ": " + chattextdiv.value;
    chatboxdiv.scrollTop = chatboxdiv.scrollHeight;
    chattextdiv.value = "";
}*/

//So you don't have to click a send button every time, just press enter
/*function processTextChange(event)
{
    if(event.which == 13)
    {
        sendMessage();
    }
}*/
