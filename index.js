// Copyright © 2025 Ory Corp
// SPDX-License-Identifier: Apache-2.0

const fs = require("fs")
const github = require("@actions/github")
const core = require("@actions/core")
const queries = require("./queries.js")
const prettier = require("prettier")
const oryStyleOptions = require("ory-prettier-styles")

const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const token = core.getInput("GITHUB_TOKEN") || process.env.GITHUB_TOKEN
const octokit = github.getOctokit(token)
const { repo, owner } = github.context.repo

const outputFile = core.getInput("outputFile") || "MILESTONES.md"
const labelMilestonePrefix = core
  .getInput("labelMilestonePrefix")
  .toLowerCase()
  .trim()

const orgs = core
  .getInput("orgs")
  .split(",")
  .map((i) => i.toLowerCase().trim())
  .filter((i) => Boolean(i))
let ignoreMilestones = core
  .getInput("ingoreMilestones")
  .split(",")
  .map((i) => i.toLowerCase().trim())
  .filter((i) => Boolean(i))
let onlyLabels = core
  .getInput("onlyLabels")
  .split(",")
  .map((i) => i.toLowerCase().trim())
  .filter((i) => Boolean(i))

if (onlyLabels.length === 0) {
  onlyLabels = [
    "bug",
    "feat",
    "blocking",
    "breaking change",
    "good first issue",
    "docs",
    "ci",
    "rfc",
    "tests",
    "upstream",
    "help wanted",
  ]
}

if (ignoreMilestones.length === 0) {
  ignoreMilestones = ["unplanned"]
}

const renderAssignees = (assignees) =>
  assignees.map(({ name, url }) => `[@${name}](${url})`)

const checkbox = (state) => `[${state.toUpperCase() === "OPEN" ? " " : "x"}]`

const renderIssuesPulls = (label, issues) =>
  issues
    .filter(
      (issue) =>
        issue.labels
          .map(({ name }) => name.toLowerCase())
          .indexOf(label.toLowerCase()) > -1,
    )
    .map(
      ({ title, number, url, assignees, state, repository: { name: repo } }) =>
        `* ${checkbox(state)} ${title} ([${repo}#${number}](${url}))${
          assignees.length === 0
            ? ""
            : ` - ${renderAssignees(assignees).join(", ")}`
        }`,
    )

const renderLabels = ({ issues, labels, pullRequests }) =>
  labels
    .filter(({ name }) => onlyLabels.indexOf(name) > -1)
    .filter(({ name }, index, self) => {
      return self.map(({ name }) => name).indexOf(name) === index
    })
    .map(({ name, description, url }) => {
      let markdown = ""

      const markdownIssues = renderIssuesPulls(name, issues)
      if (markdownIssues.length > 0) {
        markdown = `${markdown}

#### Issues

${markdownIssues.join("\n")}`
      }

      const markdownPulls = renderIssuesPulls(name, pullRequests)
      if (markdownPulls.length > 0) {
        markdown = `${markdown}

#### Pull Requests

${markdownPulls.join("\n")}`
      }

      if (markdown) {
        if (description) {
          markdown = `${description}

${markdown}`
        }

        markdown = `### [${ucfirst(name)}](${url})
      
${markdown}`
      }

      return markdown
    })
    // Remove empty elements
    .filter((i) => Boolean(i))

const renderMilestones = ({ labels, milestones }) =>
  milestones
    .map(({ title, description, url, dueOn, issues, pullRequests }) => {
      let markdown = ""

      const markdownLabels = renderLabels({ labels, issues, pullRequests })
      if (markdownLabels) {
        markdown = markdownLabels.join("\n\n")
      }

      if (markdown) {
        markdown = `## [${title}](${url})${dueOn ? ` - ${dueOn}` : ""}

${description || "*This milestone does not have a description.*"}

${markdown}`
      }

      return markdown
    })
    // Remove empty elements
    .filter((i) => Boolean(i))

const canonicalizeIssues = (issues) => (issues || []).map(canonicalizeIssue)
const canonicalizeIssue = (issue) => ({
  ...issue,
  labels: issue.labels.nodes || [],
  assignees: issue.assignees.nodes || [],
})

const isAllowedMilestone = ({ title }) =>
  ignoreMilestones.indexOf(title.toLowerCase()) === -1

const makeArray = (e) => e || []

const normalizeRepository = (repository) => {
  const labels = makeArray(repository.labels.nodes)
  const milestones = makeArray(repository.milestones.nodes)
    .filter(isAllowedMilestone)
    .map((milestone) => ({
      ...milestone,
      issues: canonicalizeIssues(milestone.issues.nodes),
      pullRequests: canonicalizeIssues(milestone.pullRequests.nodes),
    }))

  return {
    labels,
    milestones,
  }
}

const renderRepository = async ({ owner, repo }) => {
  const repository = await fetchRepo(`${owner}/${repo}`)
  const markdownMilestones = renderMilestones(repository).join("\n\n")

  return `---
id: milestones
title: Milestones and Roadmap
---

${markdownMilestones}`.replace(/\n\s*\n/g, "\n\n")
}

const nameLabel = (name) => `${labelMilestonePrefix}${name}`.toLowerCase()
const milestoneLabels = ({ milestones }) =>
  milestones
    .filter(isAllowedMilestone)
    .map(({ title }) => `${labelMilestonePrefix}${title}`.toLowerCase())

const fetchRepo = async (name) => {
  const [owner, repo] = name.split("/")
  const { repository } = await octokit.graphql(queries.project, { repo, owner })
  return normalizeRepository(repository)
}

const renderRepositories = async (orgs) => {
  const meta = await fetchRepo(`${owner}/${repo}`)
  const onlyLabels = milestoneLabels(meta)

  const tasks = onlyLabels
    .map((label) => orgs.map((org) => ({ org, label })))
    .reduce((prev, next) => [...prev, ...next], [])
    .map(
      async ({ org, label }) =>
        await octokit.graphql(queries.findIssuesPulls, {
          search: `label:${label} user:${org}`,
        }),
    )

  const results = (await Promise.all(tasks))
    .reduce((items, { search: { edges } }) => [...items, ...edges], [])
    .map(({ node }) => canonicalizeIssue(node))
    .reduce(
      ({ labels, issues, pullRequests }, node) => {
        return {
          issues:
            node.url.indexOf("/issues/") > -1 ? [...issues, node] : issues,
          pullRequests:
            node.url.indexOf("/pull/") > -1
              ? [...pullRequests, node]
              : pullRequests,
          labels: [...labels, ...node.labels],
        }
      },
      { labels: [], issues: [], pullRequests: [] },
    )

  const filterIssue =
    ({ title }) =>
    ({ labels }) => {
      const labelNames = labels.map(({ name }) => name.toLowerCase())
      return labelNames.indexOf(nameLabel(title)) > -1
    }

  const document = {
    ...meta,
    labels: [...meta.labels, ...results.labels],
    milestones: meta.milestones.map((milestone) => ({
      ...milestone,
      issues: [
        ...milestone.issues,
        ...results.issues.filter(filterIssue(milestone)),
      ],
      pullRequests: [
        ...milestone.pullRequests,
        ...results.pullRequests.filter(filterIssue(milestone)),
      ],
    })),
  }

  const markdownMilestones = renderMilestones(document).join("\n\n")

  return `---
id: milestones
title: Milestones and Roadmap
---

${markdownMilestones}`.replace(/\n\s*\n/g, "\n\n")
}

const writeMarkdown = (markdown) =>
  new Promise((resolve, reject) => {
    fs.writeFile(outputFile, formatMarkdown(markdown), (err) =>
      err ? reject(err) : resolve(),
    )
  })

const formatMarkdown = (markdown) =>
  prettier.format(markdown, { ...oryStyleOptions, parser: "markdown" })

if (orgs.length > 0) {
  renderRepositories(orgs).then(writeMarkdown).catch(console.error)
  return
}

renderRepository({ repo, owner }).then(writeMarkdown).catch(console.error)
