// Type assertions for HTML elements
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const callButton = document.getElementById('callButton') as HTMLButtonElement;
const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;

let localStream: MediaStream;
let remoteStream: MediaStream;
let peerConnection: RTCPeerConnection;

// WebSocket connection
const socket = new WebSocket(`ws://${window.location.host}`);

socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    switch (data.type) {
        case 'offer':
            handleOffer(data.offer);
            break;
        case 'answer':
            handleAnswer(data.answer);
            break;
        case 'candidate':
            handleCandidate(data.candidate);
            break;
        default:
            break;
    }
};

// 1. Start camera
startButton.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        startButton.disabled = true;
        callButton.disabled = false;
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
};

// 2. Create and send offer
callButton.onclick = async () => {
    callButton.disabled = true;
    hangupButton.disabled = false;

    createPeerConnection();

    // Add local stream tracks to the connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: 'offer', offer }));
    } catch (error) {
        console.error('Error creating offer.', error);
    }
};

// 3. Hang up
hangupButton.onclick = () => {
    if (peerConnection) {
        peerConnection.close();
    }
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    startButton.disabled = false;
    callButton.disabled = true;
    hangupButton.disabled = true;
};

function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Using a public STUN server
    });

    // Event handler for when a remote track is added
    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    // Event handler for when an ICE candidate is available
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };
}

// Handle incoming offer
async function handleOffer(offer: RTCSessionDescriptionInit) {
    if (!peerConnection) {
        createPeerConnection();
    }

    // Add local stream tracks before setting remote description
    if (localStream) {
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    }

    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: 'answer', answer }));
        hangupButton.disabled = false;
    } catch (error) {
        console.error('Error handling offer.', error);
    }
}

// Handle incoming answer
async function handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
        console.error('Error handling answer.', error);
    }
}

// Handle incoming ICE candidate
async function handleCandidate(candidate: RTCIceCandidateInit) {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Error adding received ice candidate', error);
    }
}
