# WebRTCCallings

A simple peer-to-peer video and audio calling application using WebRTC technology.

## Features

- Real-time video and audio calling
- Peer-to-peer connection using WebRTC
- Simple signaling server using WebSockets
- Mute/unmute audio and video controls
- Responsive design for desktop and mobile
- No external dependencies for the client-side

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Modern web browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ajit3440/WebRTCCallings.git
cd WebRTCCallings
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. To test calling functionality:
   - Open the application in two different browser windows or tabs
   - Each window will be assigned a unique ID
   - Copy the ID from one window
   - Paste it in the "Enter peer ID to call" field in the other window
   - Click the "Call" button
   - Accept the incoming call in the other window

## How It Works

### WebRTC Connection Flow

1. **Signaling**: The WebSocket server acts as a signaling channel to exchange connection information between peers
2. **Offer/Answer**: The caller creates an offer, which is sent to the callee who responds with an answer
3. **ICE Candidates**: Both peers exchange ICE candidates to establish the best connection path
4. **Media Stream**: Once connected, video and audio streams are transmitted directly between peers

### Project Structure

```
WebRTCCallings/
├── server.js       # WebSocket signaling server
├── client.js       # WebRTC client implementation
├── index.html      # Main HTML interface
├── style.css       # Styling
├── package.json    # Node.js dependencies
└── README.md       # This file
```

## Controls

- **Call**: Initiates a call to the specified peer ID
- **Mute Audio**: Toggles audio on/off during a call
- **Stop Video**: Toggles video on/off during a call
- **Hang Up**: Ends the current call

## Technical Details

- **Signaling Server**: Node.js with WebSocket (ws library)
- **STUN Servers**: Google's public STUN servers for NAT traversal
- **WebRTC API**: Browser's native RTCPeerConnection API
- **Media Constraints**: Video and audio enabled by default

## Browser Support

This application works on all modern browsers that support WebRTC:
- Chrome/Chromium 56+
- Firefox 44+
- Safari 11+
- Edge 79+

## Security Considerations

- This is a demo application for testing WebRTC functionality
- For production use, consider implementing:
  - HTTPS/WSS for secure connections
  - User authentication
  - TURN servers for better connectivity
  - Rate limiting and input validation
  - Proper error handling

## Troubleshooting

**Camera/Microphone not working:**
- Ensure you've granted browser permissions for camera and microphone
- Check if other applications are using the camera
- Try using HTTPS instead of HTTP (required by some browsers)

**Connection fails:**
- Check if both peers are connected to the signaling server
- Verify firewall settings
- Some corporate networks may block WebRTC traffic

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
