describe('Home page mobile smoke', () => {
  it('renders primary content on a mobile viewport', () => {
    cy.viewport('iphone-6')

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

    cy.contains('h1', 'Shop Products Frontend').should('be.visible')
    cy.contains('You are currently browsing as a guest.').should('be.visible')
    cy.contains('Featured products').should('be.visible')
    cy.contains('Featured stores').should('be.visible')
  })
})
