/*
Copyright 2019 Iguazio Systems Ltd.

Licensed under the Apache License, Version 2.0 (the "License") with
an addition restriction as set forth herein. You may not use this
file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.

In addition, you may not use the software for any purposes that are
illegal under applicable law, and the grant of the foregoing license
under the Apache 2.0 license is conditioned upon your compliance with
such restriction.
*/
const core = require('@actions/core')
const { exec } = require('child_process')
const { Octokit } = require('@octokit/rest')

const envVariables = {
  TEST_PATH: 'my test path'
}
const execute = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        reject(error)
      }
      resolve(stdout)
    })
  })
}

const run = async () => {
  try {
    exec(
      'npm run path-test',
      { env: { ...process.env, ...envVariables } },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`)
          return
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      }
    )

    const appJsPath = await execute('npm run path-test')
    console.log(appJsPath)

    const currentBranch = process.env.GITHUB_REF.split('/').pop()
    const token = process.env.GITHUB_TOKEN
    const repository = process.env.GITHUB_REPOSITORY
    const [owner, repo] = repository.split('/')

    const targetBranch = process.env.GITHUB_BASE_REF || 'development'
    const octokit = new Octokit({ auth: token })

    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: currentBranch,
      per_page: 100
    })
    const changedFilesSet = new Set()

    for (const commit of commits) {
      const { data: comparison } = await octokit.repos.compareCommits({
        owner,
        repo,
        base: targetBranch,
        head: commit.sha
      })

      comparison.files.forEach(file => {
        changedFilesSet.add(file.filename)
      })
    }

    const changedFiles = Array.from(changedFilesSet)
    console.log('Changed files in current branch:', changedFiles)
  } catch (error) {
    console.log(error)
    core.setFailed(`Error: ${error.message}`)
  }
}

run().then()
