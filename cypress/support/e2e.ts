beforeEach(() => {
  cy.intercept('POST', '**/api/user/token/refresh/', {
    statusCode: 401,
    body: { detail: 'No refresh token' },
  }).as('refreshToken')
})
