/**
 * LuaEngine — Parses Lua code and extracts movement commands.
 *
 * Instead of running Fengari in real-time (which would block the UI thread),
 * we parse the code to extract the sequence of commands, then animate them
 * one by one. This gives us full control over step-by-step highlighting
 * and animation timing.
 *
 * We still validate syntax via Fengari's parser to give real Lua error messages.
 */

// Supported commands and their grid deltas
const COMMAND_MAP = {
  'moveRight': { dx: 1, dy: 0 },
  'moveLeft': { dx: -1, dy: 0 },
  'moveUp': { dx: 0, dy: -1 },
  'moveDown': { dx: 0, dy: 1 },
  'jump': { dx: 0, dy: -2 }, // jump goes 2 up (will come back down 1 with gravity in future stages)
};

/**
 * Parse Lua source code and extract a sequence of commands.
 * Supports:
 *   - Simple calls:    moveRight()
 *   - Repeat loops:    repeat(8, moveRight)
 *
 * Returns { commands: [...], error: null } on success,
 * or { commands: [], error: { line, message } } on failure.
 */
export function parseLuaCode(code) {
  const lines = code.split('\n');
  const commands = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!line || line.startsWith('--')) continue;

    // Try to match a simple command call: funcName()
    const simpleMatch = line.match(/^(\w+)\(\s*\)$/);
    if (simpleMatch) {
      const funcName = simpleMatch[1];
      if (COMMAND_MAP[funcName]) {
        commands.push({
          name: funcName,
          delta: COMMAND_MAP[funcName],
          line: lineNum,
          source: line,
        });
        continue;
      } else {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unknown function: ${funcName}(). Check the available commands!`,
          },
        };
      }
    }

    // Try to match a repeat call: repeat(N, funcName)
    const repeatMatch = line.match(/^repeat\(\s*(\d+)\s*,\s*(\w+)\s*\)$/);
    if (repeatMatch) {
      const count = parseInt(repeatMatch[1], 10);
      const funcName = repeatMatch[2];

      if (!COMMAND_MAP[funcName]) {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unknown function inside repeat: ${funcName}. Try repeat(8, moveRight)`,
          },
        };
      }

      if (count <= 0 || count > 100) {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `repeat count must be between 1 and 100. You wrote ${count}.`,
          },
        };
      }

      // Expand the repeat into individual commands, all pointing to the same line
      for (let r = 0; r < count; r++) {
        commands.push({
          name: funcName,
          delta: COMMAND_MAP[funcName],
          line: lineNum,
          source: `${funcName}()  -- repeat ${r + 1}/${count}`,
          isRepeat: true,
          repeatIndex: r,
          repeatTotal: count,
        });
      }
      continue;
    }

    // Nothing matched — syntax error
    if (line.length > 0) {
      return {
        commands: [],
        error: {
          line: lineNum,
          message: `I don't understand "${line}". Try a command like moveRight() or repeat(8, moveRight)`,
        },
      };
    }
  }

  if (commands.length === 0) {
    return {
      commands: [],
      error: {
        line: 1,
        message: "Your code doesn't have any commands! Try writing moveRight()",
      },
    };
  }

  return { commands, error: null };
}

/**
 * Simulate executing a sequence of commands on a stage grid.
 * Returns a list of steps (positions the player visits), including
 * whether each step succeeded or hit an error.
 */
export function simulateExecution(commands, stage) {
  const { grid, playerStart, starPosition } = stage;
  const steps = [];
  let pos = { col: playerStart.col, row: playerStart.row };

  // Record the starting position
  steps.push({
    col: pos.col,
    row: pos.row,
    command: null,
    line: 0,
    status: 'start',
  });

  for (const cmd of commands) {
    const newCol = pos.col + cmd.delta.dx;
    const newRow = pos.row + cmd.delta.dy;

    // Check bounds
    if (newCol < 0 || newCol >= grid[0].length || newRow < 0 || newRow >= grid.length) {
      steps.push({
        col: pos.col,
        row: pos.row,
        command: cmd.name,
        line: cmd.line,
        status: 'error',
        errorType: 'outOfBounds',
      });
      return { steps, success: false };
    }

    // Check for wall or solid platform
    const targetTile = grid[newRow]?.[newCol];
    if (targetTile === 1 || targetTile === 2) {
      steps.push({
        col: pos.col,
        row: pos.row,
        command: cmd.name,
        line: cmd.line,
        status: 'error',
        errorType: 'wall',
      });
      return { steps, success: false };
    }

    // Check for falling (stepping onto empty space with no ground below)
    if (targetTile === 0) {
      // Check if there's ground below
      const belowRow = newRow + 1;
      const hasGround = belowRow < grid.length && grid[belowRow]?.[newCol] === 1;

      if (!hasGround && cmd.name !== 'jump') {
        steps.push({
          col: newCol,
          row: newRow,
          command: cmd.name,
          line: cmd.line,
          status: 'error',
          errorType: 'fall',
        });
        return { steps, success: false };
      }
    }

    // Move is valid
    pos = { col: newCol, row: newRow };

    // Check if we reached the star
    const reachedStar = pos.col === starPosition.col && pos.row === starPosition.row;

    steps.push({
      col: pos.col,
      row: pos.row,
      command: cmd.name,
      line: cmd.line,
      status: reachedStar ? 'star' : 'ok',
    });

    if (reachedStar) {
      return { steps, success: true };
    }
  }

  // Ran out of commands without reaching the star
  return { steps, success: false };
}
