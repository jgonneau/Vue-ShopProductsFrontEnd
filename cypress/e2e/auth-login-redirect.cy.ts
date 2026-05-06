describe('Auth login redirect flow', () => {
  it('logs in and redirects user to requested protected route', () => {
    cy.intercept('POST', '**/api/user/token/refresh/', {
      statusCode: 401,
      body: { detail: 'No refresh token' },
    }).as('refreshAnonymous')

    cy.intercept('POST', '**/api/user/login/', {
      statusCode: 200,
      body: {
        access: 'vendor-access-token',
        refresh: 'vendor-refresh-token',
      },
    }).as('login')

    cy.intercept('GET', '**/api/user/', {
      statusCode: 200,
      body: {
        id: 'vendor-1',
        email: 'vendor@example.com',
        username: 'vendor',
        role: 'vendor',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    }).as('currentUserAfterLogin')

    cy.visit('/login?redirect=%2Fvendor')
    cy.wait('@refreshAnonymous')

    cy.get('input[type="email"]').type('vendor@example.com')
    cy.get('input[type="password"]').type('secret123')
    cy.contains('button', 'Sign in').click()

    cy.wait('@login')
    cy.wait('@currentUserAfterLogin')
    cy.url().should('include', '/vendor')
    cy.contains('h1', 'Vendor Dashboard').should('be.visible')
  })
})
