// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with poseNet. Built with p5.js
=== */
let video;

const OFF = 0;
const SERVO_MOVE = 1;
const LED_RED = 10;
const LED_GREEN = 20;
const LED_BLUE = 30;
const LED_WHITE = 40;

var myVoice = new p5.Speech();
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let poseNet; 
let poses = [];

let classificationResult = "";

let allowedToPredict = false;

function setup() {
  myVoice.speak('ready to speak');
  const canvas = createCanvas(640, 480);
  canvas.parent('videoContainer');
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create the UI buttons
  createButtons();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}
lastResult = "";
function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
  
  fill(0,255,0);
  textSize(64);
  //text(classificationResult, width/2, height/2);
  
  if (classificationResult == "A") {
    text("head", width/2, height/2);
    if (lastResult != "A")
    myVoice.speak("head");
    writeToESP(SERVO_MOVE);
    
    
  } else if (classificationResult == "B") {
    text("shoulders", width/2, height/2);
    if (lastResult != "B")
    myVoice.speak("shoulders");
    writeToESP(OFF);
    
  } else if (classificationResult == "C") {
    text("knees", width/2, height/2);
    if (lastResult != "C")
    myVoice.speak("knees");
    writeToESP(SERVO_MOVE);
    
  }else if (classificationResult == "D") {
    text("toes", width/2, height/2);
    if (lastResult != "D")
    myVoice.speak("toes");
    writeToESP(LED_GREEN);
    
  }
  
    lastResult = classificationResult;
  
  //Super hacky way to get rid of errors - make this better!
  if (poses.length>0 && allowedToPredict) {
    if (frameCount % 200 == 0) {
      classify(); 
    }
  }
}

function modelReady(){
  select('#status').html('model Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  if (typeof poses[0] === 'object'){
      if (typeof poses[0].pose === 'object'){
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
  if (poseArray.length > 0){
  // Add an example with a label to the classifier
  knnClassifier.addExample(poseArray, label);
  updateCounts();
  }
  }
  }
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(poseArray, gotResults);
  
   allowedToPredict = true;
}

// A util function to create UI buttons
function createButtons() {
  
  
  const connectButton = createButton('Connect')
  connectButton.mousePressed(onStartButtonClick);
  
  const writeToESPButton = createButton('servo')
  writeToESPButton.mousePressed(x => writeToESP(SERVO_MOVE));
  const greenButton = createButton('green')
  greenButton.mousePressed(x => writeToESP(LED_GREEN));
  const offButton = createButton('off')
  offButton.mousePressed(x => writeToESP(OFF));
  
  // When the A button is pressed, add the current frame
  // from the video with a label of "A" to the classifier
  buttonA = select('#addClassA');
  buttonA.mousePressed(function() {
    addExample('A');
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "B" to the classifier
  buttonB = select('#addClassB');
  buttonB.mousePressed(function() {
    addExample('B');
  });
  
  // When the C button is pressed, add the current frame
  // from the video with a label of "C" to the classifier
  buttonC = select('#addClassC');
  buttonC.mousePressed(function() {
    addExample('C');
  });
buttonD = select('#addClassD');
  buttonD.mousePressed(function() {
    addExample('D');
  });
  // Reset buttons
  resetBtnA = select('#resetA');
  resetBtnA.mousePressed(function() {
    clearLabel('A');
  });
	
  resetBtnB = select('#resetB');
  resetBtnB.mousePressed(function() {
    clearLabel('B');
  });
  
  resetBtnC = select('#resetC');
  resetBtnC.mousePressed(function() {
    clearLabel('C');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

  // Clear all classes button
  buttonClearAll = select('#clearAll');
  buttonClearAll.mousePressed(clearAllLabels);
  
  
  // Load saved classifier dataset
  buttonSetData = select('#load');
  buttonSetData.mousePressed(loadMyKNN);

  // Get classifier dataset
  buttonGetData = select('#save');
  buttonGetData.mousePressed(saveMyKNN);
  
  
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      classificationResult = result.label;
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }

    select('#confidenceA').html(`${confidences['A'] ? confidences['A'] * 100 : 0} %`);
    select('#confidenceB').html(`${confidences['B'] ? confidences['B'] * 100 : 0} %`);
    select('#confidenceC').html(`${confidences['C'] ? confidences['C'] * 100 : 0} %`);
    select('#confidenceD').html(`${confidences['D'] ? confidences['C'] * 100 : 0} %`);
  }

 if (poses.length>0) { 
   classify();
 }
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleA').html(counts['A'] || 0);
  select('#exampleB').html(counts['B'] || 0);
  select('#exampleC').html(counts['C'] || 0);
    select('#exampleD').html(counts['D'] || 0);

}

// Clear the examples in one label
function clearLabel(classLabel) {
  knnClassifier.clearLabel(classLabel);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}


// Save dataset as myKNNDataset.json
function saveMyKNN() {
    knnClassifier.save('myKNN');
}

// Load dataset to the classifier
function loadMyKNN() {
    knnClassifier.load('./myKNN.json', updateCounts);
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function physicalButtonPressed(){
  console.log("start training");
  
  writeToESP(LED_WHITE);
  await timeout(500);
  writeToESP(OFF);
  await timeout(1000);
  writeToESP(LED_WHITE);
  await timeout(500);
  writeToESP(OFF);
  await timeout(1000);
  writeToESP(LED_WHITE);
  await timeout(500);
  writeToESP(OFF);
  await timeout(1000);
  writeToESP(LED_WHITE);
  await timeout(500);
  writeToESP(OFF);
  await timeout(1000);
  writeToESP(LED_WHITE);
  await timeout(500);
  writeToESP(OFF);
  await timeout(2000);
  writeToESP(LED_GREEN);
  await timeout(500);
  for(var i=0;i<200;i++){
    addExample('A');
    await timeout(10);
  }
  writeToESP(OFF);
  await timeout(1000);
  writeToESP(LED_RED);
  await timeout(500);
  for(var i=0;i<300;i++){
    addExample('B');
    await timeout(10);
  }
  writeToESP(OFF);
  classify();
}