# ScriptQuest Stages 8-20 Implementation Guide

This document outlines the remaining work needed to complete all 20 stages.

## Current Status

### ✅ Completed
- Zone system with 5 distinct zones
- All 20 stage definitions in stages.js
- Enhanced Lua parser with loops, parameters, conditionals
- Trap visualization system
- ProgressBar with zone locking

### 🔨 In Progress
- Lua engine simulation enhancements
- Special stage mechanics

---

## Stage-by-Stage Implementation Checklist

### Stage 8: Obstacle Course ⚠️ 70% Complete
**Status**: Trap mechanics partially implemented

**Remaining Work**:
1. Fix trap synchronization between parse and simulate phases
2. Test isTrap() function detection
3. Add trap-specific error overlay messaging
4. Test loop + condition combination

**Files to Modify**:
- `src/engine/luaEngine.js` - Ensure trap state persists across phases
- `src/components/GameWorld.jsx` - Trap visuals (DONE)

---

### Stage 9: Speed Shift ⚠️ 40% Complete
**Status**: Grid defined, needs zone detection

**Remaining Work**:
1. Add `inMudZone()` and `inFastZone()` functions to lua engine
2. Implement zone detection based on player position
3. Test dynamic speed changes within functions
4. Add visual mud/fast zone indicators to GameWorld

**Implementation**:
```javascript
// In simulateExecution, add zone checking:
const inMudZone = () => {
  const mudZones = stage.mudZones || [];
  return mudZones.some(([start, end]) => pos.col >= start && pos.col <= end);
};

const inFastZone = () => {
  const fastZones = stage.fastZones || [];
  return fastZones.some(([start, end]) => pos.col >= start && pos.col <= end);
};
```

**Files to Modify**:
- `src/engine/luaEngine.js` - Add zone detection functions
- `src/components/GameWorld.jsx` - Add mud/fast zone visual overlays

---

### Stage 10: No Help Level ⚠️ 90% Complete
**Status**: Grid complete, just needs testing

**Remaining Work**:
1. Test that availableFunctions: [] properly hides the panel
2. Verify complex grid navigation works
3. Test with no hints

**Files to Check**:
- `src/components/CodeEditor.jsx` - Ensure it handles empty availableFunctions array

---

### Stage 11: The 5 Line Challenge ⚠️ 30% Complete
**Status**: Grid defined, needs exact line count validation

**Remaining Work**:
1. Add exact line count checker to App.jsx
2. Show custom error if line count != 5
3. Prevent stage completion if line count is wrong
4. Add line counter display during editing

**Implementation**:
```javascript
// In App.jsx handleRun:
if (stage.exactLineCount && stage.lineCountChallenge) {
  const actualLines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('--')).length;
  if (actualLines !== stage.lineCountChallenge) {
    setCodeError({
      line: 1,
      message: stage.errorMessages.tooManyLines
        ? stage.errorMessages[actualLines > stage.lineCountChallenge ? 'tooManyLines' : 'tooFewLines']
            .replace('{count}', actualLines)
        : `You used ${actualLines} lines but need exactly ${stage.lineCountChallenge}.`
    });
    return;
  }
}
```

**Files to Modify**:
- `src/App.jsx` - Add exact line count validation
- `src/components/CodeEditor.jsx` - Show live line count for this stage

---

### Stage 12: Double Bug Hunt ⚠️ 80% Complete
**Status**: Bug hunt mode exists, just needs 2-bug definitions

**Remaining Work**:
1. Test both bugs in sequence
2. Verify doorOpen/doorOpened variable name checking

**Files to Check**:
- `src/data/stages.js` - Bugs are defined (DONE)
- Test bug hunt flow

---

### Stage 13: Function Parameters ⚠️ 60% Complete
**Status**: Parser supports parameters, needs simulation

**Remaining Work**:
1. Test `jump(n)` with different heights
2. Implement parameter substitution in custom functions
3. Test `jumpAndMove(height)` user-defined function

**Implementation**:
```javascript
// In simulateExecution, handle jump with parameter:
if (cmd.name === 'jump' && cmd.param) {
  const jumpHeight = typeof cmd.param === 'number' ? cmd.param : 2;
  newRow = pos.row - jumpHeight;
}
```

**Files to Modify**:
- `src/engine/luaEngine.js` - Handle jump(n) in simulation

---

### Stage 14: The Inventory ⚠️ 20% Complete
**Status**: Grid defined, needs full inventory system

**Remaining Work**:
1. Add inventory/backpack state management
2. Implement `backpack[n]` table access syntax
3. Add `useItem(item)` function
4. Implement door-item matching logic
5. Add for loop execution (for i = 1, 4 do)
6. Visual inventory display (optional but nice)

**Major Implementation Required**:
```javascript
// Parser needs to handle:
// - backpack[1] table access
// - for i = 1, 4 do loops with proper iteration

// Simulation needs:
// - inventory state
// - door-item checking
// - useItem() action
```

**Files to Modify**:
- `src/engine/luaEngine.js` - Add table access, for loops execution
- `src/App.jsx` - Add inventory state
- `src/components/GameWorld.jsx` - Visual inventory panel (optional)

---

### Stage 15: The Loot Box ⚠️ 30% Complete
**Status**: Grid defined, needs randomness + item paths

**Remaining Work**:
1. Implement `math.random(1, 3)` in parser and simulation
2. Add `collect(item)` action function
3. Implement item-specific abilities:
   - sword: breaks walls
   - shield: protects from spikes
   - potion: higher jump
4. Add "items discovered" tracker (must find all 3)
5. Visual loot chest animation

**Implementation**:
```javascript
// Parser: recognize math.random(a, b)
const mathRandomMatch = line.match(/^(\w+)\s*=\s*math\.random\((\d+),\s*(\d+)\)$/);

// Simulation: track collected item and apply effects
let collectedItem = null;
if (cmd.name === 'collect') {
  collectedItem = cmd.param;
}

// Apply item abilities during movement
if (collectedItem === 'sword' && targetTile === 2) {
  // Break wall
}
```

**Files to Modify**:
- `src/engine/luaEngine.js` - math.random, collect()
- `src/App.jsx` - Item tracking state
- `src/components/GameWorld.jsx` - Loot chest visual

---

### Stage 16: Score Tracker ⚠️ 15% Complete
**Status**: Grid defined, needs complete coin collection system

**Remaining Work**:
1. Add coin system:
   - `coinNearby()` detection
   - `collectCoin()` action
   - Visual coin display
   - Score tracking
2. Implement `displayScore(n)` end screen
3. Add moves counter
4. Test while loops in practice

**Major System**: Coins + Scoring

**Files to Modify**:
- `src/engine/luaEngine.js` - coinNearby(), collectCoin()
- `src/App.jsx` - Score state, moves counter
- `src/components/GameWorld.jsx` - Coin visuals
- Create `src/components/ScoreDisplay.jsx` - End screen

---

### Stage 17: Program the Enemy ⚠️ 10% Complete
**Status**: Concept defined, needs multi-tab editor + enemy AI

**Remaining Work**:
1. **Major Feature**: Multi-tab code editor
   - Tab 1: Enemy Script
   - Tab 2: Player Script
2. Implement while true do loop
3. Add `moveTo(n)` for enemy positioning
4. Add `wait(n)` for timing
5. Enemy AI simulation
6. Collision detection with enemy
7. Visual enemy character

**This is a Major Feature**: Requires significant new components

**New Components Needed**:
- `src/components/MultiTabEditor.jsx`
- Enemy rendering in GameWorld
- Separate enemy simulation thread

---

### Stage 18: Timed Coin Collect ⚠️ 10% Complete
**Status**: Concept defined, needs timer + multi-tab + win conditions

**Remaining Work**:
1. Multi-tab editor (3 tabs)
2. Timer system:
   - `updateTimer(n)` function
   - `gameOver()` trigger
   - Visual countdown
3. Win/lose conditions:
   - `showWin()` and `showLose()` screens
4. Score >= 7 checking
5. 2-minute gameplay period

**Major Feature**: Game timer + multi-script coordination

**New Components Needed**:
- Timer display
- Win/Lose overlays
- Multi-tab from Stage 17

---

### Stage 19: The Heist ⚠️ 85% Complete
**Status**: Complex grid defined, just needs testing

**Remaining Work**:
1. Test max lines enforcement (20 lines max)
2. Show "too many lines" error before running
3. Test all four room challenges work with existing engine
4. Award "Mastermind" badge

**Files to Modify**:
- `src/App.jsx` - Add max lines check

---

### Stage 20: The Final Project ⚠️ 30% Complete
**Status**: Free play mode needs special handling

**Remaining Work**:
1. **Major Feature**: Graduation Certificate Component
2. Track total stats:
   - Total lines written across all stages
   - Total bugs fixed
   - Favorite stage (most replayed)
3. "I'm Done" button instead of automatic completion
4. Final script display
5. localStorage save for graduation
6. "Show My Parent" summary card

**New Components Needed**:
- `src/components/GraduationCertificate.jsx`
- Stats tracking in storage.js

---

## Priority Implementation Order

### Phase 1: Core Mechanics (Complete Stages 8-12) - 4-6 hours
1. Fix Stage 8 trap synchronization ✅
2. Implement Stage 9 zone detection
3. Add Stage 11 exact line counter
4. Test Stage 12 bug hunt

### Phase 2: New Concepts (Complete Stages 13-15) - 6-8 hours
1. Implement function parameters fully (Stage 13)
2. Build inventory system (Stage 14) - MAJOR
3. Add randomness + loot (Stage 15)

### Phase 3: Mini Projects (Complete Stages 16-18) - 8-12 hours
1. Build coin collection system (Stage 16)
2. Create multi-tab editor (Stage 17) - MAJOR
3. Add timer system (Stage 18)

### Phase 4: Finale (Complete Stages 19-20) - 3-4 hours
1. Test Stage 19 complexity
2. Build graduation certificate (Stage 20)
3. Add stats tracking

**Total Estimated Time: 21-30 hours**

---

## Testing Checklist

For each stage:
- [ ] Code parses without errors
- [ ] Avatar reaches star with correct code
- [ ] Wrong code shows appropriate error
- [ ] Hints are helpful
- [ ] Celebration shows correct concept
- [ ] Can replay stage
- [ ] Next stage unlocks properly
- [ ] Line count tracking works
- [ ] localStorage saves completion

---

## Quick Wins (Can Complete Quickly)

1. **Stage 10** - Just test it, likely already works
2. **Stage 19** - Add max lines check (30 mins)
3. **Stage 11** - Add line counter (1 hour)
4. **Stage 12** - Test bug definitions (30 mins)

---

## Major Features Needed

### 1. Multi-Tab Editor (Stages 17-18)
- Separate code contexts
- Tab switching UI
- Individual execution
- Combined simulation

### 2. Inventory System (Stage 14)
- Table access syntax: `backpack[1]`
- for loops with execution
- Item-door matching

### 3. Timer System (Stage 18)
- Countdown display
- Time-based game over
- wait() function

### 4. Coin Collection (Stages 16, 18)
- Coin visuals
- Proximity detection
- Score tracking
- Visual collection animation

### 5. Graduation Certificate (Stage 20)
- Beautiful certificate design
- Stats display
- Screenshot-friendly
- Parent summary card

---

## Next Steps

1. **Test Current Implementation**: Open http://localhost:5174/ and test Stages 1-7 still work
2. **Test Zone System**: Verify zones lock/unlock properly
3. **Start with Quick Wins**: Get Stages 10, 11, 12, 19 working (3-4 hours)
4. **Build Stage 9**: Zone detection (2 hours)
5. **Continue systematically** through Priority Implementation Order

---

## File Structure Summary

**Modified Files**:
- `src/data/stages.js` - All 20 stages defined ✅
- `src/components/ProgressBar.jsx` - Zone system ✅
- `src/engine/luaEngine.js` - Enhanced parser (70% done)
- `src/components/GameWorld.jsx` - Trap visuals ✅

**Files Needing Major Updates**:
- `src/App.jsx` - Line count validation, max lines, inventory state, score state, timer state
- `src/engine/luaEngine.js` - Complete simulation for all new features
- `src/components/GameWorld.jsx` - Coins, inventory, enemies, zones, loot

**New Files Needed**:
- `src/components/MultiTabEditor.jsx`
- `src/components/GraduationCertificate.jsx`
- `src/components/ScoreDisplay.jsx`
- `src/components/TimerDisplay.jsx`

---

## Development Tips

1. **Test as you go**: After each stage implementation, play through it
2. **Use console.log**: Debug simulation steps
3. **Check localStorage**: Verify progress saves correctly
4. **Mobile test**: Ensure it works on tablet (target user is 12-year-old)
5. **Error messages**: Keep them friendly and educational

---

## Educational Goals Reminder

Each stage should:
- Teach ONE clear concept
- Have a visible "aha!" moment
- Connect to real Roblox development
- Build on previous knowledge
- Be completable with provided hints
- Feel rewarding, not frustrating

---

*This guide was generated to help complete the full 20-stage implementation of ScriptQuest.*
