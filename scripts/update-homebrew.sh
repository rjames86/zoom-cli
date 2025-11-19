#!/bin/bash
# update-homebrew.sh
# Automates updating the Homebrew formula when releasing a new version

set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.1.0"
    exit 1
fi

VERSION=$1
REPO_NAME="zoom-cli"
TAP_REPO="homebrew-tap"

echo "🍺 Updating Homebrew formula for $REPO_NAME to $VERSION..."

# Validate version format
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Error: Version must be in format vX.Y.Z (e.g., v1.2.3)"
    exit 1
fi

# Check if GitHub release exists
echo "📋 Checking if GitHub release exists..."
if ! gh release view "$VERSION" >/dev/null 2>&1; then
    echo "❌ Error: GitHub release $VERSION does not exist."
    echo "Create it first with: gh release create $VERSION"
    exit 1
fi

# Get SHA256 of the new release
echo "🔐 Getting SHA256 hash..."
SHA256=$(curl -sL "https://github.com/rjames86/$REPO_NAME/archive/$VERSION.tar.gz" | shasum -a 256 | cut -d' ' -f1)
echo "SHA256: $SHA256"

# Clone tap repository
echo "📥 Cloning tap repository..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git clone "https://github.com/rjames86/$TAP_REPO.git"
cd "$TAP_REPO"

# Update formula
echo "✏️  Updating formula..."
sed -i '' "s|archive/v[0-9.]*.tar.gz|archive/$VERSION.tar.gz|g" Formula/zoom-cli.rb
sed -i '' "s/sha256 \"[a-f0-9]*\"/sha256 \"$SHA256\"/g" Formula/zoom-cli.rb

# Show what changed
echo "📝 Changes made:"
git diff Formula/zoom-cli.rb

# Ask for confirmation
read -p "👆 Do these changes look correct? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted by user"
    cd /
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Commit and push
echo "📤 Committing changes..."
git add Formula/zoom-cli.rb
git commit -m "Update zoom-cli to $VERSION

- Updated download URL to $VERSION
- Updated SHA256 hash to $SHA256"
git push origin main

echo "✅ Homebrew formula updated successfully!"
echo ""
echo "🎉 Next steps:"
echo "   1. Users can now run: brew update && brew upgrade zoom-cli"
echo "   2. Test the installation: brew uninstall zoom-cli && brew install zoom-cli"
echo "   3. Verify with: zoom-cli --version (if you added version support)"

# Cleanup
cd /
rm -rf "$TEMP_DIR"