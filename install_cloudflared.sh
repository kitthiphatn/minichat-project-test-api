#!/bin/bash
echo "Installing Cloudflare Tunnel..."
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
rm cloudflared.deb

echo "Starting Tunnel for minichat..."
echo "Run this command to start the tunnel:"
echo "cloudflared tunnel run minichat"
