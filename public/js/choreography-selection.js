// Choreography selection functionality
let currentVideoId;
let videoDuration = 180; // Default duration in seconds if API fails
let timeRangeStart = 0;
let timeRangeEnd = 180;

function playVideo(videoId) {
  const container = document.getElementById('fullscreen-container');
  const iframe = document.getElementById('fullscreen-video');
  if (iframe && container) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    container.style.display = 'flex';
  } else {
    // Create a fullscreen container if it doesn't exist
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.id = 'fullscreen-container';
    fullscreenContainer.style.position = 'fixed';
    fullscreenContainer.style.top = '0';
    fullscreenContainer.style.left = '0';
    fullscreenContainer.style.width = '100%';
    fullscreenContainer.style.height = '100%';
    fullscreenContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    fullscreenContainer.style.display = 'flex';
    fullscreenContainer.style.justifyContent = 'center';
    fullscreenContainer.style.alignItems = 'center';
    fullscreenContainer.style.zIndex = '1000';
    
    const closeButton = document.createElement('div');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '2rem';
    closeButton.style.cursor = 'pointer';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
      fullscreenContainer.style.display = 'none';
      fullscreenVideo.src = '';
    };
    
    const fullscreenVideo = document.createElement('iframe');
    fullscreenVideo.id = 'fullscreen-video';
    fullscreenVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    fullscreenVideo.style.width = '80%';
    fullscreenVideo.style.height = '80%';
    fullscreenVideo.style.border = 'none';
    fullscreenVideo.allowFullscreen = true;
    
    fullscreenContainer.appendChild(closeButton);
    fullscreenContainer.appendChild(fullscreenVideo);
    document.body.appendChild(fullscreenContainer);
  }
}

function openTimeSelection(videoId, title) {
  currentVideoId = videoId;
  const modal = document.getElementById('timeSelectionModal');
  if (!modal) {
    createTimeSelectionModal(videoId);
    return;
  }
  
  modal.style.display = 'block';

  // Try to fetch video duration (might fail due to API key issues)
  try {
    fetchVideoDuration(videoId).then(duration => {
      if (duration) {
        videoDuration = duration;
        updateSliders();
      }
    }).catch(() => {
      console.log('Using default video duration');
      updateSliders();
    });
  } catch (e) {
    console.log('Error fetching duration, using default:', e);
    updateSliders();
  }
}

function createTimeSelectionModal(videoId) {
  const modal = document.createElement('div');
  modal.id = 'timeSelectionModal';
  modal.className = 'modal';
  modal.style.display = 'block';
  
  const modalContent = `
    <div class="modal-content">
      <h2>Select Time Range</h2>
      <div class="time-slider-container">
        <div class="slider-labels">
          <span>Start Time: <span id="startTimeLabel">0:00</span></span>
          <span>End Time: <span id="endTimeLabel">3:00</span></span>
        </div>
        <input type="range" id="startTimeSlider" min="0" value="0" step="1" max="180">
        <input type="range" id="endTimeSlider" min="0" value="180" step="1" max="180">
      </div>
      <div class="preview-container">
        <iframe id="previewVideo" allowfullscreen></iframe>
      </div>
      <div class="modal-buttons">
        <button class="btn" onclick="previewSelection()">Preview</button>
        <button class="btn" onclick="confirmTimeSelection()">Start Dancing</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  
  modal.innerHTML = modalContent;
  document.body.appendChild(modal);
    // Add event listeners
  document.getElementById('startTimeSlider').addEventListener('input', function() {
    const endSlider = document.getElementById('endTimeSlider');
    const startValue = parseInt(this.value, 10);
    const endValue = parseInt(endSlider.value, 10);
    
    if (startValue >= endValue) {
      endSlider.value = Math.min(startValue + 1, videoDuration);
    }
    updateTimeLabels();
  });

  document.getElementById('endTimeSlider').addEventListener('input', function() {
    const startSlider = document.getElementById('startTimeSlider');
    const startValue = parseInt(startSlider.value, 10);
    const endValue = parseInt(this.value, 10);
    
    if (endValue <= startValue) {
      startSlider.value = Math.max(endValue - 1, 0);
    }
    updateTimeLabels();
  });
  
  updateTimeLabels();
}

function updateSliders() {
  const startSlider = document.getElementById('startTimeSlider');
  const endSlider = document.getElementById('endTimeSlider');
  
  if (startSlider && endSlider) {
    startSlider.max = videoDuration;
    endSlider.max = videoDuration;
    endSlider.value = videoDuration;
    updateTimeLabels();
  }
}

function updateTimeLabels() {
  const startTime = parseInt(document.getElementById('startTimeSlider').value, 10);
  const endTime = parseInt(document.getElementById('endTimeSlider').value, 10);
  
  document.getElementById('startTimeLabel').textContent = formatTime(startTime);
  document.getElementById('endTimeLabel').textContent = formatTime(endTime);
  
  // Debug output to help troubleshoot timing issues
  console.log(`Time range updated: Start=${startTime}s (${formatTime(startTime)}), End=${endTime}s (${formatTime(endTime)})`);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function previewSelection() {
  const startTime = parseInt(document.getElementById('startTimeSlider').value, 10);
  const endTime = parseInt(document.getElementById('endTimeSlider').value, 10);
  const previewFrame = document.getElementById('previewVideo');
  
  // Additional validation
  if (startTime >= endTime) {
    alert("Start time must be less than end time. Please adjust your selection.");
    return;
  }
  
  previewFrame.src = `https://www.youtube.com/embed/${currentVideoId}?start=${startTime}&end=${endTime}&autoplay=1`;
}

function confirmTimeSelection() {
  const startTime = parseInt(document.getElementById('startTimeSlider').value, 10);
  const endTime = parseInt(document.getElementById('endTimeSlider').value, 10);
  
  if (startTime >= endTime) {
    alert("Start time must be less than end time. Please adjust your selection.");
    return;
  }
  
  // Store time range in localStorage for camera.ejs to access
  localStorage.setItem('selectedTimeRange', JSON.stringify({
    videoId: currentVideoId,
    startTime,
    endTime
  }));
  
  // Also set danceTimeRange for compatibility with existing code
  localStorage.setItem('danceTimeRange', JSON.stringify({
    startTime,
    endTime
  }));
  
  closeModal();
  console.log('Redirecting to camera page with time range:', startTime, endTime);
  window.location.href = '/camera'; // Redirect to camera page
}

function closeModal() {
  const modal = document.getElementById('timeSelectionModal');
  if (modal) {
    modal.style.display = 'none';
    const previewVideo = document.getElementById('previewVideo');
    if (previewVideo) {
      previewVideo.src = '';
    }
  }
}

// Function to open the time range modal
function openTimeRangeModal(videoId, title) {
  // Create or display a modal for selecting time range
  const modal = document.getElementById('time-range-modal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('modal-title').innerText = `Select Time Range for ${title}`;
  } else {
    console.error('Time range modal element not found');
  }
  currentVideoId = videoId; // Store the video ID for further actions
}

async function fetchVideoDuration(videoId) {
  try {
    // For demo purposes, we'll use a fixed duration since API key might not be available
    return 180; // 3 minutes
    
    // In production, uncomment this code:
    /*
    const apiKey = 'YOUR_YOUTUBE_API_KEY';
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`);
    const data = await response.json();
    const duration = parseISO8601Duration(data.items[0].contentDetails.duration);
    return duration;
    */
  } catch (e) {
    console.error('Error fetching video duration:', e);
    return 180; // 3 minutes default
  }
}

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// Fix the updateSelectedRangeDisplay function to ensure proper formatting
function updateSelectedRangeDisplay() {
  const startMin = Math.floor(timeRangeStart / 60);
  const startSec = Math.round(timeRangeStart % 60);
  const endMin = Math.floor(timeRangeEnd / 60);
  const endSec = Math.round(timeRangeEnd % 60);

  // Get the range display element
  const rangeText = document.getElementById('selectedRange');
  if (rangeText) {
    // Format time string
    rangeText.textContent = `${startMin}:${startSec < 10 ? '0' + startSec : startSec} - ${endMin}:${endSec < 10 ? '0' + endSec : endSec}`;
  }
}

// Ensure the slider initializes and updates correctly
function initTimeRangeSlider() {
  const timeSlider = document.getElementById('timeRangeSlider');

  if (timeSlider) {
    if (typeof noUiSlider !== 'undefined') {
      window.timeSlider = noUiSlider.create(timeSlider, {
        start: [timeRangeStart, timeRangeEnd],
        connect: true,
        step: 1,
        range: {
          'min': 0,
          'max': 180 // 3 minutes in seconds
        }
      });
      window.timeSlider.on('update', function(values, handle) {
        timeRangeStart = parseInt(values[0]);
        timeRangeEnd = parseInt(values[1]);
        updateSelectedRangeDisplay();
      });
    } else {
      console.error("noUiSlider is not defined. Make sure the library is loaded.");
      showError("Could not initialize the time slider. Please try refreshing the page.");
    }
  }
}

// Ensure the confirm button redirects with the correct parameters
function confirmTimeRange() {
  if (selectedVideoId) {
    console.log("Confirm button clicked. Redirecting to camera page...");
    // Store time range in localStorage for camera.ejs to access
    localStorage.setItem('selectedTimeRange', JSON.stringify({
      videoId: selectedVideoId,
      title: selectedTitle,
      startTime: timeRangeStart,
      endTime: timeRangeEnd
    }));

    // Redirect to the camera page
    window.location.href = '/camera';
  } else {
    console.error("No video ID selected");
    showError("Please select a choreography first.");
  }
}
