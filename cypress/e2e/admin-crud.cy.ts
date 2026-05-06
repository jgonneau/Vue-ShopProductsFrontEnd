describe('Admin CRUD workflows', () => {
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
      body: {
        ...emptyPaginated,
        results: [
          {
            id: 'product-1',
            reference: 'PROD-1',
            title: 'Coffee',
            price: '10.00',
            stock_quantity: 5,
            in_stock: true,
            store: 'store-1',
            store_name: 'Store One',
            activated: true,
          },
        ],
      },
    }).as('adminProducts')
    cy.intercept('GET', '**/api/admin/orders/?*', { statusCode: 200, body: emptyPaginated }).as(
      'adminOrders',
    )
    cy.intercept('GET', '**/api/admin/invoices/?page=*', {
      statusCode: 200,
      body: emptyPaginated,
    }).as('adminInvoices')
    cy.intercept('GET', '**/api/admin/logs/?*', { statusCode: 200, body: emptyPaginated }).as(
      'adminLogs',
    )
    cy.intercept('GET', '**/api/admin/logs/stats/', {
      statusCode: 200,
      body: { total: 0, by_severity: [], top_sources: [] },
    }).as('adminLogStats')
  }

  it('supports core admin CRUD operations with success feedback', () => {
    stubAdminSession()
    stubAdminReads()

    cy.intercept('POST', '**/api/admin/user/', {
      statusCode: 201,
      body: { id: 'user-1', email: 'user@example.com' },
    }).as('createAdminUser')
    cy.intercept('POST', '**/api/admin/user/delete/', { statusCode: 200, body: {} }).as(
      'deleteAdminUser',
    )
    cy.intercept('POST', '**/api/admin/stores/', {
      statusCode: 201,
      body: { id: 'store-1', name: 'Store One' },
    }).as('createAdminStore')
    cy.intercept('DELETE', '**/api/admin/stores/store-1/', { statusCode: 204, body: {} }).as(
      'deleteAdminStore',
    )
    cy.intercept('POST', '**/api/admin/products/', {
      statusCode: 201,
      body: { id: 'product-1', title: 'Coffee' },
    }).as('createAdminProduct')
    cy.intercept('PATCH', '**/api/admin/products/product-1/stock/', {
      statusCode: 200,
      body: { id: 'product-1', stock_quantity: 15 },
    }).as('updateProductStock')
    cy.intercept('POST', '**/api/admin/products/product-1/deactivate/', {
      statusCode: 200,
      body: { id: 'product-1', activated: false },
    }).as('deactivateProduct')
    cy.intercept('DELETE', '**/api/admin/products/product-1/', { statusCode: 204, body: {} }).as(
      'deleteAdminProduct',
    )
    cy.intercept('POST', '**/api/admin/orders/', { statusCode: 201, body: { id: 'order-1' } }).as(
      'createAdminOrder',
    )
    cy.intercept('PATCH', '**/api/admin/orders/order-1/status/', {
      statusCode: 200,
      body: { id: 'order-1', status: 'shipped' },
    }).as('updateOrderStatus')
    cy.intercept('DELETE', '**/api/admin/orders/order-1/', { statusCode: 204, body: {} }).as(
      'deleteAdminOrder',
    )
    cy.intercept('POST', '**/api/admin/invoices/', {
      statusCode: 201,
      body: { id: 'invoice-1' },
    }).as('createAdminInvoice')
    cy.intercept('PATCH', '**/api/admin/invoices/invoice-1/status/', {
      statusCode: 200,
      body: { id: 'invoice-1', status: 'paid' },
    }).as('updateInvoiceStatus')
    cy.intercept('DELETE', '**/api/admin/invoices/invoice-1/', { statusCode: 204, body: {} }).as(
      'deleteAdminInvoice',
    )

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

    cy.get('input[type="email"]').first().type(' user@example.com ')
    cy.get('input[type="password"]').first().type('secret123')
    cy.contains('button', 'Create user').click()
    cy.wait('@createAdminUser')
    cy.contains('Admin user created.').should('be.visible')

    cy.contains('label', 'User ID to delete').find('input').type('user-1')
    cy.contains('button', 'Delete user').click()
    cy.wait('@deleteAdminUser')
    cy.contains('User deleted.').should('be.visible')
  })
})
