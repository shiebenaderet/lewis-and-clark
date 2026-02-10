#!/bin/bash
# Download public domain portrait images for Lewis & Clark expedition figures
# from Wikimedia Commons.
#
# All images are public domain (pre-1928 works or explicitly CC-licensed).
# Run this script from the portraits directory or any location with internet access.
#
# Usage: bash download-portraits.sh [output_directory]
# Default output directory: current directory

set -euo pipefail

OUTPUT_DIR="${1:-.}"
mkdir -p "$OUTPUT_DIR"

echo "====================================================="
echo " Lewis & Clark Expedition - Portrait Image Downloader"
echo "====================================================="
echo ""
echo "Downloading public domain portraits from Wikimedia Commons..."
echo "Output directory: $OUTPUT_DIR"
echo ""

# User-Agent header required by Wikimedia Commons policy
UA="LewisClarkEdu/1.0 (Educational project; contact via GitHub)"

download_image() {
    local url="$1"
    local filename="$2"
    local description="$3"

    echo -n "  Downloading $description... "
    if curl -sS -L -o "$OUTPUT_DIR/$filename" \
        -H "User-Agent: $UA" \
        "$url" 2>/dev/null; then
        # Verify the file is actually an image (not an error page)
        local size
        size=$(stat -f%z "$OUTPUT_DIR/$filename" 2>/dev/null || stat -c%s "$OUTPUT_DIR/$filename" 2>/dev/null || echo "0")
        if [ "$size" -gt 1000 ]; then
            echo "OK ($size bytes)"
        else
            echo "FAILED (file too small, may be an error page)"
            rm -f "$OUTPUT_DIR/$filename"
        fi
    else
        echo "FAILED"
    fi
}

echo ""
echo "--- PRIMARY PORTRAITS (Lewis, Clark, Jefferson, Sacagawea, York) ---"
echo ""

# 1. Meriwether Lewis - Charles Willson Peale portrait, 1807
#    Independence National Historic Park Collection, Philadelphia
#    Public domain: painted 1807, artist died 1827
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/b/be/Meriwether_Lewis-Charles_Willson_Peale.jpg" \
    "lewis-portrait.jpg" \
    "Meriwether Lewis (Peale, 1807)"

# 2. William Clark - Charles Willson Peale portrait, 1807
#    Independence National Historic Park Collection, Philadelphia
#    Public domain: painted 1807, artist died 1827
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/6/66/William_Clark-Charles_Willson_Peale.jpg" \
    "clark-portrait.jpg" \
    "William Clark (Peale, 1807)"

# 3. Thomas Jefferson - Rembrandt Peale portrait, 1800
#    White House Collection
#    Public domain: painted 1800, artist died 1860
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/0/07/Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg" \
    "jefferson-portrait.jpg" \
    "Thomas Jefferson (Rembrandt Peale, 1800)"

# 4. Sacagawea - Bruno Zimm sculpture portrait, 1904
#    No contemporary portrait of Sacagawea exists.
#    This is a well-known 1904 sculptural depiction.
#    Public domain: created 1904, artist died 1943
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/9/97/Sakakawea_by_Bruno_Zimm_1904.jpg" \
    "sacagawea-portrait.jpg" \
    "Sacagawea (Zimm sculpture, 1904)"

# 5. York - Charles M. Russell watercolor, 1908
#    "York" painting showing York meeting Hidatsa people
#    Public domain: painted 1908, artist died 1926
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/1/14/Charles_M_Russell_York_1908.jpg" \
    "york-portrait.jpg" \
    "York (C.M. Russell, 1908)"

echo ""
echo "--- SECONDARY PORTRAITS ---"
echo ""

# 6. Toussaint Charbonneau - artistic rendering
#    Public domain artistic depiction
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/f/f5/Charbonneau_Painting_Cropped.jpg" \
    "charbonneau-portrait.jpg" \
    "Toussaint Charbonneau (artistic rendering)"

# 7. Jean Baptiste Charbonneau - Wellcome Library portrait
#    "'Baptiste', a Native American" - historical portrait
#    Wellcome Library, CC-BY 4.0
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/a/a1/%27Baptiste%27%2C_a_Native_American_Wellcome_L0046606.jpg" \
    "jean-baptiste-portrait.jpg" \
    "Jean Baptiste Charbonneau (Wellcome Library)"

# 8. Sergeant Charles Floyd - Monument photograph
#    100-foot obelisk at Sioux City, Iowa (first National Historic Landmark)
#    Photo: CC-BY-SA 4.0
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/c/c6/Sgt_Floyd_Monument_PA140783.JPG" \
    "floyd-monument.jpg" \
    "Sergeant Floyd Monument (Sioux City, Iowa)"

echo ""
echo "--- ALTERNATIVE / SUPPLEMENTARY IMAGES ---"
echo ""

# Alternative Sacagawea - illustration from historical book
#    Public domain: published before 1928
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Sacajawea_from_Nixon_book.png" \
    "sacagawea-portrait-alt.png" \
    "Sacagawea (Nixon book illustration)"

# Lewis and Clark on the Lower Columbia - C.M. Russell, 1905
#    Shows multiple expedition members including York, Sacagawea, Clark
#    Public domain: painted 1905, artist died 1926
download_image \
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/Lewis_and_clark-expedition.jpg" \
    "expedition-group.jpg" \
    "Expedition group (Russell, Lower Columbia, 1905)"

echo ""
echo "====================================================="
echo " Download complete!"
echo ""
echo " NOTE: George Drouillard and Chief Cameahwait have no"
echo " known public domain portrait images available."
echo "====================================================="
echo ""

# List downloaded files
echo "Downloaded files:"
ls -la "$OUTPUT_DIR"/*.jpg "$OUTPUT_DIR"/*.png "$OUTPUT_DIR"/*.JPG 2>/dev/null || echo "  (no files found)"
