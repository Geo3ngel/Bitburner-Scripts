import numpy as np
import cv2
from PIL import ImageGrab
import os
import time
from pytesseract import image_to_string

config = ('-l eng --oem 1 --psm 3')
class ScreenGrab:
    # Define the position & dimension of the image to capture
    def __init__(self, positionX, positionY, width, height, monitor):
        self.x = positionX
        self.y = positionY
        self.width = width
        self.height = height
        self.img =  ImageGrab.grab(bbox=(self.x, self.y, self.width, self.height)) #x, y, w, h
        self.img_np = np.array(self.img)
        self.frame = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

    def captureImg(self):
        pass

    def parseText(self):
        text = pytesseract.image_to_string(self.frame, config=config)
        return text
    
    def displayFrame(self):
        while True:
            cv2.imshow("Frame:", self.frame)
            if cv2.waitKey(0):
                break
            
    def displayImage(self):
        while True:
            cv2.imshow("Image:", self.img)
            if cv2.waitKey(0):
                break
    
 # TODO: Set this up as a class that takes in position & size of img to capture
def screenGrab():
    box = ()
    im = ImageGrab.grab(bbox=None)
    im.save(os.getcwd() + '\\full_snap__' + str(int(time.time())) +
'.png', 'PNG')
 
def main():
    screenGrab()
 
if __name__ == '__main__':
    main()