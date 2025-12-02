// DOM Elements
const screens = {
    intro: document.getElementById('intro-screen'),
    recording: document.getElementById('recording-screen'),
    review: document.getElementById('review-screen'),
    success: document.getElementById('success-screen')
};

const preview = document.getElementById('preview');
const playback = document.getElementById('playback');
const timerText = document.getElementById('timer-text');
const timerProgress = document.getElementById('timer-progress');
const recordingIndicator = document.getElementById('recording-indicator');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const retakeBtn = document.getElementById('retake-btn');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const newRecordingBtn = document.getElementById('new-recording-btn');

// State
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordedBlob = null;
let timerInterval = null;
let timeRemaining = 60;
const MAX_DURATION = 60;

// FFmpeg instance
let ffmpeg = null;
let ffmpegLoaded = false;

// Timer ring circumference
const CIRCUMFERENCE = 2 * Math.PI * 45; // radius is 45

// Screen Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Load FFmpeg
async function loadFFmpeg() {
    if (ffmpegLoaded) return true;
    
    try {
        const { FFmpeg } = FFmpegWASM;
        const { fetchFile } = FFmpegUtil;
        
        ffmpeg = new FFmpeg();
        
        // Load FFmpeg core from CDN
        await ffmpeg.load({
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        });
        
        ffmpegLoaded = true;
        return true;
    } catch (err) {
        console.error('FFmpeg load error:', err);
        return false;
    }
}

// Convert WebM to MP4
async function convertToMP4(webmBlob) {
    const { fetchFile } = FFmpegUtil;
    
    // Write input file
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    
    // Convert to MP4
    await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
    ]);
    
    // Read output file
    const data = await ffmpeg.readFile('output.mp4');
    
    // Clean up
    await ffmpeg.deleteFile('input.webm');
    await ffmpeg.deleteFile('output.mp4');
    
    return new Blob([data.buffer], { type: 'video/mp4' });
}

// Camera Setup
async function setupCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });
        preview.srcObject = mediaStream;
        return true;
    } catch (err) {
        console.error('Camera access error:', err);
        alert('Unable to access camera. Please ensure you have granted camera and microphone permissions.');
        return false;
    }
}

// Stop Camera
function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// Timer Functions
function updateTimer() {
    timeRemaining--;
    timerText.textContent = timeRemaining;
    
    // Update progress ring
    const offset = CIRCUMFERENCE * (1 - timeRemaining / MAX_DURATION);
    timerProgress.style.strokeDashoffset = offset;
    
    // Change color when time is running low
    if (timeRemaining <= 10) {
        timerProgress.style.stroke = '#FF6B6B';
    }
    
    if (timeRemaining <= 0) {
        stopRecording();
    }
}

function resetTimer() {
    timeRemaining = MAX_DURATION;
    timerText.textContent = timeRemaining;
    timerProgress.style.strokeDashoffset = 0;
    timerProgress.style.stroke = '#FF6B6B';
}

// Recording Functions
function startRecording() {
    recordedChunks = [];
    
    // Determine supported MIME type
    const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
    ];
    
    let selectedMimeType = '';
    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
        }
    }
    
    const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
    
    try {
        mediaRecorder = new MediaRecorder(mediaStream, options);
    } catch (err) {
        console.error('MediaRecorder error:', err);
        mediaRecorder = new MediaRecorder(mediaStream);
    }
    
    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'video/webm';
        recordedBlob = new Blob(recordedChunks, { type: mimeType });
        const videoURL = URL.createObjectURL(recordedBlob);
        playback.src = videoURL;
        
        stopCamera();
        showScreen('review');
    };
    
    mediaRecorder.start(100); // Collect data every 100ms
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Show recording indicator
    recordingIndicator.classList.add('active');
}

function stopRecording() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    recordingIndicator.classList.remove('active');
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

// Download/Submit
async function downloadVideo() {
    if (!recordedBlob) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    let downloadBlob = recordedBlob;
    let extension = 'mp4';
    
    // Check if we need to convert (if it's not already MP4)
    if (!recordedBlob.type.includes('mp4')) {
        // Update button to show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Converting...';
        submitBtn.style.opacity = '0.7';
        
        try {
            // Load FFmpeg if not already loaded
            const loaded = await loadFFmpeg();
            
            if (loaded) {
                submitText.textContent = 'Processing video...';
                downloadBlob = await convertToMP4(recordedBlob);
            } else {
                // Fallback to WebM if FFmpeg fails
                console.warn('FFmpeg not available, downloading as WebM');
                downloadBlob = recordedBlob;
                extension = 'webm';
            }
        } catch (err) {
            console.error('Conversion error:', err);
            // Fallback to WebM
            downloadBlob = recordedBlob;
            extension = 'webm';
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitText.textContent = 'Save as MP4';
        submitBtn.style.opacity = '1';
    }
    
    const filename = `my-story-${timestamp}.${extension}`;
    
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showScreen('success');
}

// Reset Everything
function resetApp() {
    stopRecording();
    stopCamera();
    resetTimer();
    
    recordedChunks = [];
    recordedBlob = null;
    
    if (playback.src) {
        URL.revokeObjectURL(playback.src);
        playback.src = '';
    }
}

// Event Listeners
startBtn.addEventListener('click', async () => {
    const cameraReady = await setupCamera();
    if (cameraReady) {
        showScreen('recording');
        // Small delay to ensure video is playing
        setTimeout(() => {
            startRecording();
        }, 500);
    }
});

stopBtn.addEventListener('click', () => {
    stopRecording();
});

retakeBtn.addEventListener('click', async () => {
    resetApp();
    const cameraReady = await setupCamera();
    if (cameraReady) {
        showScreen('recording');
        setTimeout(() => {
            startRecording();
        }, 500);
    }
});

submitBtn.addEventListener('click', () => {
    downloadVideo();
});

newRecordingBtn.addEventListener('click', () => {
    resetApp();
    showScreen('intro');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    resetApp();
});

// Initialize timer display
timerProgress.style.strokeDasharray = CIRCUMFERENCE;
timerProgress.style.strokeDashoffset = 0;
