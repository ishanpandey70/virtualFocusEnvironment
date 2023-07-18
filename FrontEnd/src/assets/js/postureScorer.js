async function runPoseDetection() {
    const videoElement = document.getElementById('videoElement');
    const canvasElement = document.getElementById('canvasElement');
    const canvasContext = canvasElement.getContext('2d');
  
    // Load the PoseNet model
    const net = await posenet.load();
  
    // Event listener for the "loadeddata" event
    videoElement.addEventListener('loadeddata', () => {
      function detectPoses() {
        net.estimateSinglePose(videoElement)
          .then(function (pose) {
            // Draw the pose keypoints on the canvas
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            drawKeypoints(pose.keypoints, canvasContext, videoElement);
  
            // Extract specific landmarks based on side (left or right)
            let shoulder, elbow, wrist, hip, knee, ankle;
            try {
              if (side === 0) { // Left side
                shoulder = getLandmarkPosition(pose, 'leftShoulder', 0.7);
                elbow = getLandmarkPosition(pose, 'leftElbow', 0.7);
                wrist = getLandmarkPosition(pose, 'leftWrist', 0.7);
                hip = getLandmarkPosition(pose, 'leftHip', 0.7);
                knee = getLandmarkPosition(pose, 'leftKnee', 0.7);
                ankle = getLandmarkPosition(pose, 'leftAnkle', 0.7);
              } else { // Right side
                shoulder = getLandmarkPosition(pose, 'rightShoulder', 0.7);
                elbow = getLandmarkPosition(pose, 'rightElbow', 0.7);
                wrist = getLandmarkPosition(pose, 'rightWrist', 0.7);
                hip = getLandmarkPosition(pose, 'rightHip', 0.7);
                knee = getLandmarkPosition(pose, 'rightKnee', 0.7);
                ankle = getLandmarkPosition(pose, 'rightAnkle', 0.7);
              }
              let is_spine_aligned ;
              let is_knee_aligned ;
              let is_wrist_aligned;
              
              if(shoulder!=null && hip!=null && knee!=null)
              {
                 is_spine_aligned = shoulder_hip_knee(shoulder , hip ,knee);
                total = total+1; 
                obtainedScore= obtainedScore+is_spine_aligned;
              }
              
              if(hip!=null && knee!=null && ankle!=null)
              {
                 is_knee_aligned = hip_knee_ankle(hip , knee, ankle)
                total = total+1; 
                obtainedScore= obtainedScore+is_knee_aligned;
              }
              
              if(shoulder!=null && elbow!=null && wrist!=null)
              {
                is_wrist_aligned = shoulder_elbow_wrist(shoulder , elbow , wrist)
                total = total+1; 
                obtainedScore= obtainedScore+is_wrist_aligned;
              }
  
              
            } catch (error) {
              console.error('Error extracting landmarks:', error);
              // Handle the error gracefully without stopping the code
            }
  
          
            if (!stopDetection) {            
             requestAnimationFrame(detectPoses);
            } else {
              stopCameras(); // Stop the cameras when detection is stopped
            }
          });
      }
  
      // Start pose detection
      detectPoses();
    });
  
    let stopDetection = false;
  
    // On pressing q, stop the camera and log the score
    document.addEventListener('keydown', function (event) {
      if (event.key === 'q') {
        console.log("Your score in this session was", obtainedScore ,"/",total);
        stopDetection = true; // Set the flag to stop detection
      }
    });
  
    function stopCameras() {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
  
      tracks.forEach(function (track) {
        track.stop(); // Stop each camera track
      });
    }
  
    // Start video stream
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          videoElement.srcObject = stream;
        })
        .catch(function (error) {
          console.error('Error accessing webcam:', error);
        });
    }
  
    // Function to draw keypoints on the canvas
    function drawKeypoints(keypoints, context, videoElement) {
      const videoWidth = videoElement.offsetWidth;
      const videoHeight = videoElement.offsetHeight;
  
      keypoints.forEach(keypoint => {
        const { y, x } = keypoint.position;
        const adjustedX = (x / videoElement.videoWidth) * videoWidth;
        const adjustedY = (y / videoElement.videoHeight) * videoHeight;
  
        context.beginPath();
        context.arc(adjustedX, adjustedY, 5, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
      });
    }
  
    // Function to get landmark position from pose
    function getLandmarkPosition(pose, part, minScore = 0) {
      const landmark = pose.keypoints.find(keypoint => keypoint.part === part && keypoint.score > minScore);
      if (landmark) {
        return landmark.position;
      } else {
        return null;
      }
    }
  }
  //conversion  direct 
  
  function calculateAngle(a, b, c) {
    // x-> 0
    // y-> 1
    // using Math.atan2(y, x) to calculate theta as tan theta = y/x
  
    let radians = Math.atan2(c.y - b.y , c.x - b.x) - Math.atan2(a.y - b.y , a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
  
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }
  
  function shoulder_hip_knee(shoulder, hip, knee) {
    // shoulder, hip, knee - about 90 to 105 is good
    let angle = calculateAngle(shoulder, hip, knee);
    if (angle >= 90 && angle <= 105) {
      return 1;
    } else {
      return 0;
    }
  }
  
  function shoulder_elbow_wrist(shoulder, elbow, wrist) {
    // shoulder, elbow, and wrist make a 90 degree
    let angle = calculateAngle(shoulder, elbow, wrist);
    if (angle >= 75 && angle <= 100) {
      return 1;
    } else {
      return 0;
    }
  }
  
  function hip_knee_ankle(hip, knee, ankle) {
    // hip, knee, and ankle are at 90 degree
    let angle = calculateAngle(hip, knee, ankle);
    if (angle >= 75 && angle <= 100) {
      return 1;
    } else {
      return 0;
    }
  }
  
 
window.addEventListener('message', function(event) {
  if (event.origin === window.opener.origin && event.source === window.opener) {
    console.log("received message from A");
    const scoreInfo = {obtainedScore: obtainedScore , totalScore:total};
    console.log(scoreInfo);
    window.opener.postMessage(scoreInfo, event.origin);
    
  }
});

  
  let total = 0;
  let obtainedScore =0;
  let side = 0; // 0 for left side, 1 for right side
  const urlParams = new URLSearchParams(window.location.search);
  side = urlParams.get('variable');
  console.log(side); 
  window.onload = runPoseDetection;
  