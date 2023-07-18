
const playButton = document.querySelector('.playPause');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const shortBreakButton = document.getElementById("shortBreak");
const longBreakButton = document.getElementById("longBreak");
const workButton = document.getElementById("work");
const resetButton = document.getElementById("reset");
const css = document.getElementById("css");
const result = document.getElementById("result");
let openWindow=null;
let obtainedScore = null;
let totalScore =null;
let leftOrRight = 0; 
//0 -> we capture left side 
//1 -> we capture right side




let sessionTimeMinutes =25;
let sessionTimeSeconds =0;
let workSessionMinutes = sessionTimeMinutes;
let workSessionSeconds = 0;
let cssMode =0;
let numberOfWindows=0;
let mode =0; 
//0 = workSession
//1 = shortBreak
//2 = longBreak

let bell = new Audio("../src/assets/audio/bell.mp3");


minutesDisplay.innerHTML = sessionTimeMinutes.toString().padStart(2, '0');
secondsDisplay.innerHTML = workSessionSeconds.toString().padStart(2, '0');


let totalTime = workSessionMinutes * 60 + workSessionSeconds;
let shortBreakLength = 5;
let longBreakLength= 30;
let isPaused = true; 
let intervalId = null;

playButton.addEventListener('click', function () {
  isPaused = !isPaused;
  playButton.classList.toggle('paused');
  
  if (!isPaused) {
    startTimer();
  } else {
    clearInterval(intervalId);
  }
});





function startTimer() {
  intervalId = setInterval(() => {
    minutesDisplay.innerHTML = workSessionMinutes.toString().padStart(2, '0');
    secondsDisplay.innerHTML = workSessionSeconds.toString().padStart(2, '0');

    if (workSessionMinutes === 0 && workSessionSeconds === 0) {
      clearInterval(intervalId);
      bell.play();
      workButton.click();

      console.log("well Done");
    } else {
      if (workSessionSeconds === 0) {
        workSessionMinutes--;
        workSessionSeconds = 59;
      } else {
        workSessionSeconds--;
      }
      if(workSessionMinutes ===22 && workSessionSeconds===50)
      {
        
        getScore();
      }
      if(workSessionMinutes==21&& workSessionSeconds==50)
      {
        postureResult.innerHTML = `Your posture score is ${obtainedScore} / ${totalScore}`;

        if(openWindow!=null)
        openWindow.close();
      }


    }
  }, 1000);
}




workButton.addEventListener('click', function(){
  mode =0 ;
  clearInterval(intervalId);
  resetTimer(sessionTimeMinutes,sessionTimeSeconds);
  if(isPaused==false)
  {
    isPaused =true;
    playButton.classList.remove('paused');
    playButton.innerHTML = '<i class="icon"></i>'; 
  }
  
});

shortBreakButton.addEventListener('click', function(){
  mode =1;
  clearInterval(intervalId);
  resetTimer(shortBreakLength,0);
  if(isPaused==false)
  {
    isPaused =true;
    playButton.classList.remove('paused');
    playButton.innerHTML = '<i class="icon"></i>'; 
  }
  
});


longBreakButton.addEventListener('click', function(){
  mode =2;
  clearInterval(intervalId);
  resetTimer(longBreakLength,0);
  if(isPaused==false)
  {
    isPaused =true;
    playButton.classList.remove('paused');
    playButton.innerHTML = '<i class="icon"></i>'; 
  }
  
});





posture.addEventListener('click',function () {
  if(numberOfWindows == 0)
  {
    const windowFeatures = "width=650,height=480";
    
    const isLeft = window.confirm("Is the camera on your left? Note : Keep your camera either to left or to right only.");
    if (isLeft) {
      leftOrRight= 0;
    } else {
      leftOrRight=1;
    }
    //create url based on leftOrRightChoice so that we only detect half of the detections
    const url = `posture.html?variable=${encodeURIComponent(leftOrRight)}`;
    openWindow = window.open(url, "_blank", windowFeatures);

    numberOfWindows= numberOfWindows+1;
  }
});

resetButton.addEventListener('click', function () {
  let time;
  if(mode==0){
    time = sessionTimeMinutes;
  }
  else if (mode ==1)
  {
    time = shortBreakLength;
  }
  else{
    time = longBreakLength;
  }
  resetTimer(time,0);
});

darkBtn.addEventListener('click',function(){
  darkBtn.classList.toggle('light');
 
  if(cssMode==0)
 { 
  cssMode =1;
  css.href = "../src/assets/css/darkModeStyles.css"  ;
 }
  else{
    cssMode =0;
    css.href = "../src/assets/css/styles.css"  ;

  }
  

});

function resetTimer(timeToSetMinutes, timeToSetSeconds) {
  workSessionMinutes = timeToSetMinutes;
  workSessionSeconds = timeToSetSeconds;
  minutesDisplay.innerHTML = workSessionMinutes.toString().padStart(2, '0');
  secondsDisplay.innerHTML = workSessionSeconds.toString().padStart(2, '0');
  //Reset full posture process
  if(openWindow!=null)
  {
    numberOfWindows = 0;
    openWindow.close();
    postureResult.innerHTML= "";
  }




}
async function getScore() {
  sendEventToWindowB();
}

function sendEventToWindowB() {
  const eventData = {};
  openWindow.postMessage(eventData, '*');
}

window.addEventListener('message', function(event) {
  if (event.source === openWindow) {    
    obtainedScore = event.data.obtainedScore;
    totalScore = event.data.totalScore;
  }
});
