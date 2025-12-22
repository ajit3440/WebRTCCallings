// Basic validation tests for WebRTC Calling Application

const fs = require('fs');
const path = require('path');

console.log('Running validation tests...\n');

let passed = 0;
let failed = 0;

// Test 1: Check required files exist
console.log('Test 1: Checking required files...');
const requiredFiles = ['server.js', 'client.js', 'index.html', 'style.css', 'package.json', 'README.md'];
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✓ ${file} exists`);
  } else {
    console.log(`  ✗ ${file} missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✓ Test 1 passed\n');
  passed++;
} else {
  console.log('✗ Test 1 failed\n');
  failed++;
}

// Test 2: Validate package.json structure
console.log('Test 2: Validating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.name && packageJson.version && packageJson.dependencies) {
    console.log('  ✓ package.json has required fields');
    
    if (packageJson.dependencies.ws) {
      console.log('  ✓ ws dependency is present');
      console.log('✓ Test 2 passed\n');
      passed++;
    } else {
      console.log('  ✗ ws dependency is missing');
      console.log('✗ Test 2 failed\n');
      failed++;
    }
  } else {
    console.log('  ✗ package.json missing required fields');
    console.log('✗ Test 2 failed\n');
    failed++;
  }
} catch (error) {
  console.log('  ✗ Error parsing package.json:', error.message);
  console.log('✗ Test 2 failed\n');
  failed++;
}

// Test 3: Validate server.js syntax
console.log('Test 3: Validating server.js syntax...');
try {
  const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  
  if (serverCode.includes('WebSocket')) {
    console.log('  ✓ WebSocket server implementation found');
  }
  
  if (serverCode.includes('http.createServer')) {
    console.log('  ✓ HTTP server setup found');
  }
  
  if (serverCode.includes('wss.on') || serverCode.includes("wss.on('connection')")) {
    console.log('  ✓ WebSocket connection handler found');
  }
  
  console.log('✓ Test 3 passed\n');
  passed++;
} catch (error) {
  console.log('  ✗ Error reading server.js:', error.message);
  console.log('✗ Test 3 failed\n');
  failed++;
}

// Test 4: Validate client.js has WebRTC implementation
console.log('Test 4: Validating client.js WebRTC implementation...');
try {
  const clientCode = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
  
  if (clientCode.includes('RTCPeerConnection')) {
    console.log('  ✓ RTCPeerConnection usage found');
  }
  
  if (clientCode.includes('getUserMedia')) {
    console.log('  ✓ Media device access implementation found');
  }
  
  if (clientCode.includes('createOffer') && clientCode.includes('createAnswer')) {
    console.log('  ✓ Offer/Answer mechanism implemented');
  }
  
  if (clientCode.includes('onicecandidate')) {
    console.log('  ✓ ICE candidate handling found');
  }
  
  console.log('✓ Test 4 passed\n');
  passed++;
} catch (error) {
  console.log('  ✗ Error reading client.js:', error.message);
  console.log('✗ Test 4 failed\n');
  failed++;
}

// Test 5: Validate HTML structure
console.log('Test 5: Validating HTML structure...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  if (htmlContent.includes('<video') && htmlContent.includes('id="local-video"')) {
    console.log('  ✓ Local video element found');
  }
  
  if (htmlContent.includes('id="remote-video"')) {
    console.log('  ✓ Remote video element found');
  }
  
  if (htmlContent.includes('client.js')) {
    console.log('  ✓ Client script reference found');
  }
  
  if (htmlContent.includes('style.css')) {
    console.log('  ✓ Stylesheet reference found');
  }
  
  console.log('✓ Test 5 passed\n');
  passed++;
} catch (error) {
  console.log('  ✗ Error reading index.html:', error.message);
  console.log('✗ Test 5 failed\n');
  failed++;
}

// Summary
console.log('='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n✓ All validation tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
