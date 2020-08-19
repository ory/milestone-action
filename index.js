const fs = require('fs')
const github = require('@actions/github')
const core = require('@actions/core')
const queries = require('./queries.js')

const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const token = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN
const octokit = github.getOctokit(token)
const {repo, owner} = github.context.repo
const outputFile = core.getInput('outputFile') || 'MILESTONES.md'

// const repos = core.getInput('repos') || process.env.REPOS
// const onlyIssues = core.getInput('onlyLabels') || []

const renderAssignees = (assignees) => assignees.map(({name, url}) => `[@${name}](${url})`)

const checkbox = (state) => `[${state.toUpperCase() === 'OPEN' ? ' ' : 'x'}]`

const renderIssuesPulls = (label, issues) => issues
  .filter((issue) => issue.labels.nodes.map(({id}) => id).indexOf(label) > -1)
  .map(({title, number, url, assignees: {nodes: assignees}, state}) =>
    `* ${checkbox(state)} ${title} ([${repo}#${number}](${url}))${assignees.length === 0 ? '' : ` - ${renderAssignees(assignees).join(', ')}`}`)

const renderLabels = ({issues, labels, pulls}) => labels.map(({name, description, id, url}) => {
  let markdown = ''

  const markdownIssues = renderIssuesPulls(id, issues)
  if (markdownIssues) {
    markdown = `${markdown}

#### Issues

${markdownIssues.join('\n')}`
  }

  const markdownPulls = renderIssuesPulls(id, pulls)
  if (markdownPulls) {
    markdown = `${markdown}

#### Pull Requests

${markdownPulls.join('\n')}`
  }

  if (markdown) {
    if (description) {
      markdown = `${description}

${markdown}`
    }

    markdown = `### [Label ${ucfirst(name)}](${url})

${markdown}`
  }

  return markdown
})
  // Remove empty elements
  .filter(i => Boolean(i))

const renderMilestones = ({labels, milestones}) => milestones.map(({
  title,
  description,
  url,
  state,
  dueOn,
  issues: {nodes: issues} = {nodes: []},
  pullRequests: {nodes: pulls = []} = {nodes: []}
}) => {
  let markdown = ''

  const markdownLabels = renderLabels({labels, issues, pulls})
  if (markdownLabels) {
    markdown = markdownLabels.join('\n\n')
  }

  if (markdown) {
    if (description) {
      markdown = `${description}

${markdown}`
    }

    markdown = `## [${title}](${url})${dueOn ? ` - ${dueOn}` : ''}

${markdown}`
  }

  return markdown
})
  // Remove empty elements
  .filter(i => Boolean(i))

const renderRepository = async (query) => {
  const result = await query
  const {repository} = result
  const milestones = renderMilestones({
    labels: repository.labels.nodes,
    milestones: repository.milestones.nodes.filter(({name}) => name !== 'unplanned')
  }).join('\n\n')

  return `---
id: milestones
title: Milestones and Roadmap
---

${milestones}`.replace(/\n\s*\n/g, '\n\n')}

renderRepository(octokit.graphql(queries.project, {repo, owner}))
  .then((markdown) => new Promise((resolve, reject) => {
    fs.writeFile(outputFile, markdown, (err) =>
      err ? reject(err) : resolve())
  }))
  .then(() => console.log('Done!'))
  .catch(console.error)
