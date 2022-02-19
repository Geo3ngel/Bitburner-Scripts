import numpy as np
import cv2
from PIL import ImageGrab
import os
import time
from pytesseract import image_to_string

config = ('-l eng --oem 1 --psm 3')
class ScreenGrab:
    # Define the position & dimension of the image to capture
    def __init__(self, positionX, positionY, width, height, monitor=0):
        self.x = positionX
        self.y = positionY
        self.width = width
        self.height = height
        self.img =  ImageGrab.grab(bbox=(self.x, self.y, self.x+ self.width,self.y + self.height)) #x, y, w, h
        self.img_np = np.array(self.img)
        self.frame = cv2.cvtColor(self.img_np, cv2.COLOR_BGR2GRAY)

    def parseText(self):
        text = image_to_string(self.frame, config=config)
        return text
    
    def flipFrame(self):
        self.frame = cv2.flip(self.frame)
    
    def displayFrame(self):
        while True:
            cv2.imshow("Frame:", self.frame)
            if cv2.waitKey(0):
                break
            
    def displayImage(self):
        while True:
            cv2.imshow("Image:", self.img_np)
            if cv2.waitKey(0):
                break
    
    def makeFileName(self, name, directory, unique=True):
        fileName = os.getcwd() + '\\' 
        if directory is not "":
            fileName = fileName + directory + '\\'
        fileName = fileName + name 
        if unique:
            fileName = fileName + str(int(time.time()))
        return fileName
            
    def saveImage(self, name, directory="", unique=True):
        self.img.save(self.makeFileName(name, directory, unique) + '.png', 'PNG')
        
    def saveFrame(self, name, directory="", unique=True):
        self.img.save(self.makeFileName(name, directory, unique) + '.png', 'PNG')