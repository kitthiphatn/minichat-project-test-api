#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="test_admin_$(date +%s)@example.com"
PASSWORD="password123"
SESSION_ID="sess_test_$(date +%s)"

echo "---------------------------------------------------"
echo "🚀 Starting Live Chat Takeover Verification"
echo "---------------------------------------------------"

# 1. Register/Login
echo "1. Registering new admin user..."
USERNAME="TestAdmin_$(date +%s)"
REGISTER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $REGISTER_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Registration failed. Trying login..."
    LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Exiting."
    echo "Response: $REGISTER_RES"
    exit 1
fi
echo "✅ Logged in. Token received."

# 2. Create Workspace (Needed for conversation)
echo "2. Creating Workspace..."
WORKSPACE_RES=$(curl -s -X POST "$BASE_URL/workspaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Workspace"}')

WORKSPACE_ID=$(echo $WORKSPACE_RES | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "✅ Workspace ID: $WORKSPACE_ID"

# 3. Send User Message (Create Conversation)
echo "3. User sending message (Session: $SESSION_ID)..."
MSG_RES=$(curl -s -X POST "$BASE_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{\"message\":\"Hello bot\",\"workspaceId\":\"$WORKSPACE_ID\"}")

# Check if AI replied
AI_REPLY=$(echo $MSG_RES | grep -o '"aiMessage":{[^}]*}')
if [[ $AI_REPLY != *"null"* && $AI_REPLY != "" ]]; then
    echo "✅ Bot replied (Default Mode)."
else
    echo "❌ Bot failed to reply or something wrong."
    echo $MSG_RES
fi

# 4. Takeover Conversation
echo "4. Admin taking over..."
TAKEOVER_RES=$(curl -s -X POST "$BASE_URL/conversations/$SESSION_ID/takeover" \
  -H "Authorization: Bearer $TOKEN")

echo $TAKEOVER_RES
if [[ $TAKEOVER_RES == *"success\":true"* ]]; then
    echo "✅ Takeover successful."
else
    echo "❌ Takeover failed."
    exit 1
fi

# 5. Verify Bot Silence
echo "5. User sending message during takeover..."
SILENT_RES=$(curl -s -X POST "$BASE_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{\"message\":\"Are you there bot?\",\"workspaceId\":\"$WORKSPACE_ID\"}")

# Check if aiMessage is null
if [[ $SILENT_RES == *"\"aiMessage\":null"* ]]; then
    echo "✅ Bot is silent (Correct)."
else
    echo "❌ Bot replied when it should be silent!"
    echo $SILENT_RES
    exit 1
fi

# 6. End Session
echo "6. Ending human session..."
END_RES=$(curl -s -X POST "$BASE_URL/conversations/$SESSION_ID/end" \
  -H "Authorization: Bearer $TOKEN")

if [[ $END_RES == *"success\":true"* ]]; then
    echo "✅ Session ended. Bot should be PASSIVE."
else
    echo "❌ Failed to end session."
    exit 1
fi

# 7. Test Passive Mode (Non-question)
echo "7. Testing Passive Mode (Statement)..."
PASSIVE_RES_1=$(curl -s -X POST "$BASE_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{\"message\":\"Just saying hi\",\"workspaceId\":\"$WORKSPACE_ID\"}")

if [[ $PASSIVE_RES_1 == *"\"aiMessage\":null"* ]]; then
    echo "✅ Bot ignored statement (Correct)."
else
    echo "❌ Bot replied to statement in passive mode!"
    echo $PASSIVE_RES_1
fi

# 8. Test Passive Mode (Question)
echo "8. Testing Passive Mode (Question)..."
PASSIVE_RES_2=$(curl -s -X POST "$BASE_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d "{\"message\":\"Can you help me?\",\"workspaceId\":\"$WORKSPACE_ID\"}")

if [[ $PASSIVE_RES_2 != *"\"aiMessage\":null"* ]]; then
    echo "✅ Bot answered question (Active again)."
else
    echo "❌ Bot ignored question!"
    echo $PASSIVE_RES_2
fi

echo "---------------------------------------------------"
echo "🎉 Verification Complete!"
echo "---------------------------------------------------"
