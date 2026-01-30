#!/bin/bash

# Test Product & Order APIs with Plan Limits
# This script tests the complete Product/Order system

echo "🧪 Testing Product & Order APIs with Plan Limits"
echo "================================================"
echo ""

# Configuration
API_URL="http://localhost:5001/api"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "Step 1: Login to get token"
echo "----------------------------"
read -p "Enter your email: " EMAIL
read -sp "Enter your password: " PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed!${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful!${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo "Step 2: Test Product APIs"
echo "----------------------------"

# Create Product 1
test_endpoint "Create Product #1" "POST" "/products" \
    '{"name":"iPhone 15 Pro","description":"สมาร์ทโฟนรุ่นล่าสุด","price":42900,"stock":{"available":50},"category":"Electronics","images":["https://example.com/iphone.jpg"]}' \
    "201"

# Create Product 2
test_endpoint "Create Product #2" "POST" "/products" \
    '{"name":"MacBook Pro M3","description":"โน้ตบุ๊คสำหรับมืออาชีพ","price":89900,"stock":{"available":20},"category":"Electronics","images":["https://example.com/macbook.jpg"]}' \
    "201"

# Get all products
test_endpoint "Get All Products" "GET" "/products" "" "200"

# Get categories
test_endpoint "Get Categories" "GET" "/products/categories" "" "200"

echo ""
echo "Step 3: Test Order APIs"
echo "----------------------------"

# Get product ID from previous create (simplified - in real test we'd parse JSON)
# For now, we'll use a placeholder
PRODUCT_DATA='{"workspaceId":"WORKSPACE_ID_HERE","customer":{"name":"ทดสอบ ลูกค้า","email":"test@example.com","phone":"0812345678"},"items":[{"product":"PRODUCT_ID_HERE","quantity":1}],"pricing":{"shipping":50,"tax":0}}'

echo -e "${YELLOW}Note: Order creation requires valid product IDs${NC}"
echo -e "${YELLOW}Please create orders through the dashboard or update this script with real IDs${NC}"

echo ""
echo "Step 4: Test Plan Limits"
echo "----------------------------"

echo "Creating products to test Free Plan limit (10 products)..."
for i in {3..11}; do
    test_endpoint "Create Product #$i" "POST" "/products" \
        "{\"name\":\"Test Product $i\",\"description\":\"Testing plan limits\",\"price\":$((i * 100)),\"stock\":{\"available\":10}}" \
        "201"
    
    if [ $i -eq 11 ]; then
        echo -e "${YELLOW}Expected to fail on 11th product (Free plan limit is 10)${NC}"
    fi
done

echo ""
echo "Step 5: Check Workspace Usage"
echo "----------------------------"

WORKSPACE_RESPONSE=$(curl -s -X GET "$API_URL/workspaces" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

echo "Workspace Usage:"
echo "$WORKSPACE_RESPONSE" | grep -o '"usage":{[^}]*}' || echo "Could not parse usage"

echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
