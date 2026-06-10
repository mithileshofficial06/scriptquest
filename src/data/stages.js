/* Stage definitions for ScriptQuest.
   Each stage defines its world layout, starting position, goal, and educational content. */

export const TILE_SIZE = 60;
export const GRID_COLS = 12;
export const GRID_ROWS = 8;

/**
 * Tile types:
 * 0 = empty (air)
 * 1 = platform (solid ground)
 * 2 = wall (solid wall block)
 */
export const TILE_EMPTY = 0;
export const TILE_PLATFORM = 1;
export const TILE_WALL = 2;
export const TILE_DOOR = 3;

export const stages = [
  {
    id: 1,
    name: 'First Steps',
    subtitle: 'Commands',
    description: 'Move your avatar to the star!',
    availableFunctions: ['moveRight()', 'moveLeft()', 'moveUp()', 'moveDown()', 'jump()'],
    starterCode: '-- Write your commands here!\n-- Use moveRight() to move right\n\n',
    // Grid: row 0 = top, row 7 = bottom
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { col: 1, row: 5 }, // standing on row 6 platform, avatar at row 5
    starPosition: { col: 10, row: 5 },
    optimalLines: 9, // moveRight() x9
    celebration: {
      title: '🎉 You just wrote a program!',
      explanation:
        'Each line you wrote is a **command**. Lua runs them one by one, from top to bottom — this is called **sequential execution**.\n\nJust like giving directions to a friend, your code told the avatar exactly what to do, step by step!',
      concept: 'Sequential Execution',
    },
    errorMessages: {
      wall: "Nothing there to walk into. Try a different direction!",
      fall: "Whoops! Your avatar fell off the platform. Try again!",
      outOfBounds: "That's outside the world! Try staying on the path.",
    },
  },
  {
    id: 2,
    name: 'Loop Land',
    subtitle: 'Loops',
    description: 'Reach the star — but can you do it in fewer lines?',
    availableFunctions: ['moveRight()', 'moveLeft()', 'repeat(n, func)'],
    starterCode: '-- The star is far away!\n-- Try reaching it with moveRight()\n\n',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { col: 1, row: 5 },
    starPosition: { col: 9, row: 5 }, // 8 steps to the right
    optimalLines: 1, // repeat(8, moveRight)
    lineCountChallenge: 3, // "Can you do it in under 3 lines?"
    celebration: {
      title: '🎉 You reached the star!',
      explanation:
        'You wrote **moveRight()** eight times — and it worked! But writing the same thing over and over is tedious.\n\nIn Lua, you can use a **loop** to repeat a command. Instead of 8 lines, try this:',
      concept: 'Loops',
      codeHint: 'repeat(8, moveRight)',
      codeHintLabel: 'Same result, just 1 line! 🤯',
      retryPrompt: '🔁 Try it with repeat() — can you do it in under 3 lines?',
    },
    errorMessages: {
      wall: "Nothing there to walk into. Try a different direction!",
      fall: "Whoops! Your avatar fell off the edge!",
      outOfBounds: "That's outside the world! Stay on the path.",
    },
  },
  {
    id: 3,
    name: 'Speed Boost',
    subtitle: 'Variables',
    description: 'Set the right speed to clear the gaps!',
    availableFunctions: ['moveRight()', 'speed = 5', 'repeat(n, func)'],
    starterCode: '-- Set your speed to jump the gaps!\n-- speed = ???\n-- Then use moveRight()\n\n',
    // Three platforms separated by 2-tile gaps
    // Platform A: cols 0-2  |  gap: 3-4  |  Platform B: cols 5-7  |  gap: 8-9  |  Platform C: cols 10-11
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    ],
    playerStart: { col: 1, row: 5 },
    starPosition: { col: 11, row: 5 },
    optimalLines: 2, // speed = 5 + repeat(2, moveRight)  or  speed = 10 + moveRight()
    lineCountChallenge: 3,
    celebration: {
      title: '🎉 You mastered speed!',
      explanation:
        'You created a **variable** called **speed** and gave it a value. Variables are like labeled boxes — you put a number inside and the computer remembers it.\n\nWhen you wrote **speed = 5**, every **moveRight()** moved 5 tiles instead of 1. The value you chose determined whether you cleared the gaps or fell!',
      concept: 'Variables',
      codeHint: 'speed = 5\nrepeat(2, moveRight)',
      codeHintLabel: 'Variables + loops in just 2 lines!',
    },
    errorMessages: {
      wall: "You hit something solid. Try a different direction!",
      fall: "Your avatar fell into the gap! Try adjusting your speed value.",
      outOfBounds: "Your avatar overshot the world! Try a smaller speed.",
    },
  },
  {
    id: 4,
    name: 'If Island',
    subtitle: 'Conditionals',
    description: 'The door to the star randomly opens or closes! Use an if/else block to handle both paths.',
    availableFunctions: ['moveRight()', 'moveLeft()', 'jump()', 'if doorOpen then', 'else', 'end'],
    starterCode: '-- The doorOpen variable changes randomly every run!\n-- Write an if/else block to choose the right path:\n-- if doorOpen then\n--   -- go straight\n-- else\n--   -- go around\n-- end\n\n',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // ledge platform
      [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0], // path floor (door at col 5)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // main floor
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { col: 1, row: 5 },
    starPosition: { col: 9, row: 5 },
    optimalLines: 7,
    lineCountChallenge: 8,
    celebration: {
      title: '🎉 You unlocked the gate!',
      explanation:
        'You used an **if/else conditional**! This lets your program make decisions based on variables.\n\nWhen the door was open, your code ran the first branch. When the door was closed, it ran the alternative path. That is how smart programs work!',
      concept: 'Conditionals (If/Else)',
    },
    errorMessages: {
      wall: "Oops! The door is closed, or you ran into a ledge. Try checking doorOpen!",
      fall: "Whoops! Your avatar fell off the path. Make sure to jump at the right place!",
      outOfBounds: "That's outside the world! Keep your avatar on the grid.",
    },
    hasRandomDoor: true,
  },
  {
    id: 5,
    name: 'Function Falls',
    subtitle: 'Functions',
    description: 'Define a custom function to cross the repeated obstacles in fewer lines!',
    availableFunctions: ['moveRight()', 'jump()', 'function name()', 'end'],
    starterCode: '-- Cross the three identical obstacles!\n-- Create a custom function to group your moves,\n-- then call it to clear each obstacle.\n\n',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1], // ledge platforms
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // corridor
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // main floor gaps
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    ],
    playerStart: { col: 0, row: 5 },
    starPosition: { col: 11, row: 3 },
    optimalLines: 10,
    lineCountChallenge: 10,
    celebration: {
      title: '🎉 You are a software architect!',
      explanation:
        'You created your very own **custom function**!\n\nFunctions let you group a sequence of commands and give them a single name. Instead of writing the same 4 steps over and over, you defined it once and called it by name. This makes your code cleaner, shorter, and much easier to read!',
      concept: 'Custom Functions',
    },
    errorMessages: {
      wall: "Oops! You hit a wall or fell off. Check your function definition!",
      fall: "Your avatar fell into a gap! Make sure you repeat the correct pattern.",
      outOfBounds: "Out of bounds! Stay on the platforms.",
    },
  },
  {
    id: 6,
    name: 'Bug Hunt',
    subtitle: 'Debugging',
    description: 'Find and fix the bugs in broken code!',
    mode: 'bugHunt',
    availableFunctions: ['moveRight()', 'moveLeft()', 'jump()', 'repeat(n, func)', 'if doorOpen then', 'else', 'end'],
    starterCode: '',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { col: 1, row: 5 },
    starPosition: { col: 9, row: 5 },
    optimalLines: 1,
    celebration: {
      title: '🔨 All Bugs Squashed!',
      explanation:
        'You found and fixed **3 real bugs**! Debugging is one of the most important skills in programming. Every professional coder spends time reading code, spotting mistakes, and testing fixes — just like you did!',
      concept: 'Debugging',
    },
    errorMessages: {
      wall: "The avatar hit something. Check the code for errors!",
      fall: "The avatar fell! The bug is still there — keep looking!",
      outOfBounds: "Out of bounds! Something in the code is wrong.",
    },
    bugs: [
      {
        id: 1,
        title: '🐛 Bug 1 of 3 — Wrong repeat count',
        description: 'The star is 8 steps away, but the code only moves 5 times. Fix the number!',
        buggyCode: '-- This code has a bug!\n-- The star is 8 steps to the right.\n-- Can you spot the mistake?\n\nrepeat(5, moveRight)',
        hint: 'Count the tiles between the avatar and the star. Is the repeat number correct?',
        explanation: 'The **repeat count was wrong**. The star was 8 steps away, but the code said `repeat(5, moveRight)`. Off-by-one and wrong-count bugs are extremely common — always double-check your numbers!',
        grid: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        playerStart: { col: 1, row: 5 },
        starPosition: { col: 9, row: 5 },
      },
      {
        id: 2,
        title: '🐛 Bug 2 of 3 — Typo in function name',
        description: 'There\'s a typo hiding in this code. Read each line carefully!',
        buggyCode: '-- This code has a typo somewhere.\n-- Read each line carefully!\n\nmoveRight()\nmoveRight()\nmoverRight()\nmoveRight()\nmoveRight()',
        hint: 'Look at line 6 very carefully. Does that function name look right?',
        explanation: 'Line 6 said `moverRight()` instead of `moveRight()` — an extra letter "r"! **Typos** are the #1 most common bug in all of programming. Computers are very strict — one wrong letter and nothing works.',
        grid: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        playerStart: { col: 1, row: 5 },
        starPosition: { col: 6, row: 5 },
      },
      {
        id: 3,
        title: '🐛 Bug 3 of 3 — Wrong variable name',
        description: 'This if/else block checks the wrong variable. Fix it!',
        buggyCode: '-- This code checks the wrong variable!\n-- doorOpen is true or false, but...\n\nif doorClosed then\n  repeat(8, moveRight)\nelse\n  moveRight()\n  moveRight()\n  jump()\n  repeat(6, moveRight)\nend',
        hint: 'What variable does the environment panel show? Is "doorClosed" the right name?',
        explanation: 'The code checked `doorClosed` but the actual variable is called `doorOpen`. **Using the wrong variable name** is a logic bug — the code runs fine, but it makes the wrong decision. Always check that your variable names match!',
        grid: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        playerStart: { col: 1, row: 5 },
        starPosition: { col: 9, row: 5 },
        hasRandomDoor: true,
      },
    ],
  },
  {
    id: 7,
    name: 'Your Level',
    subtitle: 'Create!',
    description: 'Build your own level, then write the code to solve it!',
    mode: 'levelEditor',
    availableFunctions: ['moveRight()', 'moveLeft()', 'moveUp()', 'moveDown()', 'jump()', 'repeat(n, func)', 'function name()', 'end'],
    starterCode: '-- Solve your own level!\n-- Write the code to reach the star.\n\n',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { col: 1, row: 5 },
    starPosition: { col: 10, row: 5 },
    optimalLines: 0,
    celebration: {
      title: '🏗️ You are a Game Designer!',
      explanation:
        'You didn\'t just play a game — you **built one and solved it**! Creating levels, setting rules, and writing code to meet those rules is exactly what real game developers do every day. You are now officially a ScriptQuest game designer!',
      concept: 'Level Design',
    },
    errorMessages: {
      wall: "Your avatar hit a platform. Adjust your code!",
      fall: "Your avatar fell into a gap! Try a different approach.",
      outOfBounds: "Out of bounds! Keep your avatar inside the grid.",
    },
  },
];
