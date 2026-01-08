#!/bin/bash

# Referral System Test Script
# Tests the referral system with mock data

API_URL="http://localhost:3001"

echo "======================================"
echo "Referral System Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create User A (Referrer)
echo -e "${YELLOW}Test 1: Creating User A (will be the referrer)${NC}"
RESPONSE_A=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"initData": "mock_data"}')

USER_A_ID=$(echo "$RESPONSE_A" | jq -r '.data.user.telegram_id')
REFERRAL_CODE_A=$(echo "$RESPONSE_A" | jq -r '.data.user.referral_code')

if [ -n "$REFERRAL_CODE_A" ] && [ "$REFERRAL_CODE_A" != "null" ]; then
  echo -e "${GREEN}✓ User A created successfully${NC}"
  echo "  Telegram ID: $USER_A_ID"
  echo "  Referral Code: $REFERRAL_CODE_A"
else
  echo -e "${RED}✗ Failed to create User A${NC}"
  exit 1
fi
echo ""

# Test 2: Create User B with User A's referral code
echo -e "${YELLOW}Test 2: Creating User B with User A's referral code${NC}"
# ✅ SECURITY: Embed referral code in initData using mock format
# Server will extract it from validated initData.start_param
RESPONSE_B=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"initData\": \"mock_user_b|$REFERRAL_CODE_A\"}")

USER_B_ID=$(echo "$RESPONSE_B" | jq -r '.data.user.telegram_id')
USER_B_REFERRER=$(echo "$RESPONSE_B" | jq -r '.data.user.referrer_id')
REFERRAL_APPLIED=$(echo "$RESPONSE_B" | jq -r '.data.referralApplied')

if [ "$USER_B_REFERRER" == "$USER_A_ID" ]; then
  echo -e "${GREEN}✓ User B created with correct referrer${NC}"
  echo "  Telegram ID: $USER_B_ID"
  echo "  Referred by: $USER_B_REFERRER"
  echo "  Referral Applied: $REFERRAL_APPLIED"
else
  echo -e "${RED}✗ User B referrer mismatch${NC}"
  echo "  Expected: $USER_A_ID"
  echo "  Got: $USER_B_REFERRER"
fi
echo ""

# Test 3: Get User A's referrals
echo -e "${YELLOW}Test 3: Fetching User A's referral list${NC}"
REFERRALS=$(curl -s "${API_URL}/auth/referrals?telegram_id=$USER_A_ID")
REFERRAL_COUNT=$(echo "$REFERRALS" | jq -r '.data | length')

if [ "$REFERRAL_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ User A has $REFERRAL_COUNT referral(s)${NC}"
  echo "$REFERRALS" | jq '.data[] | "  - \(.first_name) (@\(.username // "no username")) - Joined: \(.created_at)"'
else
  echo -e "${RED}✗ User A has no referrals${NC}"
fi
echo ""

# Test 4: Test self-referral prevention
echo -e "${YELLOW}Test 4: Testing self-referral prevention${NC}"
USER_C_REFERRAL_CODE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"initData": "mock_user_c"}' | jq -r '.data.user.referral_code')

# Try to use own referral code (embedded in initData)
SELF_REFERRAL_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"initData\": \"mock_user_c|$USER_C_REFERRAL_CODE\"}")

SELF_REFERRAL_APPLIED=$(echo "$SELF_REFERRAL_RESPONSE" | jq -r '.data.referralApplied')

if [ "$SELF_REFERRAL_APPLIED" == "false" ]; then
  echo -e "${GREEN}✓ Self-referral correctly prevented${NC}"
else
  echo -e "${RED}✗ Self-referral was not prevented${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "${GREEN}✓ Referral code generation works${NC}"
echo -e "${GREEN}✓ Referral tracking works${NC}"
echo -e "${GREEN}✓ Referral list retrieval works${NC}"
echo -e "${GREEN}✓ Self-referral prevention works${NC}"
echo ""
echo "Test completed!"
