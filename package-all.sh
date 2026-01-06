#!/usr/bin/env bash
set -e

# ================================
# Package ASCII Tetroids as a .deb
# ================================

PACKAGE_NAME="ascii-tetroids"
# Read version from package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_ARCH="all"
MAINTAINER="Myron Apostolakis <https://github.com/myapos>"
DESCRIPTION="ASCII Tetroids game written in Node.js"

BUILD_DIR="dist"
DEB_BUILD_DIR="deb-build"
DEB_FILE_NAME="${PACKAGE_NAME}_${PACKAGE_VERSION}.deb"

TAR_DIR="tar-build"
TAR_FILE_NAME="${PACKAGE_NAME}_${PACKAGE_VERSION}.tar.gz"

ZIP_DIR="zip-build"
ZIP_FILE_NAME="${PACKAGE_NAME}_${PACKAGE_VERSION}.zip"

# 1 Clean previous build
echo "Cleaning previous deb package..."
rm -rf $DEB_BUILD_DIR $DEB_FILE_NAME
mkdir -p $DEB_BUILD_DIR

# 2 Build project
echo "Building project..."
npm run package:deb

# 3 Create deb folder structure
echo "Creating deb folder structure..."
mkdir -p $DEB_BUILD_DIR/DEBIAN
mkdir -p $DEB_BUILD_DIR/usr/local/bin
mkdir -p $DEB_BUILD_DIR/usr/local/share/$PACKAGE_NAME

# 4 Copy project files
echo "Copying project files..."
cp $BUILD_DIR/index-new.js $DEB_BUILD_DIR/usr/local/share/$PACKAGE_NAME/
cp -r $BUILD_DIR/sounds $DEB_BUILD_DIR/usr/local/share/$PACKAGE_NAME/
cp inputSample.txt $DEB_BUILD_DIR/usr/local/share/$PACKAGE_NAME/

# 4 a Add package.json for ESM
echo "Adding package.json to support ESM..."
cat > $DEB_BUILD_DIR/usr/local/share/$PACKAGE_NAME/package.json <<EOL
{
  "type": "module"
}
EOL

# 5 Create launcher script
echo "Creating launcher script..."
cat > $DEB_BUILD_DIR/usr/local/bin/$PACKAGE_NAME <<EOL
#!/usr/bin/env bash
# Launcher for ASCII Tetroids
exec node /usr/local/share/$PACKAGE_NAME/index-new.js "\$@"
EOL

chmod +x $DEB_BUILD_DIR/usr/local/bin/$PACKAGE_NAME

# 6 Create DEBIAN/control file
echo "Creating DEBIAN/control file..."
cat > $DEB_BUILD_DIR/DEBIAN/control <<EOL
Package: $PACKAGE_NAME
Version: $PACKAGE_VERSION
Section: games
Priority: optional
Architecture: $PACKAGE_ARCH
Maintainer: $MAINTAINER
Description: $DESCRIPTION
 A fun ASCII-based Tetroids game for the terminal.
EOL

# 7 Build the .deb
echo "Building .deb package..."
dpkg-deb --build $DEB_BUILD_DIR $DEB_FILE_NAME

# 8 Output
echo "Done! Generated file: $DEB_FILE_NAME"

# -----------------------------
# 3 Package tar.gz for Linux/macOS
# -----------------------------
echo "Packaging tar.gz for Linux/macOS..."
rm -rf $TAR_DIR
mkdir -p $TAR_DIR/$PACKAGE_NAME

cp -r $BUILD_DIR/* $TAR_DIR/$PACKAGE_NAME/
cp -r inputSample.txt $TAR_DIR/$PACKAGE_NAME/

# launcher script for tar
cat > $TAR_DIR/$PACKAGE_NAME/run.sh <<EOL
#!/usr/bin/env bash
if ! command -v node &> /dev/null; then
  echo "Node.js >=18 is required. Please install it from https://nodejs.org/"
  exit 1
fi
exec node index-new.js "\$@"
EOL
chmod +x $TAR_DIR/$PACKAGE_NAME/run.sh

tar -czf $TAR_FILE_NAME -C $TAR_DIR $PACKAGE_NAME
echo "tar.gz package created: $TAR_FILE_NAME"

# -----------------------------
# 4 Package zip for Windows
# -----------------------------
echo "Packaging zip for Windows..."
rm -rf $ZIP_DIR
mkdir -p $ZIP_DIR/$PACKAGE_NAME

cp -r $BUILD_DIR/* $ZIP_DIR/$PACKAGE_NAME/
cp inputSample.txt $ZIP_DIR/$PACKAGE_NAME/

# launcher batch script
cat > $ZIP_DIR/$PACKAGE_NAME/run.bat <<EOL
@echo off
node index-new.js %*
if %ERRORLEVEL% NEQ 0 (
  echo Node.js >=18 is required. Please install it from https://nodejs.org/
)
EOL

zip -r $ZIP_FILE_NAME $ZIP_DIR/$PACKAGE_NAME
echo "zip package created: $ZIP_FILE_NAME"

# -----------------------------
# 5 Done
# -----------------------------
echo "All packaging complete!"
echo "Artifacts:"
echo " - Linux .deb: $DEB_FILE_NAME"
echo " - Linux/macOS tar.gz: $TAR_FILE_NAME"
echo " - Windows zip: $ZIP_FILE_NAME"
