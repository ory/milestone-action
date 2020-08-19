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
    milestones(orderBy: {field: CREATED_AT, direction: DESC}, states: [OPEN], first: 8) {
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
            body
            state
            labels(first: 4) {
              nodes {
                id
              }
            }
            body
          }
        }
        pullRequests(first: 100) {
          nodes {
            title
            url
            number
            assignees(first: 10) {
              nodes {
                name
                url
              }
            }
            labels(first: 4) {
              nodes {
                name
                description
              }
            }
          }
        }
      }
    }
  }
}
`

const projects = `
query projects($repo: String!, $owner: String!) {
  repository(name: $repo, owner: $owner) {
    milestones(orderBy: {field: CREATED_AT, direction: DESC}, first: 8) {
      nodes {
        title
        description
        url
        issues(first: 400) {
          nodes {
            url
            title
            body
            state
            labels(first: 4) {
              nodes {
                name
                description
              }
            }
            body
          }
        }
        pullRequests(first: 100) {
          nodes {
            title
            url
            labels(first: 4) {
              nodes {
                name
                description
              }
            }
          }
        }
      }
    }
  }
}
`

module.exports = {projects, project}