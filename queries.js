const project = `
query project($repo: String!, $owner: String!) {
  repository(name: $repo, owner: $owner) {
    url
    labels(first: 100) {
      nodes{
        id
        name
        description
        url
      }
    }
    milestones(orderBy: {field: CREATED_AT, direction: DESC}, states: [OPEN, CLOSED], first: 8) {
      nodes {
        title
        state
        dueOn
        description
        url
        issues(first: 400) {
          nodes {
            assignees(first: 10) {
              nodes {
                name
                url
              }
            }
            url
            number
            title
            state
            repository {
              name
            }
            labels(first: 4) {
              nodes {
                id
                name
                description
                url
              }
            }
          }
        }
        pullRequests(first: 100) {
          nodes {
            title
            url
            number
            state
            repository {
              name
            }
            assignees(first: 10) {
              nodes {
                name
                url
              }
            }
            labels(first: 4) {
              nodes {
                id
                name
                description
                url
              }
            }
          }
        }
      }
    }
  }
}
`

// { "query":"user:ory label:corp/m2"}
const findIssuesPulls = `
query findIssuesPulls($search: String!) {
  search(query: $search, type: ISSUE, first: 100) {
    issueCount
    edges {
      node {
        ... on PullRequest {
          id
          title
          url
          number
          state
          repository {
            name
          }
          assignees(first: 10) {
            nodes {
              name
              url
            }
          }
          labels(first: 4) {
            nodes {
              id
              name
              description
              url
            }
          }
        }
        ... on Issue {
          id
          title
          url
          number
          state
          repository {
            name
          }
          assignees(first: 10) {
            nodes {
              name
              url
            }
          }
          labels(first: 4) {
            nodes {
              id
              name
              description
              url
            }
          }
        }
      }
    }
  }
}
`

module.exports = { project, findIssuesPulls }
