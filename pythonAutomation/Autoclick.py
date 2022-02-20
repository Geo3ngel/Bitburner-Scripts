from pynput import mouse, keyboard
import time
# import asyncio
import threading

# qq = asyncio.Queue()

class AutoClicker:
    def __init__(self):
        self.mouse = mouse.Controller()
        self.keyboard = keyboard.Controller()
        self.x = 0
        self.y = 0
        self.active = True

    def press_key(self, key):
        time.sleep((1/60))
        self.keyboard.press(key)
        time.sleep((1/60))
        self.keyboard.release(key)
        
    def press_key_fast(self, key):
        time.sleep((1/300))
        self.keyboard.press(key)
        time.sleep((1/300))
        self.keyboard.release(key)
        
    def directMoveTo(self, x, y):
        cx, cy = self.mouse.position
        self.mouse.move(x-cx,y-cy)
        
    def mouse_select(self):
        self.mouse.press(mouse.Button.left)
        time.sleep((1/60))
        self.mouse.release(mouse.Button.left)
        
    def mouse_select_at(self, x, y):
        # Store mouse position before click attempt!
        prevX, prevY = self.mouse.position
        time.sleep(.2)
        self.directMoveTo(x, y)
        self.mouse_select()
        # Set to previous position!
        self.directMoveTo(prevX, prevY)
        
    def on_click(self, x, y, button, pressed):
        if not pressed and button == mouse.Button.middle:
            # print("Middle Click Detected (released)")
            print("X:", x, "Y:", y)
            self.x = x
            self.y = y
    def on_press(self, key):
        if key == keyboard.Key.esc:
            # print("Middle Click Detected (released)")
            self.active = not self.active
            print("Active: "+str(self.active))
            # if self.active:
            #     threading.Thread(target=self.run).start()
    def isActive(self):
        return self.active
    
    # def run(self):
    #     print("Running process")
    #     time.sleep(5)
    #     while self.active:
    #         print("Running...")
    #         time.sleep(1)
    #         self.mouse_select_at(auto.x, auto.y)
        

auto = AutoClicker()
# loop = asyncio.get_event_loop()
# loop.run_until_complete(auto.run())
mouse_listener = mouse.Listener(on_click=auto.on_click)    
keyboard_listener = keyboard.Listener(on_press=auto.on_press)

keyboard_listener.start()
mouse_listener.start()

while True:
    print("Running process")
    time.sleep(5)
    while auto.isActive():
        print("Running...")
        time.sleep(4)
        auto.mouse_select_at(auto.x, auto.y)
        time.sleep(.1)
        auto.mouse_select_at(auto.x, auto.y)