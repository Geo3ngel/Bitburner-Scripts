import numpy as np
import cv2
from PIL import ImageGrab
import os
import time
from pytesseract import image_to_string

colorMap = {
    # Map color name to rgb values!
    "red" : [0, 0 ,0], 
    "blue" : [], 
    "yellow" : [], 
    "white" : []
}

leftArrow = cv2.imread('left-arrow.PNG')
leftArrowGrey = cv2.cvtColor(leftArrow, cv2.COLOR_BGR2GRAY)
rightArrow = cv2.imread('right-arrow.PNG')
rightArrowGrey = cv2.cvtColor(leftArrow, cv2.COLOR_BGR2GRAY)
upArrow = cv2.imread('up-arrow.PNG')
upArrowGrey = cv2.cvtColor(leftArrow, cv2.COLOR_BGR2GRAY)
downArrow = cv2.imread('down-arrow.PNG')
downArrowGrey = cv2.cvtColor(leftArrow, cv2.COLOR_BGR2GRAY)

arrowMap = {
    "left" : leftArrowGrey,
    "right" : rightArrowGrey,
    "up" : upArrowGrey,
    "down" : downArrowGrey
}

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
        flipped = cv2.flip(self.img_np, 1)
        self.frame = cv2.cvtColor(flipped, cv2.COLOR_BGR2GRAY)
        
    def directionMatch(self):
        for direction in arrowMap.keys():
            # Compare this image to the arrow image
            res = cv2.matchTemplate(self.frame, arrowMap[direction], cv2.TM_CCOEFF)
            threshold = 1
            loc = np.where(res >= threshold)
            for pt in zip(*loc[::-1]):
                print("PT:"+str(pt))
                # if pt != None:
                return direction;
        return -1 # No match
        
    def getColorNums(self, colors):
        colorNums = []
        # use colorMap to map colors to actual rgb values
        for color in colors:
            # mask img_np w/ each relevant color
            self.img_np
            # detect each "Blurb" location, and divide it to find it's column num!
            colorMap[color]
        return colorNums
    
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