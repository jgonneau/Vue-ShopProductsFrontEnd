describe('Admin logs troubleshooting', () => {
  const emptyPaginated = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }

  const stubAdminSession = () => {
    cy.intercept('POST', '**/api/user/token/refresh/', {
      statusCode: 200,
      body: { access: 'admin-access-token' },
    }).as('refreshTokenSuccess')

    cy.intercept('GET', '**/api/user/', {
      statusCode: 200,
      body: {
        id: 'admin-1',
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    }).as('currentUser')
  }

  const stubAdminReads = () => {
    cy.intercept('GET', '**/api/admin/user/?page=*', { statusCode: 200, body: emptyPaginated }).as(
      'adminUsers',
    )
    cy.intercept('GET', '**/api/admin/stores/?page=*', {
      statusCode: 200,
      body: emptyPaginated,
    }).as('adminStores')
    cy.intercept('GET', '**/api/admin/products/?page=*', {
      statusCode: 200,
      body: emptyPaginated,
    }).as('adminProducts')
    cy.intercept('GET', '**/api/admin/orders/?*', { statusCode: 200, body: emptyPaginated }).as(
      'adminOrders',
    )
    cy.intercept('GET', '**/api/admin/invoices/?page=*', {
      statusCode: 200,
      body: emptyPaginated,
    }).as('adminInvoices')
    cy.intercept('GET', '**/api/admin/logs/?*', {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'log-1',
            severity: 'error',
            source: 'api.admin',
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    }).as('adminLogs')
    cy.intercept('GET', '**/api/admin/logs/stats/', {
      statusCode: 200,
      body: {
        total: 12,
        by_severity: [{ severity: 'error', count: 3 }],
        top_sources: [{ source: 'api.admin', count: 6 }],
      },
    }).as('adminLogStats')
  }

  it('supports logs troubleshooting actions and surfaces API errors', () => {
    stubAdminSession()
    stubAdminReads()

    cy.intercept('POST', '**/api/admin/user/', {
      statusCode: 400,
      body: { detail: 'User already exists.' },
    }).as('createAdminUserFail')

    cy.intercept('POST', '**/api/admin/logs/bulk-delete/', {
      statusCode: 200,
      body: { deleted_count: 2 },
    }).as('bulkDeleteLogs')

    cy.intercept('POST', '**/api/admin/logs/clear-by-severity/', {
      statusCode: 200,
      body: { deleted_count: 1, severity: 'error' },
    }).as('clearLogsBySeverity')

    cy.visit('/admin')
    cy.wait([
      '@refreshTokenSuccess',
      '@currentUser',
      '@adminUsers',
      '@adminStores',
      '@adminProducts',
      '@adminOrders',
      '@adminInvoices',
      '@adminLogs',
      '@adminLogStats',
    ])

    cy.contains('Total logs:').should('be.visible')
    cy.contains('error=3').should('be.visible')
    cy.contains('api.admin').should('be.visible')

    cy.get('input[type="email"]').first().type('existing@example.com')
    cy.get('input[type="password"]').first().type('secret123')
    cy.contains('button', 'Create user').click()
    cy.wait('@createAdminUserFail')
    cy.contains('User already exists.').should('be.visible')

    cy.contains('label', 'Severity filter').find('select').select('error')
    cy.contains('label', 'Source filter').find('input').type('api.admin')
    cy.wait('@adminLogs')

    cy.contains('label', 'Log IDs (comma separated)').find('input').type('log-1, log-2')
    cy.contains('button', 'Bulk delete logs').click()
    cy.wait('@bulkDeleteLogs')
    cy.contains('Logs deleted in bulk.').should('be.visible')

    cy.contains('label', 'Severity to clear').find('select').select('error')
    cy.contains('button', 'Clear by severity').click()
    cy.wait('@clearLogsBySeverity')
    cy.contains('Logs cleared by severity.').should('be.visible')
  })
})
