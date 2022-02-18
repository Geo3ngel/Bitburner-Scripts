from FiniteStateMachine import FiniteStateMachine
from ScreenGrab import ScreenGrab
# Runs the main loop for capturing images & processing them via State Machine.
miniGameStatePosX = 100
miniGameStatePosY = 100
miniGameWidth = 1000
miniGameHeight = 100

# Fill with state names!
MiniGames = {
    "backwards" : "TYPE_BACKWARDS_STATE",
    "slash" : "SLASHING_STATE",
    "wires" : "WIRES_STATE",
    "compliment" : "COMPLIMENT_GAURD_STATE",
    "brackets" : "CLOSE_BRACKETS_STATE",
    "mines" : "MINES_STATE", # Remember state & Replay state needed!
    "symbols" : "MATCH_SYMBOLS_STATE"
}
    
def checkMiniGameState(img):
    # Set the position and dimensions to check for the MiniGameState.
    stateCheck = ScreenGrab(miniGameStatePosX, miniGameStatePosY, miniGameWidth, miniGameHeight);
    # Parse image into Text
    stateText = stateCheck.parseText().lower();
    # Determine which mini game it is in based on text (If any)
    print(stateText)
    for text in MiniGames.keys():
        if text in stateText:
            # Return the state w/ the img from current Screen Grab!
            return (MiniGames[text], img)
    # Return error state? (End w/ Debug) Eventually, we want this to just output to an error log, and restart
    
# TODO: Define functions for each state!
def typeItBackwards():
    # Check we are still in this state
    stateCheck = ScreenGrab(); # TODO: Determine position for checking mini-game state

# TODO: Set up main loop to use ScreenGrab for getting new images, and interacting w/ them.
m = FiniteStateMachine()
# Input for the state machine's functions to run with/process
cargo = []
m.run(cargo)