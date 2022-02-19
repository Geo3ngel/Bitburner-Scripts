from FiniteStateMachine import FiniteStateMachine
from ScreenGrab import ScreenGrab
from pynput import mouse, keyboard
import time
# Runs the main loop for capturing images & processing them via State Machine.
miniGameStatePosX = 0
miniGameStatePosY = 75
miniGameWidth = 1000
miniGameHeight = 150

_mouse = mouse.Controller()
_keyboard = keyboard.Controller()

def press_key(key):
    time.sleep((1/60))
    _keyboard.press(key)
    time.sleep((1/60))
    _keyboard.release(key)
    
def press_key_fast(key):
    time.sleep((1/300))
    _keyboard.press(key)
    time.sleep((1/300))
    _keyboard.release(key)
    
def directMoveTo(x, y):
    cx, cy = _mouse.position
    _mouse.move(x-cx,y-cy)
    
def mouse_select():
    _mouse.press(mouse.Button.left)
    time.sleep((1/60))
    _mouse.release(mouse.Button.left)
    
def mouse_select_at(x, y):
    time.sleep(.2)
    directMoveTo(x, y)
    mouse_select()
    
# Fill with state names!
MiniGames = {
    "backward" : "TYPE_BACKWARDS_STATE",
    "slash" : "SLASHING_STATE",
    "wires" : "WIRES_STATE",
    "nice" : "COMPLIMENT_GAURD_STATE",
    "bracket" : "CLOSE_BRACKETS_STATE",
    "mine" : "MINES_STATE", # Remember state & Replay state needed!
    "symbols" : "MATCH_SYMBOLS_STATE",
    "code" : "CHEAT_CODE",
    "get ready" : "DETECT_MINIGAME" 
}

directionKey = {
    "up" : keyboard.Key.up,
    "down" : keyboard.Key.down,
    "right" : keyboard.Key.right,
    "left" : keyboard.Key.left    
}

colorList = [
    "red", "blue", "yellow", "white"
]

numberList = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
]

complimentsList = [
    "affectionate",
    "agreeable",
    "bright",
    "charming",
    "creative",
    "determined",
    "energetic",
    "friendly",
    "funny",
    "generous",
    "polite",
    "likable",
    "diplomatic",
    "helpful",
    "giving",
    "kind",
    "hardworking",
    "patient",
    "dynamic",
    "loyal",
    "atesve-w" # How it reads 'loyal' right now due to not training the model on these chars.
]
    
def checkCompleteState():
    stateCheck = ScreenGrab(0, 50, 100, 50);
    # Parse some string?
    stateText = stateCheck.parseText().lower();
    print("COMPLETE TEXT: "+stateText)
    if "successful" is stateText:
        # Select give Rep
        mouse_select_at(60, 275)
        time.sleep(.1)
        mouse_select_at(108, 823) # Change for faciton selection! [Will make intelligent selection model later]
        time.sleep(.1)
        mouse_select_at(200, 275)
        return ("COMPLETED_STATE", "Finished")
    else:
        # Error state. Log & restart
        print("Error in Completion State")
        stateCheck.saveImage("COMPLETE CHECK")
        return "ERROR_STATE"
    
def checkMiniGameState():
    # Set the position and dimensions to check for the MiniGameState.
    stateCheck = ScreenGrab(miniGameStatePosX, miniGameStatePosY, miniGameWidth, miniGameHeight);
    # Parse image into Text
    stateText = stateCheck.parseText().lower();
    # Determine which mini game it is in based on text (If any)
    print(stateText)
    for text in MiniGames.keys():
        if text in stateText:
            # Returns what the current state is believed to be
            return MiniGames[text]
    time.sleep(.1)
    # Return error state? (End w/ Debug) Eventually, we want this to just output to an error log, and restart
    completed = checkCompleteState()
    if completed is "ERROR_STATE":
        stateCheck.saveImage("ERROR", unique=False)
    return completed

def detectMiniGame(arg):
    print("Entered mini-game DETECTION")
    miniGame = checkMiniGameState()
    return (miniGame, None)
    
def typeItBackwards(arg):
    print("Entered Backwards Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "TYPE_BACKWARDS_STATE":
        # Grab Backwards text area
        textArea = ScreenGrab(400, 170, 800, 250)
        textArea.flipFrame()
        textArea.saveFrame("BACKWARDS")
        text = textArea.parseText().replace('|', '').strip()
        for character in text:
            press_key_fast(character)
            print("TYPING... "+str(character))
        print("Backwards text: "+text)
        detectedState = checkMiniGameState()
    return (detectedState, None)

def cutTheWires(arg):
    print("Entered Wires Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "WIRES_STATE":
        textArea = ScreenGrab(200, 500, 1000, 600) # TODO: Set correct area grab for these values
        # textArea.saveImage("WIRE STATE")
        text = textArea.parseText().lower()
        for num in numberList:
            if num in text:
                press_key(chr(num))
        # Scan the columns
        colorArea = ScreenGrab(200, 500, 1000, 600) # TODO: Set correct area grab for these values
        # colorArea.saveImage("COLOR AREA")
        # TODO: Figure out a good way to check each column? (How to determine number of columns? How to determine where each column is?)
        colors = []
        for color in colorList:
            if color in text:
                colors.append(color)
        colorNums = colorArea.getColorNums(colors)
        for num in colorNums:
            press_key(chr(num))
        detectedState = checkMiniGameState()
    return (detectedState, None)

def complimentTheGuard(arg):
    print("Entered Compliment Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "COMPLIMENT_GAURD_STATE":
        # Read current message
        textArea = ScreenGrab(0, 285, 200, 35) # Does this position change based on if it is the first one to go?
        # textArea.saveImage("GUARD")
        currentMsg = textArea.parseText().lower()
        # print("Guard compliment: "+currentMsg)
        # Determine whether to accept or press up
        if currentMsg in complimentsList:
            # Hit Enter
            press_key_fast(keyboard.Key.space)
        else:
            # Hit up
            press_key_fast(keyboard.Key.up)
            time.sleep(.1)
        detectedState = checkMiniGameState()
    return (detectedState, None)

# TODO: NOTE: I'm pretty sure we don't actually have to do this intelligently.
# Could probably just spam ')', '>', ']', '}' keys and do just fine.
def closeTheBrackets(arg):
    print("Entered Brackets Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "CLOSE_BRACKETS_STATE":
        textArea = ScreenGrab(0, 245, 700, 100)
        textArea.flipFrame()
        textArea.saveFrame("BRACKETS")
        text = textArea.parseText().replace('|', '').strip()
        print("BRACKETS : "+text)
        for character in text:
            # press_key(character) # Might need a bit more delay!
            press_key_fast(character)
        detectedState = checkMiniGameState()
    return (detectedState, None)

def matchTheSymbols(arg):
    print("Entered Symbols Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "MATCH_SYMBOLS_STATE":
        textArea = ScreenGrab(125, 195, 700, 35)
        # Just replacing 'o' with '0' this way for now. Should realistically train a model using this font/Restrict it's alphabet via config
        text = textArea.parseText().lower().replace("o", "0")
        # print("Symbol order: "+text)
        # textArea.saveImage("ImageArea")
        # Splice text by space for the array!
        # TODO: Switch to attemping to read each row individually! (Trying to read the entire array is a mess!)
        symbolArray = [x for x in text.split()]
        # print("Symbol array: "+str(symbolArray))
        gridArea = ScreenGrab(0, 280, 450, 550)     # 0, 280 => 360, 650
        grid = gridArea.parseText().lower().replace("o", "0")
        # gridArea.saveFrame("GridArea")
        # print("Symbol grid: "+grid)
        gridArr = [x for x in grid.split()]
        # Grid length? Split into rows... (Could capture a single column to calc this?)
        # TODO: Parse text into grid
        print("Symbol grid array: "+str(gridArr))
        # Solve in order
        detectedState = checkMiniGameState()
    return (detectedState, None)

def slashGaurd(arg):
    # print("Entered Slashing Minigame")
    # Check we are still in this state
    time.sleep(.1)
    detectedState = checkMiniGameState()
    while detectedState is "SLASHING_STATE":
        # Check if it says attack
        attackImg = ScreenGrab(0, 230, 350, 55);
        attackStr = attackImg.parseText().lower()
        # attackImg.saveImage("ATTACK")
        if "attack" in attackStr:
            # print("Attacking")
            # press_key(keyboard.Key.enter)
            press_key_fast(keyboard.Key.space)
        detectedState = checkMiniGameState()
    return (detectedState, None)

def cheatCode(arg):
    print("Entered Cheat Code Minigame")
    time.sleep(.1)
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "CHEAT_CODE":
        # Process state
        # Check if it says attack
        direction = ScreenGrab(0, 220, 75, 100);
        directionStr = direction.directionMatch()
        print("DIRECTION: "+str(directionStr))
        if directionStr is -1:
            direction.saveImage("MISSING_ARROW")
        else:
            # press_key(directionKey[directionStr])
            dirKey = directionKey[directionStr]
            press_key_fast(dirKey)
        detectedState = checkMiniGameState()
    return (detectedState, None)

def mines(arg):
    print("Entered Mines Minigame")
    # Check we are still in this state
    time.sleep(.1)
    detectedState = checkMiniGameState()
    minePositions = []
    while detectedState is "MINES_STATE":
        minesStateImg = ScreenGrab(0, 160, 400, 65);
        minesState = minesStateImg.parseText().lower()
        # minesStateImg.saveImage("Mine STATE")
        # Determine whether we are "remembering" the mines positions, or "marking" them.
        # TODO: Memorize & mark!
        minesImg = ScreenGrab(0, 225, 300, 295);
        minesText = minesImg.parseText()
        # minesImg.saveImage("MINES ")
        # print("MINES: "+minesText)
        if "remember" in minesState:
            # store matches in minePositions!
            print("Memorizing!")
        else:
            print("Remembering")
        detectedState = checkMiniGameState()
    return (detectedState, None)

def startState(arg):
    # Select City           # Might want to Add ability to target a specific City at some point.
    mouse_select_at(95, 670)
    # Select Target         # Might want to make a list of coords to click in association with who you are targeting.
    # mouse_select_at(356, 338)
    mouse_select_at(475, 500)
    # Select Infiltrate     
    # mouse_select_at(351, 516)
    mouse_select_at(380, 235)
    # Start Infiltration    # COULD make it find the start button. [No reason to though, same place everytime]
    # mouse_select_at(35, 708)
    mouse_select_at(40, 618)
    time.sleep(1.1)
    return ("DETECT_MINIGAME", "Start!")

def printResult(arg):
    print("PRINT: "+arg)

m = FiniteStateMachine()
m.add_state("START", startState)
m.add_state("DETECT_MINIGAME", detectMiniGame)
m.add_state("TYPE_BACKWARDS_STATE", typeItBackwards)
m.add_state("SLASHING_STATE", slashGaurd)
m.add_state("WIRES_STATE", cutTheWires)
m.add_state("COMPLIMENT_GAURD_STATE", complimentTheGuard)
m.add_state("CLOSE_BRACKETS_STATE", closeTheBrackets)
m.add_state("CHEAT_CODE", cheatCode)
m.add_state("MINES_STATE", mines)
m.add_state("MATCH_SYMBOLS_STATE", matchTheSymbols)
m.add_state("ERROR_STATE", None, end_state=1)
m.add_state("COMPLETED_STATE", None, end_state=1)
m.set_start("START")
# Input for the state machine's functions to run with/process
cargo = []
m.run(cargo)