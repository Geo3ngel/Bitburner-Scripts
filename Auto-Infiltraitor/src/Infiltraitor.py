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
    time.sleep((1/600))
    _keyboard.press(key)
    time.sleep((1/600))
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
]
    
def checkCompleteState():
    # TODO: Update to actually check/verify we are in the completed state
    stateCheck = ScreenGrab(0, 0, 100, 100);
    # Parse some string?
    stateText = stateCheck.parseText().lower();
    if "reputation" is stateText:
        # TODO Select faction we want to give rep to (Might change to do intelligently LATER)
        # Select give Rep
        return ("COMPLETED_STATE", "Finished")
    else:
        # Error state. Log & restart
        print("Error in Completion State")
        return "ERROR_STATE"
    
def checkMiniGameState():
    # Set the position and dimensions to check for the MiniGameState.
    stateCheck = ScreenGrab(miniGameStatePosX, miniGameStatePosY, miniGameWidth, miniGameHeight);
    stateCheck.displayImage()
    # Parse image into Text
    stateText = stateCheck.parseText().lower();
    # Determine which mini game it is in based on text (If any)
    print(stateText)
    for text in MiniGames.keys():
        if text in stateText:
            # Returns what the current state is believed to be
            return MiniGames[text]
    # Return error state? (End w/ Debug) Eventually, we want this to just output to an error log, and restart
    return checkCompleteState()

def detectMiniGame(arg):
    print("Entered mini-game DETECTION")
    miniGame = checkMiniGameState()
    return (miniGame, None)
    
def typeItBackwards(arg):
    print("Entered Backwards Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "TYPE_BACKWARDS_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # Grab Backwards text area
        textArea = ScreenGrab(200, 500, 1000, 600) # TODO: Set correct area grab for these values
        textArea.flipFrame()
        text = textArea.parseText()
        # TODO: Type out text
        print("Backwards text: "+text)
    return (detectedState, None)

def cutTheWires(arg):
    print("Entered Wires Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "WIRES_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Process state
    return (detectedState, None)

def complimentTheGaurd(arg):
    print("Entered Compliment Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "COMPLIMENT_GAURD_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Process state
        # Read current message
        textArea = ScreenGrab(200, 500, 1000, 600) # TODO: Set correct area grab for these values
        currentMsg = textArea.parseText()
        # Determine whether to accept or press up
        if currentMsg in complimentsList:
            # Hit Enter
            pass
        else:
            # Hit up
            pass
    return (detectedState, None)

def closeTheBrackets(arg):
    print("Entered Brackets Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "TYPE_BACKWARDS_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Process state [Flip img!]
    return (detectedState, None)

def matchTheSymbols(arg):
    print("Entered Symbols Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "TYPE_BACKWARDS_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Process state
    return (detectedState, None)

# TODO: Create variants for this one based on whether or not his gaurd is down? (Will need to be done for all reaction based games)
def slashGaurd(arg):
    print("Entered Slashing Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    while detectedState is "SLASHING_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Implement slashing check & action
        # Check if it says attack
        attackImg = ScreenGrab(0, 0, 100, 20);
        attackStr = attackImg.parseText().lower()
        if "attack" in attackStr:
            # TODO: Hit the space bar!
            pass
    return (detectedState, None)

def mines(arg):
    print("Entered Mines Minigame")
    # Check we are still in this state
    detectedState = checkMiniGameState()
    minePositions = []
    while detectedState is "MINES_STATE":
        # Process state
        detectedState = checkMiniGameState()
        # TODO: Process state
        # Determine whether we are "remembering" the mines positions, or "marking" them.
        # TODO: Get area of mines to check
    return (detectedState, None)

def startState(arg):
    # Select City           # Might want to Add ability to target a specific City at some point.
    # Select Target         # Might want to make a list of coords to click in association with who you are targeting.
    # Select Infiltrate     
    # Start Infiltration    # COULD make it find the start button. [No reason to though, same place everytime]
    return ("DETECT_MINIGAME", "Start!")

def printResult(arg):
    print("PRINT: "+arg)

# TODO: Set up main loop to use ScreenGrab for getting new images, and interacting w/ them.
m = FiniteStateMachine()
m.add_state("START", startState)
m.add_state("DETECT_MINIGAME", detectMiniGame)
m.add_state("TYPE_BACKWARDS_STATE", typeItBackwards)
m.add_state("SLASHING_STATE", slashGaurd)
m.add_state("WIRES_STATE", cutTheWires)
m.add_state("COMPLIMENT_GAURD_STATE", complimentTheGaurd)
m.add_state("CLOSE_BRACKETS_STATE", closeTheBrackets)
m.add_state("MINES_STATE", mines)
m.add_state("MATCH_SYMBOLS_STATE", matchTheSymbols)
m.add_state("ERROR_STATE", None, end_state=1)
m.add_state("COMPLETED_STATE", None, end_state=1)
m.set_start("START")
# Input for the state machine's functions to run with/process
cargo = []
m.run(cargo)