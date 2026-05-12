#!/bin/bash

BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/bin"
mkdir -p "$BIN_DIR"

echo "🔍 Linux Setup for yt-dlp & FFmpeg"
echo "=================================="

# ============================================================================
# FFmpeg Setup
# ============================================================================

echo ""
echo "📦 Checking FFmpeg..."

if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version 2>/dev/null | head -n1)
    echo "✅ FFmpeg already installed: $FFMPEG_VERSION"
else
    echo "❌ FFmpeg not found"
    
    # Try apt
    if command -v apt-get &> /dev/null; then
        echo "📥 Installing via apt..."
        sudo apt-get update && sudo apt-get install -y ffmpeg
        if [ $? -eq 0 ]; then
            echo "✅ FFmpeg installed via apt"
        else
            echo "❌ apt installation failed, trying manual download..."
            install_ffmpeg_manual
        fi
    # Try yum
    elif command -v yum &> /dev/null; then
        echo "📥 Installing via yum..."
        sudo yum install -y ffmpeg
        if [ $? -eq 0 ]; then
            echo "✅ FFmpeg installed via yum"
        else
            echo "❌ yum installation failed"
        fi
    # Try brew (macOS)
    elif command -v brew &> /dev/null; then
        echo "📥 Installing via brew..."
        brew install ffmpeg
        if [ $? -eq 0 ]; then
            echo "✅ FFmpeg installed via brew"
        fi
    else
        echo "❌ No package manager found"
        install_ffmpeg_manual
    fi
fi

# ============================================================================
# yt-dlp Setup
# ============================================================================

echo ""
echo "📦 Checking yt-dlp..."

if command -v yt-dlp &> /dev/null; then
    YTDLP_VERSION=$(yt-dlp --version 2>/dev/null)
    echo "✅ yt-dlp already installed: $YTDLP_VERSION"
else
    echo "❌ yt-dlp not found"
    
    # Try pip
    if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
        echo "📥 Installing yt-dlp via pip..."
        pip3 install yt-dlp --break-system-packages 2>/dev/null || pip install yt-dlp --break-system-packages 2>/dev/null
        
        if command -v yt-dlp &> /dev/null; then
            echo "✅ yt-dlp installed via pip"
        else
            echo "❌ pip installation failed, trying manual download..."
            install_ytdlp_manual
        fi
    else
        echo "❌ pip not found"
        install_ytdlp_manual
    fi
fi

echo ""
echo "✅ Setup complete!"
echo "Run bot: npm start"

# ============================================================================
# Manual Install Functions
# ============================================================================

install_ffmpeg_manual() {
    echo "📥 Downloading FFmpeg binary..."
    
    FFMPEG_URL="https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-linux64-gpl.tar.xz"
    FFMPEG_TAR="$BIN_DIR/ffmpeg.tar.xz"
    
    # Download
    if ! curl -L -o "$FFMPEG_TAR" "$FFMPEG_URL" 2>/dev/null; then
        echo "❌ Failed to download FFmpeg"
        return 1
    fi
    
    # Extract
    cd "$BIN_DIR"
    tar -xf "$FFMPEG_TAR" --strip-components=2 "ffmpeg-master-linux64-gpl/bin/ffmpeg" 2>/dev/null
    rm "$FFMPEG_TAR"
    
    chmod +x "$BIN_DIR/ffmpeg"
    
    if [ -f "$BIN_DIR/ffmpeg" ]; then
        echo "✅ FFmpeg downloaded to $BIN_DIR/ffmpeg"
    else
        echo "❌ Failed to extract FFmpeg"
        return 1
    fi
}

install_ytdlp_manual() {
    echo "📥 Downloading yt-dlp binary..."
    
    YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
    YTDLP_BIN="$BIN_DIR/yt-dlp"
    
    # Download
    if ! curl -L -o "$YTDLP_BIN" "$YTDLP_URL" 2>/dev/null; then
        echo "❌ Failed to download yt-dlp"
        return 1
    fi
    
    chmod +x "$YTDLP_BIN"
    
    if [ -f "$YTDLP_BIN" ]; then
        echo "✅ yt-dlp downloaded to $BIN_DIR/yt-dlp"
    else
        echo "❌ Failed to download yt-dlp"
        return 1
    fi
}