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
const { Octokit } = require('@octokit/rest')

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN
    const repository = process.env.GITHUB_REPOSITORY
    const currentBranch = process.env.GITHUB_REF.split('/').pop()
    console.log(process.env.GITHUB_REF)
    console.log(currentBranch)
    const [owner, repo] = repository.split('/')

    const octokit = new Octokit({ auth: token })

    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: 'regression-test-based-on-path',
      per_page: 100
    })
    const changedFilesSet = new Set()

    for (const commit of commits) {
      const { data: comparison } = await octokit.repos.compareCommits({
        owner,
        repo,
        base: 'development',
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
