describe('Role-based route access matrix', () => {
  const stubSessionForRole = (role: 'customer' | 'vendor' | 'admin') => {
    cy.intercept('POST', '**/api/user/token/refresh/', {
      statusCode: 200,
      body: { access: `${role}-access-token` },
    }).as('refreshTokenSuccess')

    cy.intercept('GET', '**/api/user/', {
      statusCode: 200,
      body: {
        id: `${role}-1`,
        email: `${role}@example.com`,
        username: role,
        role,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    }).as('currentUser')
  }

  const stubVendorDashboardData = () => {
    cy.intercept('GET', '**/api/stores/my/*', {
      statusCode: 200,
      body: { count: 0, next: null, previous: null, results: [] },
    }).as('ownedStores')

    cy.intercept('GET', '**/api/products/my/*', {
      statusCode: 200,
      body: { count: 0, next: null, previous: null, results: [] },
    }).as('ownedProducts')
  }

  const stubAdminDashboardData = () => {
    cy.intercept('GET', '**/api/admin/**', {
      statusCode: 200,
      body: { count: 0, next: null, previous: null, results: [] },
    }).as('adminData')
  }

  it('enforces access rules for customer, vendor, and admin roles', () => {
    stubSessionForRole('customer')
    cy.visit('/vendor')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/profile')

    stubSessionForRole('customer')
    cy.visit('/admin')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/profile')

    stubSessionForRole('vendor')
    cy.visit('/admin')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/profile')

    stubSessionForRole('vendor')
    stubVendorDashboardData()
    cy.visit('/vendor')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/vendor')
    cy.contains('h1', 'Vendor Dashboard').should('be.visible')

    stubSessionForRole('admin')
    stubAdminDashboardData()
    cy.visit('/admin')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/admin')
    cy.contains('h1', 'Admin Operations Console').should('be.visible')

    stubSessionForRole('admin')
    stubVendorDashboardData()
    cy.visit('/vendor')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.url().should('include', '/vendor')
    cy.contains('h1', 'Vendor Dashboard').should('be.visible')
  })
})
