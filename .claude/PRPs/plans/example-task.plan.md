# Example Ralph Loop Task Plan

## Task Description
This is an example plan file for testing the Ralph Loop plugin.

## Requirements
1. Create a simple function
2. Write tests for the function
3. Ensure all tests pass
4. Output completion signal when done

## Success Criteria
- All tests pass with 100% coverage
- Code follows project conventions
- No linting errors

## Completion Signal
When all criteria are met, output:
```
<promise>COMPLETE</promise>
```

## Validation Commands
```bash
npm test
npm run lint
```

---

## How to Use This Plan

Run the Ralph Loop with this plan:
```bash
# Set environment variables
export RALPH_MAX_ITERATIONS=20
export RALPH_COMPLETION_PROMISE="COMPLETE"

# Then provide this plan to Claude and ask to work on it
# Claude will iterate until the task is complete or max iterations reached
```
