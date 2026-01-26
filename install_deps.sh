#!/bin/bash
echo "Installing Docker..."
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2

echo "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

echo "Adding user to docker group..."
sudo usermod -aG docker $USER

echo "Done! Please log out and back in, or run 'newgrp docker' to use Docker without sudo."
