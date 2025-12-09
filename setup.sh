#!/bin/bash

# Mini Chat Ollama - Setup Script
# This script automates the setup process for the project

set -e  # Exit on error

echo "=========================================="
echo "🤖 Mini Chat Ollama - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check Prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check Docker (optional)
if command_exists docker; then
    print_success "Docker is installed"
    DOCKER_AVAILABLE=true
else
    print_warning "Docker is not installed. You'll need to install MongoDB manually."
    DOCKER_AVAILABLE=false
fi

# Check Ollama (optional)
if command_exists ollama; then
    print_success "Ollama is installed"
else
    print_warning "Ollama is not installed. Install from https://ollama.ai/ to use local AI."
fi

echo ""

# Step 2: Install Backend Dependencies
echo "Step 2: Installing backend dependencies..."
echo ""

cd backend
if npm install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

echo ""

# Step 3: Install Frontend Dependencies
echo "Step 3: Installing frontend dependencies..."
echo ""

cd frontend
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""

# Step 4: Create Environment Files
echo "Step 4: Creating environment files..."
echo ""

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_success "Created backend/.env from template"
    print_info "Please edit backend/.env to add your API keys if needed"
else
    print_warning "backend/.env already exists, skipping"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
    print_success "Created frontend/.env.local from template"
else
    print_warning "frontend/.env.local already exists, skipping"
fi

echo ""

# Step 5: Start MongoDB
echo "Step 5: Starting MongoDB..."
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    if docker-compose up -d; then
        print_success "MongoDB started with Docker Compose"
    else
        print_error "Failed to start MongoDB with Docker"
        print_info "You can start it manually with: docker-compose up -d"
    fi
else
    print_warning "Docker not available. Please start MongoDB manually:"
    print_info "  - Install MongoDB from https://www.mongodb.com/try/download/community"
    print_info "  - Or use Docker: docker-compose up -d"
fi

echo ""

# Step 6: Summary and Next Steps
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start Ollama (if not running):"
echo "   ollama serve"
echo "   ollama pull llama3"
echo ""
echo "2. Start the backend server (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start the frontend server (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🎉 Happy chatting!"
echo ""
