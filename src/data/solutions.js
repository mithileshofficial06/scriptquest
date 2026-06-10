export const solutions = {
  1: {
    description: "Welcome to your first script! 🚀 Your goal is to move your Roblox avatar to the golden star on the right. Count the blocks from your avatar to the star (it's 9 blocks!). In the Lua editor, type moveRight() on 9 separate lines, then click the blue 'Run Code' button to watch your avatar go!",
    starterCode: "-- Move to the star!\n-- Type moveRight() on 9 separate lines:\nmoveRight()\nmoveRight()\n",
    solution: "moveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()"
  },
  2: {
    description: "Let's learn a cool shortcut! 🔁 Writing moveRight() 8 times is a lot of typing. Instead, we can use a LOOP. In Lua, repeat(8, moveRight) tells the computer: 'Do moveRight 8 times!' Type that single line in your editor and hit Run. It's that easy!",
    starterCode: "-- The star is 8 steps away.\n-- Use a loop shortcut: repeat(8, moveRight)\n",
    solution: "repeat(8, moveRight)"
  },
  3: {
    description: "Jump the gaps! 🏃‍♂️ There are empty holes in the path. A regular moveRight() only takes 1 step and you'll fall. We need to set a speed variable! Type speed = 5 at the top, then use moveRight() to leap 5 blocks in a single step right over the holes!",
    starterCode: "-- Set speed = 5 to leap 5 blocks per step!\nspeed = 5\n-- Now repeat moveRight to cross the level:\n",
    solution: "speed = 5\nrepeat(2, moveRight)"
  },
  4: {
    description: "The magic door! 🚪 Next to the star is a door. Sometimes it's OPEN (green) and sometimes it's CLOSED (red). You need an 'if/else' check! If the door is open, walk straight. Else (if closed), jump up onto the top platforms and go around. Check the starter code comments for tips!",
    starterCode: "-- The door changes state randomly on each run!\n-- Write an if/else check to handle both cases:\n-- if doorOpen then\n--   repeat(8, moveRight)\n-- else\n--   -- jump and walk along the top bypass path!\n-- end\n",
    solution: "if doorOpen then\n  repeat(8, moveRight)\nelse\n  moveRight()\n  moveRight()\n  jump()\n  repeat(6, moveRight)\nend"
  },
  5: {
    description: "Super jumps! 🧗‍♂️ You have 3 tall obstacles to climb over. The sequence is: jump() then moveRight() 3 times. Instead of typing this sequence 3 times, let's name it! Define a function hop() for the sequence, then call hop() 3 times to clear all obstacles!",
    starterCode: "-- Group the moves to clear ONE obstacle into hop():\nfunction hop()\n  jump()\n  moveRight()\n  moveRight()\n  moveRight()\nend\n-- Now run the function hop() 3 times:\n",
    solution: "function hop()\n  jump()\n  moveRight()\n  moveRight()\n  moveRight()\nend\nrepeat(3, hop)"
  },
  6: {
    description: "Become a bug squasher! 🐛 Broken code has been loaded. Your avatar is going to do something wrong. Watch them closely, read the code, find the mistakes (like spelling errors or wrong numbers), fix them, and hit Run to earn your badge!",
    bugSolutions: {
      1: "repeat(8, moveRight)",
      2: "moveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()",
      3: "if doorOpen then\n  repeat(8, moveRight)\nelse\n  moveRight()\n  moveRight()\n  jump()\n  repeat(6, moveRight)\nend"
    }
  },
  7: {
    description: "You're the developer! 🏗️ Place grass blocks, door triggers, and the golden star wherever you want to create your own map. Once you are happy with your level, switch to 'Solve' mode and write the Lua code to beat it!",
    solution: "-- Solutions are custom since you built this level!\nmoveRight()"
  },
  8: {
    description: "Danger zone! ⚡ Traps marked with red Xs will appear randomly on the floor. You must write a loop that takes steps, but checks for traps FIRST. If there is a trap, jump() over it. Else, moveRight() forward. Use isTrap() inside your loop!",
    starterCode: "-- Check for traps at every step inside your loop!\nfunction step()\n  if isTrap() then\n    jump() -- Jumps 2 columns forward to clear the trap!\n  else\n    moveRight()\n  end\nend\nrepeat(11, step)\n",
    solution: "function step()\n  if isTrap() then\n    jump()\n  else\n    moveRight()\n  end\nend\nrepeat(11, step)"
  },
  9: {
    description: "Terrain shift! 🌊 There are two different zones: a brown Mud Zone (slow down using speed = 1) and a blue Fast Zone (speed up using speed = 2 to jump the gap). Write a loop that checks which zone you are in and adjusts the speed!",
    starterCode: "-- Adjust your speed dynamically based on Mud and Fast zones!\nfunction step()\n  if inMudZone() then\n    speed = 1\n  elseif inFastZone() then\n    speed = 2\n  else\n    speed = 3 -- speed = 3 is needed to clear the gap at col 5!\n  end\n  moveRight()\nend\nrepeat(11, step)\n",
    solution: "function step()\n  if inMudZone() then\n    speed = 1\n  elseif inFastZone() then\n    speed = 2\n  else\n    speed = 3\n  end\n  moveRight()\nend\nrepeat(11, step)"
  },
  10: {
    description: "The ultimate challenge! 🎖️ This map has everything: a locked door, traps, and a double-gap. There are no command panels or hints this time — you are coding solo! Use variables, loops, conditions, and functions together to reach the final star!",
    starterCode: "-- Move to col 1, check if the door is blocked, bypass if needed,\n-- jump the traps, and speed = 3 to jump the double gap at the end!\n",
    solution: "moveRight()\nif isBlocked() then\n  jump()\n  moveRight()\n  moveRight()\n  moveRight()\n  jump()\n  moveRight()\n  moveRight()\nelse\n  moveRight()\n  moveRight()\n  moveRight()\n  jump()\n  moveRight()\n  moveRight()\nend\nspeed = 3\nmoveRight()",
    hints: [
      "💡 Watch the bypass platform at the top. If the door is blocked, you'll need to jump onto it!",
      "💡 Use jump() over the traps. In stage 10, jump() will jump 2 columns forward to safely cross the trap.",
      "💡 At col 8, adjust speed = 3 to jump the double-gap at cols 9-10."
    ]
  },
  11: {
    description: "Line challenge! ⚡ Reach the star in EXACTLY 5 lines of code! Combine speed settings and loops to find the most efficient path.",
    solution: "speed = 3\nrepeat(3, moveRight)",
    hints: [
      "💡 Try using speed = 3 to cover more distance per step.",
      "💡 repeat(3, moveRight) will move you 3 times. If speed = 3, that covers exactly 9 tiles!",
      "💡 Code: speed = 3, repeat(3, moveRight)"
    ]
  },
  12: {
    description: "Advanced Bug Hunt! 🔍 Two sneakier bugs are hidden in this script. Read carefully and catch them both!",
    bugSolutions: {
      1: "repeat(3, moveRight)\njump()\nrepeat(4, moveRight)",
      2: "if doorOpen then\n  repeat(8, moveRight)\nelse\n  repeat(2, moveRight)\n  jump()\n  repeat(6, moveRight)\nend"
    },
    bugHints: {
      1: [
        "💡 Look at the avatar. Does it overshoot or stop too early?",
        "💡 Count the steps from the landing block to the star.",
        "💡 The second repeat command is repeat(5, moveRight) but needs to be 4."
      ],
      2: [
        "💡 Check the if condition spelling. What variable is shown in the environment panel?",
        "💡 The door variable is called doorOpen, not doorOpened.",
        "💡 Change if doorOpened then to if doorOpen then."
      ]
    }
  },
  13: {
    description: "Parameters power! 🎁 Learn how to pass numbers (inputs) into functions so they can behave differently.",
    solution: "function jumpAndMove(h)\n  jump(h)\n  moveRight()\nend\njumpAndMove(2)\njumpAndMove(4)\njumpAndMove(6)"
  },
  14: {
    description: "Backpack inventory! 📦 Use a backpack table (list) to access items and unlock doors of different colors.",
    solution: "useItem(backpack[1])\nmoveRight()\nmoveRight()\nuseItem(backpack[2])\nmoveRight()\nmoveRight()\nuseItem(backpack[3])\nmoveRight()\nmoveRight()\nuseItem(backpack[4])\nmoveRight()\nmoveRight()"
  },
  15: {
    description: "Mystery chests! 🎲 Handle random chest loot outcomes using a combination of if, elseif, and else checks.",
    solution: "roll = math.random(1, 3)\nif roll == 1 then\n  collect(\"sword\")\nelseif roll == 2 then\n  collect(\"shield\")\nelse\n  collect(\"potion\")\nend"
  },
  16: {
    description: "Create a game tracker! 🎮 Collect as many coins as you can and keep score inside your loop.",
    solution: "score = 0\nmoves = 0\nwhile moves < 20 do\n  moveRight()\n  if coinNearby() then\n    collectCoin()\n    score = score + 1\n  end\n  moves = moves + 1\nend\ndisplayScore(score)",
    hints: [
      "💡 Initialize your score and moves variables to 0 at the start.",
      "💡 Create a while loop that checks if moves < 20.",
      "💡 Inside the loop, moveRight() and check if coinNearby() is true. If it is, collectCoin() and add 1 to score."
    ]
  },
  17: {
    description: "Program an enemy NPC! 🤖 Write the patrolling behavior code for a guard and time your moves to avoid it.",
    solution: "-- Enemy Patrolling Solution:\n-- position = 0\n-- direction = 1\n-- while true do\n--   position = position + direction\n--   moveTo(position)\n--   if position >= 8 then direction = -1 end\n--   if position <= 0 then direction = 1 end\n--   wait(0.5)\n-- end",
    hints: [
      "💡 Enemy patrolling logic requires moving between col 0 and col 8.",
      "💡 Set up a while true do loop for NPC patrol.",
      "💡 In the player script, jump to dodge the enemy when they approach."
    ]
  },
  18: {
    description: "Timed game challenge! ⏱️ Write a countdown timer and trigger the game over state when it runs out.",
    solution: "timeLeft = 30\nwhile timeLeft > 0 do\n  wait(1)\n  timeLeft = timeLeft - 1\n  updateTimer(timeLeft)\nend\ngameOver()",
    hints: [
      "💡 The timer loop runs while timeLeft > 0.",
      "💡 Inside the loop, wait 1 second and subtract 1 from timeLeft.",
      "💡 Update the timer display with updateTimer(timeLeft)."
    ]
  },
  19: {
    description: "The Grand Heist! 🏛️ Clear four challenging rooms using loops and functions in under 20 lines.",
    solution: "function solveRoom()\n  repeat(4, moveRight)\n  jump()\nend\nrepeat(4, solveRoom)",
    hints: [
      "💡 Each room is identical! You can write a function for one room and call it 4 times.",
      "💡 Use a repeat loop to repeat the custom function.",
      "💡 Define: function solve() repeat(4, moveRight) jump() end"
    ]
  },
  20: {
    description: "Creative sandbox! 🎨 No rules, no limits. Build and program anything you can imagine!",
    solution: "-- Creative Sandbox! Write any code you like!\nmoveRight()",
    hints: [
      "💡 This is a free play sandbox. Play with loops, speed, jumps, and custom functions!",
      "💡 Try building a patrolling NPC or placing obstacles to jump over.",
      "💡 Experiment with variables and speed pads."
    ]
  }
};
