export const solutions = {
  1: {
    solution: "moveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()"
  },
  2: {
    solution: "repeat(8, moveRight)"
  },
  3: {
    solution: "speed = 5\nrepeat(2, moveRight)"
  },
  4: {
    solution: "if doorOpen then\n  repeat(8, moveRight)\nelse\n  moveRight()\n  moveRight()\n  jump()\n  repeat(6, moveRight)\nend"
  },
  5: {
    solution: "function hop()\n  jump()\n  moveRight()\n  moveRight()\n  moveRight\nend\nrepeat(3, hop)"
  },
  6: {
    // Bug Hunt (solution is per-bug)
    bugSolutions: {
      1: "repeat(8, moveRight)",
      2: "moveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()",
      3: "if doorOpen then\n  repeat(8, moveRight)\nelse\n  moveRight()\n  moveRight()\n  jump()\n  repeat(6, moveRight)\nend"
    }
  },
  7: {
    solution: "-- Solutions are custom since you built this level!\nmoveRight()"
  },
  8: {
    solution: "function step()\n  if isTrap() then\n    jump()\n  else\n    moveRight()\n  end\nend\nrepeat(11, step)"
  },
  9: {
    solution: "function step()\n  if inMudZone() then\n    speed = 1\n  elseif inFastZone() then\n    speed = 2\n  else\n    speed = 3\n  end\n  moveRight()\nend\nrepeat(11, step)"
  },
  10: {
    solution: "moveRight()\nif isBlocked() then\n  jump()\n  moveRight()\n  moveRight()\n  moveRight()\n  jump()\n  moveRight()\n  moveRight()\nelse\n  moveRight()\n  moveRight()\n  moveRight()\n  jump()\n  moveRight()\n  moveRight()\nend\nspeed = 3\nmoveRight()",
    hints: [
      "💡 Watch the bypass platform at the top. If the door is blocked, you'll need to jump onto it!",
      "💡 Use jump() over the traps. In stage 10, jump() will jump 2 columns forward to safely cross the trap.",
      "💡 At col 8, adjust speed = 3 to jump the double-gap at cols 9-10."
    ]
  },
  11: {
    solution: "speed = 3\nrepeat(3, moveRight)",
    hints: [
      "💡 Try using speed = 3 to cover more distance per step.",
      "💡 repeat(3, moveRight) will move you 3 times. If speed = 3, that covers exactly 9 tiles!",
      "💡 Code: speed = 3, repeat(3, moveRight)"
    ]
  },
  12: {
    // Double Bug Hunt
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
    solution: "function jumpAndMove(h)\n  jump(h)\n  moveRight()\nend\njumpAndMove(2)\njumpAndMove(4)\njumpAndMove(6)"
  },
  14: {
    solution: "useItem(backpack[1])\nmoveRight()\nmoveRight()\nuseItem(backpack[2])\nmoveRight()\nmoveRight()\nuseItem(backpack[3])\nmoveRight()\nmoveRight()\nuseItem(backpack[4])\nmoveRight()\nmoveRight()"
  },
  15: {
    solution: "roll = math.random(1, 3)\nif roll == 1 then\n  collect(\"sword\")\nelseif roll == 2 then\n  collect(\"shield\")\nelse\n  collect(\"potion\")\nend"
  },
  16: {
    solution: "score = 0\nmoves = 0\nwhile moves < 20 do\n  moveRight()\n  if coinNearby() then\n    collectCoin()\n    score = score + 1\n  end\n  moves = moves + 1\nend\ndisplayScore(score)",
    hints: [
      "💡 Initialize your score and moves variables to 0 at the start.",
      "💡 Create a while loop that checks if moves < 20.",
      "💡 Inside the loop, moveRight() and check if coinNearby() is true. If it is, collectCoin() and add 1 to score."
    ]
  },
  17: {
    solution: "-- Enemy Patrolling Solution:\n-- position = 0\n-- direction = 1\n-- while true do\n--   position = position + direction\n--   moveTo(position)\n--   if position >= 8 then direction = -1 end\n--   if position <= 0 then direction = 1 end\n--   wait(0.5)\n-- end",
    hints: [
      "💡 Enemy patrolling logic requires moving between col 0 and col 8.",
      "💡 Set up a while true do loop for NPC patrol.",
      "💡 In the player script, jump to dodge the enemy when they approach."
    ]
  },
  18: {
    solution: "timeLeft = 30\nwhile timeLeft > 0 do\n  wait(1)\n  timeLeft = timeLeft - 1\n  updateTimer(timeLeft)\nend\ngameOver()",
    hints: [
      "💡 The timer loop runs while timeLeft > 0.",
      "💡 Inside the loop, wait 1 second and subtract 1 from timeLeft.",
      "💡 Update the timer display with updateTimer(timeLeft)."
    ]
  },
  19: {
    solution: "function solveRoom()\n  repeat(4, moveRight)\n  jump()\nend\nrepeat(4, solveRoom)",
    hints: [
      "💡 Each room is identical! You can write a function for one room and call it 4 times.",
      "💡 Use a repeat loop to repeat the custom function.",
      "💡 Define: function solve() repeat(4, moveRight) jump() end"
    ]
  },
  20: {
    solution: "-- Creative Sandbox! Write any code you like!\nmoveRight()",
    hints: [
      "💡 This is a free play sandbox. Play with loops, speed, jumps, and custom functions!",
      "💡 Try building a patrolling NPC or placing obstacles to jump over.",
      "💡 Experiment with variables and speed pads."
    ]
  }
};
