describe('Home navigation', () => {
  it('shows guest navigation links and supports primary navigation', () => {
    cy.intercept('GET', '**/api/schema/', {
      statusCode: 200,
      body: {
        openapi: '3.1.0',
        info: { title: 'Shop API', version: '1.0.0' },
      },
    }).as('schema')

    cy.intercept('GET', '**/api/products/?page=1', {
      statusCode: 200,
      body: { count: 0, next: null, previous: null, results: [] },
    }).as('products')

    cy.intercept('GET', '**/api/stores/?page=1', {
      statusCode: 200,
      body: { count: 0, next: null, previous: null, results: [] },
    }).as('stores')

    cy.visit('/')
    cy.wait(['@schema', '@products', '@stores'])

    cy.contains('a', 'Products').click()
    cy.url().should('include', '/products')

    cy.go('back')
    cy.contains('a', 'Stores').click()
    cy.url().should('include', '/stores')

    cy.go('back')
    cy.contains('a', 'Login').click()
    cy.url().should('include', '/login')
  })
})
