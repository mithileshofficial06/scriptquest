/**
 * LuaEngine — Parses Lua code and extracts movement commands.
 *
 * Instead of running Fengari in real-time (which would block the UI thread),
 * we parse the code to extract the sequence of commands, then animate them
 * one by one. This gives us full control over step-by-step highlighting
 * and animation timing.
 *
 * Supported syntax:
 *   - Simple calls:       moveRight()
 *   - Repeat loops:       repeat(8, moveRight)
 *   - Variable assignment: speed = 5
 *
 * The `speed` variable multiplies horizontal movement distance.
 * Default speed is 1.
 */

// Supported commands and their BASE grid deltas (before speed multiplier)
const COMMAND_MAP = {
  'moveRight': { dx: 1, dy: 0 },
  'moveLeft': { dx: -1, dy: 0 },
  'moveUp': { dx: 0, dy: -1 },
  'moveDown': { dx: 0, dy: 1 },
  'jump': { dx: 0, dy: -2 },
};

// Commands affected by the speed variable (horizontal movement only)
const SPEED_AFFECTED = new Set(['moveRight', 'moveLeft']);

/**
 * Parse Lua source code and extract a sequence of commands.
 * Tracks variable state (e.g., speed) across lines so that later
 * commands use updated values.
 *
 * Supports conditionals (if doorOpen then ... else ... end)
 * and custom functions (function myFunc() ... end).
 *
 * Returns { commands: [...], error: null } on success,
 * or { commands: [], error: { line, message } } on failure.
 */
export function parseLuaCode(code, runtimeVars = {}) {
  const lines = code.split('\n');
  const commands = [];
  const variables = { speed: 1 }; // default speed
  const definedFunctions = {};

  // blockStack keeps track of nested blocks: 'if' or 'function'
  const blockStack = [];

  // Helper to determine if we are currently appending commands to the main execution path
  const isCurrentlyActive = () => {
    let active = true;
    for (const block of blockStack) {
      if (block.type === 'if') {
        const branchActive = (block.currentBranch === 'then') ? block.conditionValue : !block.conditionValue;
        active = active && branchActive;
      } else if (block.type === 'function') {
        // Inside function definitions, we do not append to main execution path immediately
        active = false;
      }
    }
    return active;
  };

  // Helper to append a command either to the current function body, or to the main commands list
  const appendCommand = (cmd) => {
    const activeFuncBlock = [...blockStack].reverse().find(b => b.type === 'function');
    if (activeFuncBlock) {
      activeFuncBlock.body.push(cmd);
    } else if (isCurrentlyActive()) {
      commands.push(cmd);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!line || line.startsWith('--')) continue;

    // ── 1. Function definition: function funcName() ──
    const funcDefMatch = line.match(/^function\s+(\w+)\s*\(\s*\)$/);
    if (funcDefMatch) {
      const funcName = funcDefMatch[1];
      if (COMMAND_MAP[funcName] || funcName === 'repeat') {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Cannot override built-in function name: "${funcName}".`,
          },
        };
      }
      blockStack.push({
        type: 'function',
        name: funcName,
        body: [],
        startLine: lineNum,
      });
      // Push function definition marker so the line gets highlighted
      appendCommand({
        name: 'function_def',
        funcName,
        delta: { dx: 0, dy: 0 },
        line: lineNum,
        source: line,
      });
      continue;
    }

    // ── 2. Conditional block: if varName then ──
    const ifMatch = line.match(/^if\s+(\w+)\s+then$/);
    if (ifMatch) {
      const condName = ifMatch[1];
      const condVal = !!runtimeVars[condName];
      blockStack.push({
        type: 'if',
        condition: condName,
        conditionValue: condVal,
        currentBranch: 'then',
        startLine: lineNum,
      });
      appendCommand({
        name: 'if',
        condition: condName,
        value: condVal,
        delta: { dx: 0, dy: 0 },
        line: lineNum,
        source: line,
      });
      continue;
    }

    // ── 3. Else block: else ──
    if (line === 'else') {
      const topBlock = blockStack[blockStack.length - 1];
      if (!topBlock || topBlock.type !== 'if') {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unexpected "else" without a matching "if".`,
          },
        };
      }
      if (topBlock.currentBranch === 'else') {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Duplicate "else" in if block.`,
          },
        };
      }
      topBlock.currentBranch = 'else';
      appendCommand({
        name: 'else',
        delta: { dx: 0, dy: 0 },
        line: lineNum,
        source: line,
      });
      continue;
    }

    // ── 4. End statement: end ──
    if (line === 'end') {
      const topBlock = blockStack.pop();
      if (!topBlock) {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unexpected "end" without opening "if" or "function".`,
          },
        };
      }

      if (topBlock.type === 'function') {
        definedFunctions[topBlock.name] = topBlock.body;
      }

      appendCommand({
        name: 'end',
        blockType: topBlock.type,
        delta: { dx: 0, dy: 0 },
        line: lineNum,
        source: line,
      });
      continue;
    }

    // ── 5. Variable assignment: speed = number ──
    const assignMatch = line.match(/^(\w+)\s*=\s*(\d+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const varValue = parseInt(assignMatch[2], 10);

      if (varName === 'speed') {
        if (varValue < 1 || varValue > 20) {
          return {
            commands: [],
            error: {
              line: lineNum,
              message: `Speed must be between 1 and 20. You wrote ${varValue}.`,
            },
          };
        }
      }

      variables[varName] = varValue;
      appendCommand({
        name: 'assign',
        variable: varName,
        value: varValue,
        delta: { dx: 0, dy: 0 },
        line: lineNum,
        source: line,
      });
      continue;
    }

    // ── 6. Repeat call: repeat(N, funcName) ──
    const repeatMatch = line.match(/^repeat\(\s*(\d+)\s*,\s*(\w+)\s*\)$/);
    if (repeatMatch) {
      const count = parseInt(repeatMatch[1], 10);
      const funcName = repeatMatch[2];

      if (count <= 0 || count > 100) {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `repeat count must be between 1 and 100. You wrote ${count}.`,
          },
        };
      }

      const isBuiltIn = !!COMMAND_MAP[funcName];
      const isCustom = !!definedFunctions[funcName];

      if (!isBuiltIn && !isCustom) {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unknown function inside repeat: "${funcName}". Try repeat(3, moveRight)`,
          },
        };
      }

      if (isBuiltIn) {
        const baseDelta = COMMAND_MAP[funcName];
        const speed = SPEED_AFFECTED.has(funcName) ? (variables.speed || 1) : 1;

        for (let r = 0; r < count; r++) {
          appendCommand({
            name: funcName,
            delta: { dx: baseDelta.dx * speed, dy: baseDelta.dy * speed },
            line: lineNum,
            source: `${funcName}()  -- repeat ${r + 1}/${count}`,
            isRepeat: true,
            repeatIndex: r,
            repeatTotal: count,
            speed: SPEED_AFFECTED.has(funcName) ? speed : undefined,
          });
        }
      } else {
        // Custom function repeat: expand the body count times
        const body = definedFunctions[funcName];
        for (let r = 0; r < count; r++) {
          appendCommand({
            name: 'call',
            funcName,
            delta: { dx: 0, dy: 0 },
            line: lineNum,
            source: `${funcName}()  -- repeat ${r + 1}/${count}`,
          });
          for (const bodyCmd of body) {
            appendCommand({
              ...bodyCmd,
              isFromCustomFunc: true,
            });
          }
        }
      }
      continue;
    }

    // ── 7. Simple command/function call: funcName() ──
    const simpleMatch = line.match(/^(\w+)\(\s*\)$/);
    if (simpleMatch) {
      const funcName = simpleMatch[1];
      const isBuiltIn = !!COMMAND_MAP[funcName];
      const isCustom = !!definedFunctions[funcName];

      if (isBuiltIn) {
        const baseDelta = COMMAND_MAP[funcName];
        const speed = SPEED_AFFECTED.has(funcName) ? (variables.speed || 1) : 1;
        appendCommand({
          name: funcName,
          delta: { dx: baseDelta.dx * speed, dy: baseDelta.dy * speed },
          line: lineNum,
          source: line,
          speed: SPEED_AFFECTED.has(funcName) ? speed : undefined,
        });
      } else if (isCustom) {
        appendCommand({
          name: 'call',
          funcName,
          delta: { dx: 0, dy: 0 },
          line: lineNum,
          source: line,
        });
        const body = definedFunctions[funcName];
        for (const bodyCmd of body) {
          appendCommand({
            ...bodyCmd,
            isFromCustomFunc: true,
          });
        }
      } else {
        return {
          commands: [],
          error: {
            line: lineNum,
            message: `Unknown function: ${funcName}(). Check spelling or define it first!`,
          },
        };
      }
      continue;
    }

    // ── Nothing matched — syntax error ──
    return {
      commands: [],
      error: {
        line: lineNum,
        message: `I don't understand "${line}".`,
      },
    };
  }

  // Check for unclosed blocks
  if (blockStack.length > 0) {
    const unclosed = blockStack[blockStack.length - 1];
    return {
      commands: [],
      error: {
        line: unclosed.startLine,
        message: `This "${unclosed.type}" block was never closed with "end".`,
      },
    };
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
export function simulateExecution(commands, stage, runtimeVars = {}) {
  const { grid, playerStart, starPosition } = stage;
  const { doorOpen } = runtimeVars;
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
    // Structural commands do not move — just highlight the line
    if (cmd.name === 'assign' || cmd.name === 'if' || cmd.name === 'else' || cmd.name === 'end' || cmd.name === 'function_def' || cmd.name === 'call') {
      steps.push({
        col: pos.col,
        row: pos.row,
        command: cmd.name,
        line: cmd.line,
        status: 'ok',
        variable: cmd.variable,
        value: cmd.value,
      });
      continue;
    }

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
    let targetTile = grid[newRow]?.[newCol];
    if (targetTile === 3) {
      targetTile = doorOpen ? 0 : 2; // Door tile dynamic translation
    }

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

    // Gravity and falling check:
    let finalRow = newRow;
    let hasGround = false;

    if (cmd.name === 'jump') {
      // Jump skips immediate fall check and assumes we land at target row (if supported by ground in next step),
      // but let's check if there is any ground below the jump landing spot.
      const belowRow = newRow + 1;
      let belowTile = grid[belowRow]?.[newCol];
      if (belowTile === 3) belowTile = doorOpen ? 0 : 2;
      hasGround = belowRow < grid.length && belowTile === 1;

      if (!hasGround) {
        let fallRow = newRow;
        while (fallRow < grid.length) {
          let tile = grid[fallRow]?.[newCol];
          if (tile === 3) tile = doorOpen ? 0 : 2;
          if (tile === 1) {
            hasGround = true;
            break;
          }
          fallRow++;
        }
        if (hasGround) {
          finalRow = fallRow - 1;
        }
      }
    } else {
      // Normal horizontal/vertical movements check for ground below.
      let fallRow = newRow;
      while (fallRow < grid.length) {
        let tile = grid[fallRow]?.[newCol];
        if (tile === 3) tile = doorOpen ? 0 : 2;
        if (tile === 1) {
          hasGround = true;
          break;
        }
        fallRow++;
      }
      if (hasGround) {
        finalRow = fallRow - 1;
      }
    }

    if (!hasGround) {
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

    // Record animation steps for falling if finalRow > newRow
    if (finalRow > newRow) {
      for (let r = newRow; r <= finalRow; r++) {
        const isFinal = (r === finalRow);
        const reachedStar = newCol === starPosition.col && r === starPosition.row;

        steps.push({
          col: newCol,
          row: r,
          command: isFinal ? cmd.name : 'fall',
          line: cmd.line,
          status: reachedStar ? 'star' : 'ok',
          speed: cmd.speed,
          isFalling: !isFinal,
        });

        if (reachedStar) {
          return { steps, success: true };
        }
      }
    } else {
      const reachedStar = newCol === starPosition.col && newRow === starPosition.row;
      steps.push({
        col: newCol,
        row: newRow,
        command: cmd.name,
        line: cmd.line,
        status: reachedStar ? 'star' : 'ok',
        speed: cmd.speed,
      });

      if (reachedStar) {
        return { steps, success: true };
      }
    }

    // Move is valid
    pos = { col: newCol, row: finalRow };
  }

  // Ran out of commands without reaching the star
  return { steps, success: false };
}

/**
 * Detect repeated sequences of commands (length >= 2, count >= 3).
 * Returns { pattern: [...], occurrences: [[...], [...]] } if found, or null.
 */
export function detectRepeatedPattern(code) {
  const originalLines = code.split('\n');
  const lineInfo = originalLines.map((text, idx) => {
    const trimmed = text.trim();
    let cmd = null;
    if (trimmed && !trimmed.startsWith('--')) {
      const match = trimmed.match(/^(\w+)\(\)$/);
      if (match) {
        cmd = match[1];
      }
    }
    return { text, index: idx, cmd };
  });

  const cmdLines = lineInfo.filter(info => info.cmd !== null);
  const n = cmdLines.length;

  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i <= n - len; i++) {
      const slice = cmdLines.slice(i, i + len);
      const sliceStr = slice.map(s => s.cmd).join(',');

      let count = 0;
      let j = 0;
      const occurrences = [];
      while (j <= n - len) {
        const checkSlice = cmdLines.slice(j, j + len);
        if (checkSlice.map(s => s.cmd).join(',') === sliceStr) {
          count++;
          occurrences.push(checkSlice);
          j += len;
        } else {
          j++;
        }
      }

      if (count >= 3) {
        return {
          pattern: slice.map(s => s.cmd),
          occurrences,
        };
      }
    }
  }
  return null;
}

/**
 * Refactor the user's code: defines a new function at the top and replaces
 * the repeated occurrences with calls to the new function.
 */
export function refactorCodeWithFunction(code, patternName, pattern, occurrences) {
  const originalLines = code.split('\n');
  const linesToReplace = new Map();
  const linesToRemove = new Set();

  occurrences.forEach(occ => {
    const firstInfo = occ[0];
    linesToReplace.set(firstInfo.index, `  ${patternName}()`);
    for (let k = 1; k < occ.length; k++) {
      linesToRemove.add(occ[k].index);
    }
  });

  const newLines = [];
  let insertIdx = 0;
  while (insertIdx < originalLines.length) {
    const trimmed = originalLines[insertIdx].trim();
    if (trimmed.startsWith('--') || !trimmed) {
      insertIdx++;
    } else {
      break;
    }
  }

  const funcDef = [
    `function ${patternName}()`,
    ...pattern.map(cmd => `  ${cmd}()`),
    `end`,
    ``
  ];

  for (let idx = 0; idx < originalLines.length; idx++) {
    if (idx === insertIdx) {
      newLines.push(...funcDef);
    }

    if (linesToRemove.has(idx)) {
      continue;
    }

    if (linesToReplace.has(idx)) {
      newLines.push(linesToReplace.get(idx));
    } else {
      newLines.push(originalLines[idx]);
    }
  }

  return newLines.join('\n');
}
