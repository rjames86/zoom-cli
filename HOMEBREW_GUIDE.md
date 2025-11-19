# Homebrew Distribution Guide

This document explains how to distribute your CLI tool via Homebrew and how to maintain it over time.

## Overview

Homebrew is a package manager for macOS that makes it easy for users to install software. By creating a "tap" (a third-party repository), you can distribute your CLI tools without needing to submit them to the main Homebrew repository.

## Initial Setup (Already Completed)

### 1. Personal Tap Repository Structure
We created a separate GitHub repository for your Homebrew tap:
- **Repository**: https://github.com/rjames86/homebrew-tap
- **Naming Convention**: `homebrew-<tap-name>` (Homebrew requirement)
- **Structure**:
  ```
  homebrew-tap/
  ├── README.md
  └── Formula/
      └── zoom-cli.rb
  ```

### 2. Formula File
The formula file (`Formula/zoom-cli.rb`) contains the installation instructions for Homebrew:

```ruby
class ZoomCli < Formula
  desc "Node module and CLI for controlling Zoom meetings on macOS using AppleScript"
  homepage "https://github.com/rjames86/zoom-cli"
  url "https://github.com/rjames86/zoom-cli/archive/v1.0.0.tar.gz"
  sha256 "ddb9119da6846497f51e758ff2415ec3b938a16863ec15ecba3d4bcd425bc1d2"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args(prefix: false)
    system "npm", "run", "build"
    bin.install "dist/cli.js" => "zoom-cli"
    inreplace "#{bin}/zoom-cli", %r{^#!/usr/bin/env node}, "#!/usr/bin/env node"
    lib.install Dir["dist/*"]
    lib.install "package.json"
  end

  test do
    output = shell_output("#{bin}/zoom-cli help")
    assert_match "Zoom CLI - Control Zoom meetings from the command line", output
  end
end
```

## How Users Install Your Package

Once set up, users can install your CLI with:

```bash
brew tap rjames86/tap
brew install zoom-cli
```

This will:
1. Add your tap to their Homebrew installation
2. Install Node.js as a dependency (if not already installed)
3. Download the source code from GitHub
4. Run `npm install` and `npm run build`
5. Install the CLI binary to `/opt/homebrew/bin/zoom-cli`

## Updating Your Package

When you want to release a new version of your CLI, follow these steps:

### Step 1: Release a New Version in Your Main Repository

1. **Update version in package.json**:
   ```bash
   cd /Users/rjames/dev/zoom-cli
   # Edit package.json to bump version to 1.1.0
   npm version patch  # or minor/major
   ```

2. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "Release v1.1.0"
   git push origin main
   ```

3. **Create a GitHub release**:
   ```bash
   gh release create v1.1.0 --title "Release v1.1.0" --notes "- Add new feature X\n- Fix bug Y"
   ```

### Step 2: Update the Homebrew Formula

1. **Get the new tarball SHA256**:
   ```bash
   curl -sL https://github.com/rjames86/zoom-cli/archive/v1.1.0.tar.gz | shasum -a 256
   ```

2. **Update the formula file**:
   ```bash
   cd /tmp
   git clone https://github.com/rjames86/homebrew-tap.git
   cd homebrew-tap
   ```

3. **Edit `Formula/zoom-cli.rb`**:
   - Update the `url` line to point to the new version
   - Update the `sha256` with the hash from step 1

   Example:
   ```ruby
   url "https://github.com/rjames86/zoom-cli/archive/v1.1.0.tar.gz"
   sha256 "new_hash_here"
   ```

4. **Test the formula locally** (optional but recommended):
   ```bash
   brew install --build-from-source ./Formula/zoom-cli.rb
   ```

5. **Commit and push the update**:
   ```bash
   git add Formula/zoom-cli.rb
   git commit -m "Update zoom-cli to v1.1.0"
   git push origin main
   ```

### Step 3: Users Update Their Installation

Users can then update to the new version with:
```bash
brew update
brew upgrade zoom-cli
```

## Automated Update Script

Here's a script to automate the Homebrew formula update process:

```bash
#!/bin/bash
# update-homebrew.sh

set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.1.0"
    exit 1
fi

VERSION=$1
REPO_NAME="zoom-cli"
TAP_REPO="homebrew-tap"

echo "Updating Homebrew formula for $REPO_NAME to $VERSION..."

# Get SHA256 of the new release
echo "Getting SHA256 hash..."
SHA256=$(curl -sL "https://github.com/rjames86/$REPO_NAME/archive/$VERSION.tar.gz" | shasum -a 256 | cut -d' ' -f1)
echo "SHA256: $SHA256"

# Clone tap repository
echo "Cloning tap repository..."
cd /tmp
rm -rf $TAP_REPO
git clone "https://github.com/rjames86/$TAP_REPO.git"
cd $TAP_REPO

# Update formula
echo "Updating formula..."
sed -i '' "s|archive/v[0-9.]*.tar.gz|archive/$VERSION.tar.gz|g" Formula/zoom-cli.rb
sed -i '' "s/sha256 \"[a-f0-9]*\"/sha256 \"$SHA256\"/g" Formula/zoom-cli.rb

# Commit and push
echo "Committing changes..."
git add Formula/zoom-cli.rb
git commit -m "Update zoom-cli to $VERSION"
git push origin main

echo "✅ Homebrew formula updated successfully!"
echo "Users can now run: brew update && brew upgrade zoom-cli"

# Cleanup
cd /tmp
rm -rf $TAP_REPO
```

## Formula Components Explained

### Basic Information
- `desc`: Short description of your package
- `homepage`: Project homepage URL
- `url`: Download URL for the source code
- `sha256`: Checksum for security verification
- `license`: Software license

### Dependencies
- `depends_on "node"`: Ensures Node.js is installed before your package

### Installation Process
The `install` method defines how Homebrew builds and installs your package:

1. `system "npm", "install"`: Install Node.js dependencies
2. `system "npm", "run", "build"`: Build the TypeScript code
3. `bin.install "dist/cli.js" => "zoom-cli"`: Install the CLI binary
4. `lib.install Dir["dist/*"]`: Install library files for programmatic use

### Testing
The `test` block verifies the installation works correctly.

## Best Practices

### Version Management
1. Always use semantic versioning (e.g., v1.2.3)
2. Create GitHub releases for every version
3. Update the Homebrew formula immediately after releasing

### Formula Updates
1. Test formulas locally before pushing
2. Use descriptive commit messages
3. Keep the SHA256 hash up to date

### Security
1. Always verify SHA256 hashes
2. Don't modify formulas without corresponding source code releases
3. Keep dependencies up to date

## Troubleshooting

### Common Issues

1. **SHA256 mismatch**: Always regenerate the hash for new releases
2. **Build failures**: Test locally with `brew install --build-from-source`
3. **SSH/HTTPS issues**: Users may need to configure Git for HTTPS:
   ```bash
   git config --global url."https://github.com/".insteadOf git@github.com:
   ```

### Testing Your Formula

```bash
# Install from local formula
brew install --build-from-source ./Formula/zoom-cli.rb

# Audit formula for common issues
brew audit --strict Formula/zoom-cli.rb

# Test formula
brew test zoom-cli
```

### Module Resolution Issues

If users get "Cannot find module" errors after installation:

1. **The Issue**: Node.js modules need to maintain their directory structure
2. **The Fix**: Use `libexec.install Dir["*"]` to install the entire package
3. **Create a wrapper**: Use a bash wrapper script to call Node.js with correct paths

Example fixed install method:
```ruby
def install
  system "npm", "install", *std_npm_args(prefix: false)
  system "npm", "run", "build"

  # Install entire package to preserve module structure
  libexec.install Dir["*"]

  # Create wrapper script
  (bin/"zoom-cli").write <<~EOS
    #!/bin/bash
    exec "#{Formula["node"].opt_bin}/node" "#{libexec}/dist/cli.js" "$@"
  EOS
end
```

### Fixing a Broken Installation

If you need to fix a broken formula that users have already installed:

1. **Update the formula** in your tap repository
2. **Users should run**:
   ```bash
   brew uninstall zoom-cli
   brew update
   brew install zoom-cli
   ```

## Alternative Distribution Methods

If you ever want to submit to the main Homebrew repository:

1. Your tool needs significant popularity/adoption
2. Submit a PR to https://github.com/Homebrew/homebrew-core
3. Follow their contribution guidelines
4. Maintain the formula as part of core Homebrew

For now, the personal tap approach gives you full control and is perfect for your needs.