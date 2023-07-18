
#For Python Enthusiasts , Here is a python implementation of the code :) Cheers , Ishan


#inputs needed 
    #total_duration -> total time for which you want to run the Desk posture scorer
    #capture_interval -> How many photos do you want to take in the time of total duration 
    #side -> Which side of the body do you want to process , left or right

import cv2 
import matplotlib.pyplot as plt
import numpy as np
import mediapipe as mp
import time
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose
cap = cv2.VideoCapture(0)
start_time = time.time()
capture_interval = 2
total_duration = 10
snapshot=0
side = 1 #needs to be chose by user as to where he puts his camera 0-> right, 1->left
score = 0 #variable used to track the score
total = 0 

#Takes 3 landmarks as input and calculates angle abc , returns angle in degrees
def calculate_angle(a,b,c):
    a = np.array(a) # First
    b = np.array(b) # Mid
    c = np.array(c) # End
    
    #x-> 0 
    #y->1
    #using tan-1(y/x) to calculate  theta as tan theta = y/x
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle >180.0:
        angle = 360-angle
        
    return angle 

# returns the score 1 if proper posture else returns 0 (shoulder, hip, knee)
def shoulder_hip_knee(shoulder , hip ,knee):
    #shoulder hip knee - about 90 to 105 is good
    angle = calculate_angle(shoulder, hip,knee)
    if(angle >=90 and angle<=105):
        return 1
    else:
        return 0



# returns the score 1 if proper posture else returns 0(shoulder, elbow,wrist)
def shoulder_elbow_wrist(shoulder , elbow , wrist):
    #shoulder ,elbow and wrist make a 90 degree
    
    angle = calculate_angle(shoulder, elbow ,wrist)
    if(angle >=75 and angle<=100):
        return 1
    else:
        return 0

# returns the score 1 if proper posture else returns 0 (hip,knee, ankle)
def hip_knee_ankle(hip , knee, ankle):
    #hip knee and ankle are at 90 degree
    angle = calculate_angle(hip, knee ,ankle)
    if(angle >=75 and angle<=100):
        return 1
    else:
        return 0


session_start_time = start_time
with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) as pose:
    while (time.time() - session_start_time) <= total_duration:
        ret , frame = cap.read();
        cv2.imshow('Camera',frame)
        
        current_time = time.time()
       #saving frame in snapshot
        snapshot = frame
        #converting BGR to RGB
        img_rgb = cv2.cvtColor(snapshot, cv2.COLOR_BGR2RGB)
        #Processing the images in mediapipe library
        detections  = pose.process(img_rgb)
        
        if current_time - start_time >= capture_interval:           
#         
            #Extracting the landmarks
            try:
                landmarks = detections.pose_landmarks.landmark
                print(landmarks)
                   
                if(side==0):
                    print("left")
                    #shoulder
                    shoulder =[landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    #hip
                    hip =[landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    #knee
                    knee =[landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
                    #elbow
                    elbow =[landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    #wrist
                    wrist =[landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    #ankle
                    ankle =[landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
                    
                  
                    
                else:
                    #shoulder
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    #hip
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    #knee
                    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    #elbow
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    #wrist
                    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    #ankle
                    ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
             
                #Score generation only when all the joints required are detected.
                is_spine_aligned = shoulder_hip_knee(shoulder , hip ,knee)
                is_knee_aligned = hip_knee_ankle(hip , knee, ankle)
                is_wrist_aligned = shoulder_elbow_wrist(shoulder , elbow , wrist)
            
                score = is_spine_aligned+ is_knee_aligned+ is_wrist_aligned + score
                total = total+ 3
                start_time = current_time  
                
            except:
                print("could not detect")
                pass
                    #drawing the landmarks on the captured frame
        mp_drawing.draw_landmarks(img_rgb, detections.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                             )  
        cv2.imshow("feed",img_rgb)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            captured_image = frame
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("Your Posture Score is ", score ," / ", total)
    
    