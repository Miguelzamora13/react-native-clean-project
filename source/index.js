#!/usr/bin/env node
const options = require('./internals/options');
const { executeTask } = require('./internals/executor');
const { tasks } = require('./internals/tasks');

options
  .askiOS()
  .then(options.askiOSPods)
  .then(options.askSystemPodsCache)
  .then(options.askUserPodsCache)
  .then(options.askUpdatePods)
  .then(options.askAndroid)
  .then(options.askAndroidCleanProject)
  .then(options.askNodeModules)
  .then(options.askBrew)
  .then(() => {
    options.rlInterface.close();
    if (options.getWipeiOSBuild()) {
      executeTask(tasks.wipeiOSBuildFolder);
    }
    if (options.getWipeiOSPods()) {
      executeTask(tasks.wipeiOSPodsFolder);
    }
    if (options.getWipeSystemPodsCache()) {
      executeTask(tasks.wipeSystemPodsCache);
    }
    if (options.getWipeUserPodsCache()) {
      executeTask(tasks.wipeUserPodsCache);
    }
    if (options.getWipeAndroidBuild()) {
      executeTask(tasks.wipeAndroidBuildFolder);
    }
    if (options.getCleanAndroidProject()) {
      executeTask(tasks.cleanAndroidProject);
    }
    executeTask(tasks.watchmanCacheClear);
    executeTask(tasks.wipeTempCaches);
    if (options.getUpdateBrew()) {
      executeTask(tasks.brewUpdate)
        .then(code => {
          if (code === 0) {
            executeTask(tasks.brewUpgrade);
          }
        })
        .catch(() => {
          console.log(
            "❌ Skipping task 'brew upgrade' because there was an error with 'brew update'"
          );
        });
    }
    if (options.getWipeNodeModules()) {
      executeTask(tasks.wipeNodeModules)
        .then(() => executeTask(tasks.yarnCacheClean))
        .then(() => executeTask(tasks.npmCacheVerify))
        .then(() => executeTask(tasks.npmInstall))
        .then(() => executeTask(tasks.yarnInstall))
        .then(() => options.getUpdatePods() && executeTask(tasks.updatePods))
        .catch(() => {
          console.log(
            '❌  Examine output - error in either yarn cache clean, yarn install, or pod update'
          );
        });
    }
  });
