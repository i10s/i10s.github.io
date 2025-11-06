#!/bin/bash
# Performance and Quality Audit Script
# Tests the optimized website for performance, accessibility, SEO, and best practices

echo "🚀 Starting Website Audit..."
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }

URL="https://ifuentes.net"
LOCAL_URL="http://localhost:8000"

echo ""
echo "📊 Testing URL: $URL"
echo "=============================="

# Test 1: HTML Validation
echo ""
echo "1️⃣  HTML Validation"
echo "----------------------------"
echo "Validating HTML structure..."
curl -s -H "Content-Type: text/html; charset=utf-8" \
     --data-binary "@index.html" \
     "https://validator.w3.org/nu/?out=json" > validation_report.json

if [ -s validation_report.json ]; then
    ERRORS=$(cat validation_report.json | grep -o '"type":"error"' | wc -l)
    WARNINGS=$(cat validation_report.json | grep -o '"type":"info"' | wc -l)
    
    if [ "$ERRORS" -eq 0 ]; then
        echo -e "${GREEN}✓ HTML is valid (0 errors, $WARNINGS warnings)${NC}"
    else
        echo -e "${RED}✗ Found $ERRORS HTML errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Could not validate HTML${NC}"
fi

# Test 2: Check file sizes
echo ""
echo "2️⃣  File Size Analysis"
echo "----------------------------"
HTML_SIZE=$(wc -c < index.html)
HTML_SIZE_KB=$(echo "scale=2; $HTML_SIZE/1024" | bc)
echo "HTML size: ${HTML_SIZE_KB}KB"

if (( $(echo "$HTML_SIZE_KB < 10" | bc -l) )); then
    echo -e "${GREEN}✓ HTML size is optimal (< 10KB)${NC}"
else
    echo -e "${YELLOW}⚠ HTML size is larger than 10KB${NC}"
fi

# Test 3: Check for performance issues
echo ""
echo "3️⃣  Performance Checks"
echo "----------------------------"

# Check for blocking resources
BLOCKING_SCRIPTS=$(grep -c '<script src=' index.html || echo "0")
BLOCKING_STYLES=$(grep -c '<link rel="stylesheet"' index.html || echo "0")

echo "Blocking scripts: $BLOCKING_SCRIPTS"
echo "External stylesheets: $BLOCKING_STYLES"

if [ "$BLOCKING_SCRIPTS" -eq 0 ] && [ "$BLOCKING_STYLES" -eq 0 ]; then
    echo -e "${GREEN}✓ No render-blocking resources${NC}"
else
    echo -e "${YELLOW}⚠ Found render-blocking resources${NC}"
fi

# Test 4: Accessibility checks
echo ""
echo "4️⃣  Accessibility Checks"
echo "----------------------------"

# Check for ARIA labels
ARIA_LABELS=$(grep -c 'aria-label=' index.html || echo "0")
echo "ARIA labels found: $ARIA_LABELS"

# Check for alt attributes on images (if any)
IMAGES=$(grep -c '<img' index.html || echo "0")
IMAGES_WITH_ALT=$(grep -c 'alt=' index.html || echo "0")

echo "Images: $IMAGES"
echo "Images with alt text: $IMAGES_WITH_ALT"

if [ "$IMAGES" -eq "$IMAGES_WITH_ALT" ] || [ "$IMAGES" -eq 0 ]; then
    echo -e "${GREEN}✓ All images have alt text${NC}"
else
    echo -e "${RED}✗ Some images missing alt text${NC}"
fi

# Test 5: SEO checks
echo ""
echo "5️⃣  SEO Checks"
echo "----------------------------"

# Check for meta description
if grep -q 'name="description"' index.html; then
    echo -e "${GREEN}✓ Meta description present${NC}"
else
    echo -e "${RED}✗ Missing meta description${NC}"
fi

# Check for Open Graph tags
OG_TAGS=$(grep -c 'property="og:' index.html || echo "0")
echo "Open Graph tags: $OG_TAGS"

if [ "$OG_TAGS" -gt 3 ]; then
    echo -e "${GREEN}✓ Open Graph tags present${NC}"
else
    echo -e "${YELLOW}⚠ Consider adding more Open Graph tags${NC}"
fi

# Check for structured data
if grep -q 'application/ld+json' index.html; then
    echo -e "${GREEN}✓ Structured data (JSON-LD) present${NC}"
else
    echo -e "${YELLOW}⚠ Missing structured data${NC}"
fi

# Test 6: Security checks
echo ""
echo "6️⃣  Security Checks"
echo "----------------------------"

# Check for noopener/noreferrer on external links
EXTERNAL_LINKS=$(grep -c 'href="http' index.html || echo "0")
SECURE_LINKS=$(grep -c 'noopener' index.html || echo "0")

echo "External links: $EXTERNAL_LINKS"
echo "Links with noopener: $SECURE_LINKS"

if [ "$EXTERNAL_LINKS" -eq "$SECURE_LINKS" ]; then
    echo -e "${GREEN}✓ All external links are secure${NC}"
else
    echo -e "${YELLOW}⚠ Some external links may need noopener/noreferrer${NC}"
fi

# Test 7: PWA checks
echo ""
echo "7️⃣  PWA Checks"
echo "----------------------------"

if [ -f "site.webmanifest" ]; then
    echo -e "${GREEN}✓ Web manifest found${NC}"
    
    # Check manifest completeness
    if grep -q '"name"' site.webmanifest && grep -q '"icons"' site.webmanifest; then
        echo -e "${GREEN}✓ Manifest has required fields${NC}"
    else
        echo -e "${YELLOW}⚠ Manifest may be incomplete${NC}"
    fi
else
    echo -e "${RED}✗ Web manifest not found${NC}"
fi

# Test 8: Mobile optimization
echo ""
echo "8️⃣  Mobile Optimization"
echo "----------------------------"

if grep -q 'viewport' index.html; then
    echo -e "${GREEN}✓ Viewport meta tag present${NC}"
else
    echo -e "${RED}✗ Missing viewport meta tag${NC}"
fi

# Check for responsive images (if any)
if grep -q 'srcset=' index.html; then
    echo -e "${GREEN}✓ Responsive images implemented${NC}"
else
    echo -e "${YELLOW}⚠ No responsive images (may not be needed)${NC}"
fi

# Test 9: Browser compatibility
echo ""
echo "9️⃣  Browser Compatibility"
echo "----------------------------"

# Check for modern CSS features that might need fallbacks
if grep -q 'var(--' index.html; then
    echo "✓ Using CSS custom properties (modern browsers)"
fi

if grep -q 'clamp(' index.html; then
    echo "✓ Using CSS clamp() (modern browsers)"
fi

if grep -q 'prefers-color-scheme' index.html; then
    echo -e "${GREEN}✓ Dark mode support implemented${NC}"
fi

# Test 10: Live site checks (if accessible)
echo ""
echo "🔟 Live Site Checks"
echo "----------------------------"

if curl -s --head "$URL" | head -n 1 | grep "200" > /dev/null; then
    echo -e "${GREEN}✓ Site is accessible${NC}"
    
    # Check response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$URL")
    echo "Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
        echo -e "${GREEN}✓ Fast response time (< 1s)${NC}"
    else
        echo -e "${YELLOW}⚠ Response time could be improved${NC}"
    fi
    
    # Check for compression
    if curl -s -I -H "Accept-Encoding: gzip" "$URL" | grep -i "content-encoding: gzip" > /dev/null; then
        echo -e "${GREEN}✓ Gzip compression enabled${NC}"
    else
        echo -e "${YELLOW}⚠ Gzip compression not detected${NC}"
    fi
    
    # Check for caching headers
    if curl -s -I "$URL" | grep -i "cache-control" > /dev/null; then
        echo -e "${GREEN}✓ Cache headers present${NC}"
    else
        echo -e "${YELLOW}⚠ Cache headers not detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Could not access live site${NC}"
fi

# Summary
echo ""
echo "=============================="
echo "✅ Audit Complete!"
echo "=============================="
echo ""
echo "📋 Summary Reports Generated:"
echo "   - validation_report.json (HTML validation details)"
echo ""
echo "🔍 Recommended Next Steps:"
echo "   1. Run Lighthouse audit: npx lighthouse $URL --view"
echo "   2. Test accessibility: https://wave.webaim.org/"
echo "   3. Check mobile-friendliness: https://search.google.com/test/mobile-friendly"
echo "   4. Test load speed: https://pagespeed.web.dev/"
echo ""
echo "📊 Quick Commands:"
echo "   Lighthouse:  npx lighthouse $URL --output html --output-path ./lighthouse-report.html"
echo "   Local test:  python3 -m http.server 8000"
echo ""

# Clean up
# rm -f validation_report.json  # Uncomment to auto-delete temp files
