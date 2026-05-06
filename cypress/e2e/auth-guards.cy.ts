describe('Auth guards', () => {
  it('redirects anonymous users from vendor route to login', () => {
    cy.visit('/vendor')

    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=%2Fvendor')
    cy.contains('h1', 'Login').should('be.visible')
  })

  it('redirects anonymous users from admin route to login', () => {
    cy.visit('/admin')

    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=%2Fadmin')
    cy.contains('h1', 'Login').should('be.visible')
  })

  it('redirects anonymous users from customer orders route to login', () => {
    cy.visit('/account/orders')

    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=%2Faccount%2Forders')
    cy.contains('h1', 'Login').should('be.visible')
  })
})
