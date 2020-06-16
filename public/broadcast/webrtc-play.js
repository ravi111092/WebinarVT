const GO_BUTTON_START = "Play";
const GO_BUTTON_STOP = "Stop";

var remoteVideo = null;
var peerConnection = null;
var peerConnectionConfig = {'iceServers': []};
var localStream = null;
var wsURL = "wss://5eba300cb5631.streamlock.net/webrtc-session.json";
var wsConnection = null;
var streamInfo = {applicationName:"webrtc", streamName:"myStream", sessionId:"[empty]"};
var userData = {param1:"value1"};
var repeaterRetryCount = 0;
var newAPI = false;
var doGetAvailableStreams = false;
var exists=false;

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function pageReady()
{
	// const urlParams = new URLSearchParams(window.location.search);
	// streamInfo.streamName=urlParams.get("StreamID");

	streamInfo.streamName=document.getElementById("streamName").value;

	console.log('WSURL: '+wsURL);

	console.log('ApplicationName: '+streamInfo.applicationName);

	console.log('StreamName: '+streamInfo.streamName);


	// console.log('StreamName: '+streamInfo.streamName);

	// document.getElementById("sdpURL").value=wsURL;
	// document.getElementById("applicationName").value=streamInfo.applicationName;
	// document.getElementById("streamName").value=streamInfo.streamName;

	// document.getElementById("buttonGo").value=GO_BUTTON_START;
	
	remoteVideo = document.getElementById('remoteVideo');
	// remoteVideo.requestFullscreen();

	if(navigator.mediaDevices.getUserMedia)
	{
		newAPI = false;
	}

	console.log("newAPI: "+newAPI);
}

function wsConnect(url)
{
	wsConnection = new WebSocket(url);
	wsConnection.binaryType = 'arraybuffer';
	
	wsConnection.onopen = function()
	{
		console.log("wsConnection.onopen");
		
		peerConnection = new RTCPeerConnection(peerConnectionConfig);
		peerConnection.onicecandidate = gotIceCandidate;
		
		if (newAPI)
		{
			peerConnection.ontrack = gotRemoteTrack;
		}
		else
		{
			peerConnection.onaddstream = gotRemoteStream;
		}

		console.log("wsURL: "+wsURL);
		if (doGetAvailableStreams)
		{
			sendPlayGetAvailableStreams();
		}
		else
		{
			sendPlayGetOffer();
		}
	}
	
	function sendPlayGetOffer()
	{
		console.log("sendPlayGetOffer: "+JSON.stringify(streamInfo));
		wsConnection.send('{"direction":"play", "command":"getOffer", "streamInfo":'+JSON.stringify(streamInfo)+', "userData":'+JSON.stringify(userData)+'}');
	}

	function sendPlayGetAvailableStreams()
	{
		console.log("sendPlayGetAvailableStreams: "+JSON.stringify(streamInfo));
		wsConnection.send('{"direction":"play", "command":"getAvailableStreams", "streamInfo":'+JSON.stringify(streamInfo)+', "userData":'+JSON.stringify(userData)+'}');
	}

	wsConnection.onmessage = function(evt)
	{
		console.log("wsConnection.onmessage: "+evt.data);
		
		var msgJSON = JSON.parse(evt.data);
		
		var msgStatus = Number(msgJSON['status']);
		var msgCommand = msgJSON['command'];
		
		if (msgStatus == 514) // repeater stream not ready
		{
			repeaterRetryCount++;
			if (repeaterRetryCount < 10)
			{
				setTimeout(sendGetOffer, 500);
			}
			else
			{
				// document.getElementById("sdpDataTag").innerHTML='Live stream repeater timeout: '+streamName;
				stopPlay();
			}
		}
		else if (msgStatus != 200)
		{
			// document.getElementById("sdpDataTag").innerHTML=msgJSON['statusDescription'];
			stopPlay();
		}
		else
		{
			// document.getElementById("sdpDataTag").innerHTML="";

			var streamInfoResponse = msgJSON['streamInfo'];
			if (streamInfoResponse !== undefined)
			{
				streamInfo.sessionId = streamInfoResponse.sessionId;
			}

			var sdpData = msgJSON['sdp'];
			if (sdpData !== undefined)
			{
				console.log('sdp: '+JSON.stringify(msgJSON['sdp']));

				peerConnection.setRemoteDescription(new RTCSessionDescription(msgJSON.sdp), function() {
					peerConnection.createAnswer(gotDescription, errorHandler);
				}, errorHandler);
			}

			var iceCandidates = msgJSON['iceCandidates'];
			if (iceCandidates !== undefined)
			{
				for(var index in iceCandidates)
				{
					console.log('iceCandidates: '+JSON.stringify(iceCandidates[index]));
					peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidates[index]));
				}
			}
		}
		
		if ('sendResponse'.localeCompare(msgCommand) == 0)
		{
			if (wsConnection != null)
				wsConnection.close();
			wsConnection = null;
		}
		// now check for getAvailableResponse command to close the connection 
		if ('getAvailableStreams'.localeCompare(msgCommand) == 0)
		{
			var availableStreams=msgJSON['availableStreams'];
			if(availableStreams == undefined)
				stopPlay();
			else{
				exists=false;
				for(i=0;i<availableStreams.length;i++){
					if(streamInfo.streamName.localeCompare(availableStreams[i].streamName)==0){
						exists=true;
						console.log("//////// stream exists......");
						break;
					}
				}
				if(!exists){stopPlay();}
			}
		}
	}
	
	wsConnection.onclose = function()
	{
		console.log("wsConnection.onclose");
	}
	
	wsConnection.onerror = function(evt)
	{
		console.log("wsConnection.onerror: "+JSON.stringify(evt));

		// document.getElementById("sdpDataTag").innerHTML='WebSocket connection failed: '+wsURL;
	}
}

function getAvailableStreams()
{
	doGetAvailableStreams=true;
	startPlay();
}

function startPlay()
{
	repeaterRetryCount = 0;
	
	// wsURL = document.getElementById("sdpURL").value;
	// streamInfo.applicationName = document.getElementById("applicationName").value;
	// streamInfo.streamName = document.getElementById("streamName").value;
	
	console.log("startPlay: wsURL:"+wsURL+" streamInfo:"+JSON.stringify(streamInfo));
	
	wsConnect(wsURL);
	
	if (!doGetAvailableStreams)
	{
		// document.getElementById("buttonGo").value=GO_BUTTON_STOP;
	}
}

function stopPlay()
{
	if (peerConnection != null)
		peerConnection.close();
	peerConnection = null;
	
	if (wsConnection != null)
		wsConnection.close();
	wsConnection = null;
	
	remoteVideo.src = ""; // this seems like a chrome bug - if set to null it will make HTTP request

	console.log("stopPlay");

	// document.getElementById("buttonGo").value=GO_BUTTON_START;
}

// start button clicked
function start() 
{
	// doGetAvailableStreams=false;

	// if (peerConnection == null)
	// 	startPlay();
	// else
	// 	stopPlay();

	setInterval(function(){
		if (peerConnection == null){
			doGetAvailableStreams=false;
		}
		else{
			doGetAvailableStreams=true;
		}
		startPlay();
	},5000);
}

function gotMessageFromServer(message) 
{
	var signal = JSON.parse(message.data);
	if(signal.sdp) 
	{
		if (signal.sdp.type == 'offer')
		{
			console.log('sdp:offser');
			console.log(signal.sdp.sdp);
			peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
				peerConnection.createAnswer(gotDescription, errorHandler);
			}, errorHandler);
		}
		else
		{
			console.log('sdp:not-offer: '+signal.sdp.type);
		}

	}
	else if(signal.ice)
	{
		console.log('ice: '+JSON.stringify(signal.ice));
		peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
	}
}

function gotIceCandidate(event) 
{
	if(event.candidate != null) 
	{
	}
}

function gotDescription(description) 
{
	console.log('gotDescription');
	peerConnection.setLocalDescription(description, function () 
	{
		console.log('sendAnswer');

		wsConnection.send('{"direction":"play", "command":"sendResponse", "streamInfo":'+JSON.stringify(streamInfo)+', "sdp":'+JSON.stringify(description)+', "userData":'+JSON.stringify(userData)+'}');

	}, function() {console.log('set description error')});
}

function gotRemoteTrack(event) 
{
	console.log('gotRemoteTrack: kind:'+event.track.kind+' stream:'+event.streams[0]);
	try{
			remoteVideo.srcObject = event.streams[0];
	} catch (error){
			remoteVideo.src = window.URL.createObjectURL(event.streams[0]);
	}
}

function gotRemoteStream(event) 
{
	console.log('gotRemoteStream: '+event.stream);
	try{
		remoteVideo.srcObject = event.stream;
	} catch (error){
		remoteVideo.src = window.URL.createObjectURL(event.stream);
	}
}

function errorHandler(error) 
{
	console.log(error);
}
