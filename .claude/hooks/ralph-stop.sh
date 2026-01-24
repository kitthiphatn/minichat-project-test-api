#!/bin/bash

# Ralph Wiggum Plugin - Stop Hook
# This hook intercepts Claude's exit and checks if the task is complete
# If not complete, it re-feeds the prompt to continue the loop

STATE_FILE=".claude/prp-ralph.state.md"
MAX_ITERATIONS=${RALPH_MAX_ITERATIONS:-50}
COMPLETION_PROMISE=${RALPH_COMPLETION_PROMISE:-"COMPLETE"}

# Initialize state file if it doesn't exist
if [ ! -f "$STATE_FILE" ]; then
    echo "# Ralph Loop State" > "$STATE_FILE"
    echo "" >> "$STATE_FILE"
    echo "Iteration: 0" >> "$STATE_FILE"
    echo "Status: running" >> "$STATE_FILE"
    echo "" >> "$STATE_FILE"
fi

# Read current iteration from state file
CURRENT_ITERATION=$(grep "Iteration:" "$STATE_FILE" | awk '{print $2}')
CURRENT_ITERATION=${CURRENT_ITERATION:-0}
NEXT_ITERATION=$((CURRENT_ITERATION + 1))

# Check if completion promise was found in the output
if echo "$CLAUDE_OUTPUT" | grep -q "<promise>$COMPLETION_PROMISE</promise>"; then
    echo "✓ Ralph Loop completed successfully after $NEXT_ITERATION iterations!"
    echo "Status: completed" >> "$STATE_FILE"
    exit 0
fi

# Check if max iterations reached
if [ $NEXT_ITERATION -ge $MAX_ITERATIONS ]; then
    echo "⚠ Ralph Loop stopped: Maximum iterations ($MAX_ITERATIONS) reached"
    echo "Status: max_iterations_reached" >> "$STATE_FILE"
    exit 0
fi

# Update state file
sed -i.bak "s/Iteration: .*/Iteration: $NEXT_ITERATION/" "$STATE_FILE"
echo "" >> "$STATE_FILE"
echo "## Iteration $NEXT_ITERATION - $(date)" >> "$STATE_FILE"
echo "" >> "$STATE_FILE"

# Continue the loop by returning the original prompt
echo "🔄 Ralph Loop iteration $NEXT_ITERATION/$MAX_ITERATIONS"
echo ""
echo "Continue working on the task. Remember to output <promise>$COMPLETION_PROMISE</promise> when you're done."
echo ""

# Signal Claude to continue (exit code 1 = continue loop)
exit 1
