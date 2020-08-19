export const project = `
query project($repo: String!, $owner: String!) {
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

export const projects = `
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
