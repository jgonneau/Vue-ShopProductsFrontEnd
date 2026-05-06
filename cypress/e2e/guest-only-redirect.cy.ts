describe('Guest-only route redirects', () => {
  const stubAuthenticatedSession = () => {
    cy.intercept('POST', '**/api/user/token/refresh/', {
      statusCode: 200,
      body: { access: 'customer-access-token' },
    }).as('refreshTokenSuccess')

    cy.intercept('GET', '**/api/user/', {
      statusCode: 200,
      body: {
        id: 'customer-1',
        email: 'customer@example.com',
        username: 'customer',
        role: 'customer',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    }).as('currentUser')
  }

  it('redirects authenticated user away from /login to /profile', () => {
    stubAuthenticatedSession()

    cy.visit('/login')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')

    cy.url().should('include', '/profile')
    cy.contains('h1', 'My Profile').should('be.visible')
  })

  it('redirects authenticated user away from /register to /profile', () => {
    stubAuthenticatedSession()

    cy.visit('/register')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')

    cy.url().should('include', '/profile')
    cy.contains('h1', 'My Profile').should('be.visible')
  })
})
