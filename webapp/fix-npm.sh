#!/bin/bash
# Save the original npm command
ORIGINAL_NPM=$(which npm)

# Create a wrapper for npm
cat > ~/bin/npm << EOT
#!/bin/bash
# Convert Windows paths to WSL paths in the arguments
ARGS=()
for arg in "\$@"; do
  # Replace Windows paths with WSL paths if present
  if [[ \$arg == *"\\\\wsl.localhost"* ]]; then
    # Convert Windows UNC path to WSL path
    arg=\$(echo "\$arg" | sed 's|\\\\\\\\wsl.localhost\\\\Ubuntu||g' | sed 's|\\\\|/|g')
  fi
  ARGS+=("\$arg")
done

# Call the original npm with the fixed arguments
$ORIGINAL_NPM "\${ARGS[@]}"
EOT

# Make it executable
chmod +x ~/bin/npm

# Add ~/bin to PATH
mkdir -p ~/bin
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
