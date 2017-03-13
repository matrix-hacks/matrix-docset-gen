const fs = require('fs');
const path = require('path');
const { cd, mv, exec } = require('shelljs');
const icon = path.join(__dirname, 'icon.png');

module.exports.PROJECTS = {
  'matrix-js-sdk': {
    src: 'lib',
    gitUrl: 'https://github.com/matrix-org/matrix-js-sdk',
    defaultBranch: "develop",
    docset: { icon, name: 'MatrixJSSDK' }
  },
  'matrix-appservice-bridge': {
    src: 'lib',
    gitUrl: 'https://github.com/matrix-org/matrix-appservice-bridge',
    defaultBranch: "develop",
    docset: { icon, name: 'MatrixAppserviceBridge' }
  },
  'matrix-appservice-node': {
    src: 'lib',
    gitUrl: 'https://github.com/matrix-org/matrix-appservice-node',
    defaultBranch: "master",
    docset: { icon, name: 'MatrixAppserviceNode' }
  },
  /* Looks like I didn't write code correctly for docset...
   * Need to learn how to write JSDocs properly. Disable it for now.
   *
   * 'matrix-puppet-bridge': {
   *   src: 'src',
   *   gitUrl: 'https://github.com/matrix-hacks/matrix-puppet-bridge',
   *   defaultBranch: "master",
   *   docset: { icon, name: 'MatrixPuppetBridge' }
   * }
   */
  /*
   * The docset of this one seems quite bad, maybe due to all
   * the transpilation or something... Just disable it.
   *
   *'matrix-react-sdk': {
   *  gitUrl: 'https://github.com/matrix-org/matrix-react-sdk',
   *  defaultBranch: "develop",
   *  docset: { icon, name: 'MatrixReactSDK' }
   *},
   */
}

module.exports.gen = function gen(project, forceBranch) {
  const { gitUrl, docset } = project;
  const basename = path.basename(gitUrl);
  const branch = forceBranch || project.defaultBranch || "master";
  const dir = path.resolve(path.join(__dirname, 'projects', basename));
  const dest = path.resolve(path.join(__dirname, 'docsets', basename));
  const tmpl = path.resolve(path.join(__dirname, 'node_modules', 'jsdoc-dash-template'));
  const yarn = path.resolve(path.join(__dirname, 'node_modules', '.bin', 'yarn'));
  const jsdoc = path.resolve(path.join(__dirname, 'node_modules', '.bin', 'jsdoc'));
  const cfg = path.join(dir, 'docset-config.json');

  if (fs.existsSync(dir)){
    cd(dir);
    exec(`git reset --hard`);
    exec(`git checkout ${branch}`);
    exec(`git pull origin ${branch}`);
  } else {
    exec(`git clone ${gitUrl} ${dir}`);
    cd(dir);
    exec(`git checkout ${branch}`);
  }

  exec(yarn);
  fs.writeFileSync(cfg, JSON.stringify({ docset }));
  exec(`${jsdoc} -c ${cfg} -r ${project.src} -P package.json -R README.md -d ${dest} -t ${tmpl}`);

  const { name, version } = require(path.join(dir, 'package'));
  const setroot = path.join(dest, `${docset.name}.docset`);
  const docroot = path.join(setroot, 'Contents', 'Resources', 'Documents');
  const entries = path.join(docroot, name, version, '*');
  mv(entries, docroot);
}
