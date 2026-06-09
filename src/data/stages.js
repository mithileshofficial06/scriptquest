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
    name: 'Jump & Leap',
    subtitle: 'Variables',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
  {
    id: 3,
    name: 'Loop Land',
    subtitle: 'Loops',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
  {
    id: 4,
    name: 'If Island',
    subtitle: 'Conditionals',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
  {
    id: 5,
    name: 'Function Falls',
    subtitle: 'Functions',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
  {
    id: 6,
    name: 'Table Tops',
    subtitle: 'Tables',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
  {
    id: 7,
    name: 'Final Quest',
    subtitle: 'All Together',
    description: 'Coming soon...',
    availableFunctions: [],
    starterCode: '',
    grid: [],
    playerStart: { col: 0, row: 0 },
    starPosition: { col: 0, row: 0 },
    optimalLines: 0,
    celebration: { title: '', explanation: '', concept: '' },
    errorMessages: {},
    locked: true,
  },
];
