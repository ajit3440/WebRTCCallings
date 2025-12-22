let localStream = null;
let remoteStream = null;
let peerConnection = null;
let ws = null;
let myId = null;
let isAudioMuted = false;
let isVideoMuted = false;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// DOM elements
const myIdElement = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id');
const callBtn = document.getElementById('call-btn');
const muteAudioBtn = document.getElementById('mute-audio');
const muteVideoBtn = document.getElementById('mute-video');
const hangUpBtn = document.getElementById('hang-up');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const statusElement = document.getElementById('status');

// Initialize WebSocket connection
function initWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

  ws.onopen = () => {
    myId = generateId();
    ws.send(JSON.stringify({ type: 'register', id: myId }));
    updateStatus('Connected to server', 'success');
  };

  ws.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
    
      switch (message.type) {
      case 'registered':
        myIdElement.textContent = myId;
        break;

      case 'incoming-call':
        const sanitizedFrom = String(message.from).replace(/[<>&"']/g, '');
        if (confirm(`Incoming call from ${sanitizedFrom}. Accept?`)) {
          await handleIncomingCall(message.from);
        }
        break;

      case 'offer':
        await handleOffer(message.data, message.from);
        break;

      case 'answer':
        await handleAnswer(message.data);
        break;

      case 'ice-candidate':
        await handleIceCandidate(message.data);
        break;
    }
  } catch (error) {
    console.error('Error processing WebSocket message:', error);
    updateStatus('Error processing message', 'error');
  }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Connection error', 'error');
  };

  ws.onclose = () => {
    updateStatus('Disconnected from server', 'error');
  };
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Update status message
function updateStatus(message, type = 'info') {
  statusElement.textContent = message;
  statusElement.className = 'status';
  if (type === 'error') {
    statusElement.classList.add('error');
  } else if (type === 'warning') {
    statusElement.classList.add('warning');
  }
}

// Get local media stream
async function getLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = localStream;
    updateStatus('Local stream ready', 'success');
    return true;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    updateStatus('Failed to access camera/microphone', 'error');
    return false;
  }
}

// Create peer connection
function createPeerConnection(peerId) {
  peerConnection = new RTCPeerConnection(configuration);

  // Add local stream tracks
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
    updateStatus('Call connected', 'success');
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({
        type: 'ice-candidate',
        data: event.candidate,
        target: peerId
      }));
    }
  };

  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    updateStatus(`Connection state: ${peerConnection.connectionState}`, 'info');
    if (peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed') {
      hangUp();
    }
  };
}

// Make a call
async function makeCall() {
  const peerId = peerIdInput.value.trim();
  if (!peerId) {
    updateStatus('Please enter a peer ID', 'error');
    return;
  }

  if (!localStream) {
    const success = await getLocalStream();
    if (!success) return;
  }

  updateStatus('Calling...', 'warning');
  ws.send(JSON.stringify({ type: 'call', target: peerId }));

  createPeerConnection(peerId);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  ws.send(JSON.stringify({
    type: 'offer',
    data: offer,
    target: peerId
  }));
}

// Handle incoming call
async function handleIncomingCall(peerId) {
  if (!localStream) {
    const success = await getLocalStream();
    if (!success) return;
  }

  createPeerConnection(peerId);
  updateStatus('Accepting call...', 'warning');
}

// Handle offer
async function handleOffer(offer, peerId) {
  if (!peerConnection) {
    await handleIncomingCall(peerId);
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  ws.send(JSON.stringify({
    type: 'answer',
    data: answer,
    target: peerId
  }));
}

// Handle answer
async function handleAnswer(answer) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// Handle ICE candidate
async function handleIceCandidate(candidate) {
  if (peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

// Toggle audio mute
function toggleAudio() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isAudioMuted = !audioTrack.enabled;
      muteAudioBtn.textContent = isAudioMuted ? 'Unmute Audio' : 'Mute Audio';
      updateStatus(isAudioMuted ? 'Audio muted' : 'Audio unmuted', 'info');
    }
  }
}

// Toggle video mute
function toggleVideo() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      isVideoMuted = !videoTrack.enabled;
      muteVideoBtn.textContent = isVideoMuted ? 'Start Video' : 'Stop Video';
      updateStatus(isVideoMuted ? 'Video stopped' : 'Video started', 'info');
    }
  }
}

// Hang up call
function hangUp() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
    remoteVideo.srcObject = null;
  }

  updateStatus('Call ended', 'info');
}

// Event listeners
callBtn.addEventListener('click', makeCall);
muteAudioBtn.addEventListener('click', toggleAudio);
muteVideoBtn.addEventListener('click', toggleVideo);
hangUpBtn.addEventListener('click', hangUp);

// Initialize
initWebSocket();
