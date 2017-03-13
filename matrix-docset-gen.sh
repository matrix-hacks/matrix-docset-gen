set -e
DEST_DIR=$PWD
CLONE_URL=$2
PROJECT_DIR=$1
if 
if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  echo "pass a nodejs project dir in"
  exit 1
fi
pushd $PROJECT_DIR
NAME=`jq -r '.name' package.json`
DEST="$DEST_DIR/docsets/$NAME"
TMPL="node_modules/jsdoc-dash-template"
if [[ ! -d $TMPL ]]; then
  yarn add jsdoc-dash-template
fi
echo "generating $DEST"
npm run build
jsdoc -r lib -P package.json -R README.md -d $DEST -t $TMPL --pedantic
popd
