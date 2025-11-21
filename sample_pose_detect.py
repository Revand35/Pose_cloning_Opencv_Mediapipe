import cv2
import mediapipe as mp
import numpy as np
import matplotlib.pyplot as plt
import sys

# Check if OpenCV GUI is available
# On Windows, cv2.imshow might not work if OpenCV was installed without GUI support
def check_opencv_gui():
    """Check if OpenCV GUI functions are available"""
    try:
        # Try to create a test window
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.imshow("test", test_img)
        cv2.waitKey(1)
        cv2.destroyAllWindows()
        return True
    except cv2.error:
        return False

# Determine display method based on OpenCV capabilities
USE_OPENCV_GUI = check_opencv_gui()

# If OpenCV GUI is not available, use matplotlib for display
if not USE_OPENCV_GUI:
    print("OpenCV GUI not available. Using matplotlib for display.")
    print("Note: Matplotlib display will update every frame (may be slower).")
    plt.ion()  # Turn on interactive mode for matplotlib

# take video input for pose detection
# you can put here video of your choice
# take live camera  input for pose detection
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

# Check if camera opened successfully
if not cap.isOpened():
    print("Error: Could not open camera")
    sys.exit(1)

# initialize mediapipe pose solution
mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils
pose = mp_pose.Pose()

# Initialize matplotlib figure if needed
if not USE_OPENCV_GUI:
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.set_title("Pose Estimation")
    ax.axis('off')

# read each frame/image from capture object
try:
    while True:
        ret, img = cap.read()
        
        # Check if frame was read successfully
        if not ret:
            print("Error: Could not read frame from camera")
            break

        # Convert BGR to RGB for MediaPipe (MediaPipe uses RGB)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # do Pose detection
        results = pose.process(img_rgb)

        # draw the detected pose on frame
        # Note: draw_landmarks expects RGB image
        mp_draw.draw_landmarks(img_rgb, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                               mp_draw.DrawingSpec((255, 0, 0), 2, 2),
                               mp_draw.DrawingSpec((255, 0, 255), 2, 2)
                               )
        
        # Display the output
        if USE_OPENCV_GUI:
            # Convert back to BGR for OpenCV display
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
            cv2.imshow("Pose Estimation", img_bgr)
            # Press 'q' to quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            # Use matplotlib for display
            ax.clear()
            ax.imshow(img_rgb)
            ax.set_title("Pose Estimation (Press Ctrl+C to quit)")
            plt.pause(0.01)  # Small pause to allow display update

except KeyboardInterrupt:
    print("\nStopping pose detection...")

finally:
    # Clean up resources
    cap.release()
    if USE_OPENCV_GUI:
        cv2.destroyAllWindows()
    else:
        plt.close('all')
    print("Camera released. Program ended.")