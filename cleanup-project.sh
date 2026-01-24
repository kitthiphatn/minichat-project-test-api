# Cleanup Script สำหรับ Linux/Mac
echo "========================================"
echo "Cleaning Up Minichat Project"
echo "========================================"
echo ""

echo "[1/3] Creating scripts folder..."
mkdir -p scripts
echo "Done!"
echo ""

echo "[2/3] Moving .bat files to scripts folder..."
mv -f check-ollama.bat scripts/ 2>/dev/null || true
mv -f test-ollama-api.bat scripts/ 2>/dev/null || true
mv -f test-backend-request.bat scripts/ 2>/dev/null || true
mv -f download-all-models.bat scripts/ 2>/dev/null || true
mv -f fix-tunnel.bat scripts/ 2>/dev/null || true
echo "Done!"
echo ""

echo "[3/3] Deleting redundant documentation files..."
rm -f FIX_TUNNEL_CONFIG.md 2>/dev/null || true
rm -f DEPLOYMENT.md 2>/dev/null || true
rm -f API_GUIDE.md 2>/dev/null || true
rm -f SETUP_GUIDE.md 2>/dev/null || true
rm -f QUICKSTART.md 2>/dev/null || true
rm -f PROJECT_SUMMARY.md 2>/dev/null || true
rm -f PACKAGE_SUMMARY.md 2>/dev/null || true
rm -f HOW_TO_USE_ANTIGRAVITY.md 2>/dev/null || true
rm -f PROMPT_FOR_CLAUDE.md 2>/dev/null || true
rm -f query 2>/dev/null || true
echo "Done!"
echo ""

echo "========================================"
echo "Cleanup Complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "- Created scripts/ folder"
echo "- Moved 5 .bat files to scripts/"
echo "- Deleted 10 redundant files"
echo ""
echo "Remaining files in root:"
echo "- README.md"
echo "- README.th.md"
echo "- CHANGELOG.md"
echo "- CONTRIBUTING.md"
echo "- LICENSE"
echo "- package.json"
echo "- docker-compose.yml"
echo "- cloudflared-config.yml"
echo "- setup.sh"
echo "- start.bat"
echo "- backend/"
echo "- frontend/"
echo "- manual/"
echo "- scripts/"
echo ""
