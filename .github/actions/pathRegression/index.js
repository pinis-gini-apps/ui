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
    // const repo = process.env.GITHUB_REPOSITORY
    const path = process.env.GITHUB_EVENT_PATH
    console.log('path:-----')
    console.log(path)

    console.log('token:-----')
    console.log(token)
    console.log('repo:-----')
    const [owner, repo] = repo.split('/')

    const octokit = new Octokit({ auth: token })

    const eventPayload = require(process.env.GITHUB_EVENT_PATH)
    // const owner = eventPayload.repository.owner.login;

    console.log('eventPayload:-----')
    console.log(eventPayload)
    const commitSHA = eventPayload.head_commit.id
    console.log('commitSHA:-----')
    console.log(commitSHA)
    // console.log('------github_token----------')
    // console.log(core.getInput('github_token', { required: true }))
    // console.log('------github_token----------')

    console.log('------eventPayload.repository.owner.login----------')
    console.log(eventPayload.repository.owner.login)
    console.log('------eventPayload.repository.owner.login----------')

    console.log('---------eventPayload.repository.name----------')
    console.log(eventPayload?.repository?.name)
    console.log('---------eventPayload.repository.name----------')

    console.log('------------------------')
    console.log(owner)
    console.log('-')
    console.log(repo)
    console.log('-')
    console.log(eventPayload.before)
    console.log('-')
    console.log(commitSHA)
    console.log('------------------------')
    const { data: changedFiles } = await octokit.repos.compareCommits({
      owner,
      repo,
      base: eventPayload.before,
      head: commitSHA
    })

    const filePaths = changedFiles.files.map(file => file.filename)

    core.setOutput('changed_files', filePaths.join('\n'))
    console.log('Changed files:', filePaths)
  } catch (error) {
    console.log(error)
    core.setFailed(`Error: ${error.message}`)
  }
}

run().then()
