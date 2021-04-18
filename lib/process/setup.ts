import * as childProcess from 'child_process';
import * as fs from 'fs-extra';

export const NODE_LAMBDA_LAYER_DIR = `${process.cwd()}/bundle`;
export const NODE_LAMBDA_LAYER_RUNTIME_DIR_NAME = `nodejs`;

const getModulesInstallDirName = (): string =>
  `${NODE_LAMBDA_LAYER_DIR}/${NODE_LAMBDA_LAYER_RUNTIME_DIR_NAME}`;

const copyPackageJson = () => {
  // copy package.json and package.lock.json
  fs.mkdirsSync(getModulesInstallDirName());
  ['package.json', 'yarn.lock'].map((file) =>
    fs.copyFileSync(
      `${process.cwd()}/${file}`,
      `${getModulesInstallDirName()}/${file}`,
    ),
  );
};

const bundleNpm = (): void => {
  // create bundle directory
  copyPackageJson();

  // install package.json (production)
  childProcess.execSync(
    `yarn --cwd ${getModulesInstallDirName()} install --production`,
    {
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env },
      shell: 'bash',
    },
  );
};

export default bundleNpm;
