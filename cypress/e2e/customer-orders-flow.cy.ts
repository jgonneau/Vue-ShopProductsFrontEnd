describe('Customer order flow', () => {
  const stubAuthenticatedCustomer = () => {
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

  it('creates an order and shows it in history', () => {
    stubAuthenticatedCustomer()

    cy.intercept('GET', '**/api/stores/*', {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 'store-1', name: 'Main Store' }],
      },
    }).as('stores')

    cy.intercept('GET', '**/api/products/store/store-1/*', {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 'product-1', name: 'Arabica Beans' }],
      },
    }).as('storeProducts')

    cy.intercept('GET', '**/api/orders/*', {
      statusCode: 200,
      body: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
    }).as('initialOrders')

    cy.intercept('POST', '**/api/orders/', (req) => {
      expect(req.body).to.deep.equal({
        store: 'store-1',
        product_ids: ['product-1'],
        reference: 'order-ref-1',
      })
      req.reply({
        statusCode: 201,
        body: {
          id: 'order-1',
          reference: 'order-ref-1',
          status: 'pending',
        },
      })
    }).as('createOrder')

    cy.intercept('GET', '**/api/orders/*', {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'order-1',
            reference: 'order-ref-1',
            status: 'pending',
          },
        ],
      },
    }).as('updatedOrders')

    cy.visit('/account/orders')
    cy.wait('@refreshTokenSuccess')
    cy.wait('@currentUser')
    cy.wait('@stores')
    cy.wait('@initialOrders')

    cy.get('input[name="reference"]').type('order-ref-1')
    cy.get('select[name="store"]').select('store-1')
    cy.wait('@storeProducts')
    cy.get('select[name="products"]').select(['product-1'])
    cy.contains('button', 'Create order').click()

    cy.wait('@createOrder')
    cy.wait('@updatedOrders')
    cy.contains('Order created successfully.').should('be.visible')
    cy.contains('order-ref-1').should('be.visible')
  })
})
