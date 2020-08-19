const github = require('@actions/github')
const core = require('@actions/core')
const queries = require('./queries.js')

const token = core.getInput('GITHUB_TOKEN')
const octokit = github.getOctokit(token)
const {repo, owner} = github.context.repo
const repos = core.getInput('repos')
const onlyIssues = core.getInput('onlyIssues')

const render = (result) => {
    console.log(JSON.stringify(result, null, 2))
    console.log(result.data.repository)
}

if (repos.length > 0) {

} else {
    render(await octokit.graphql(queries.project, {repo, owner}))
}