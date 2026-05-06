describe('Public catalog pagination', () => {
  it('loads products and moves to next page', () => {
    cy.intercept('GET', '**/api/products/?page=1', {
      statusCode: 200,
      body: {
        count: 3,
        next: 'http://127.0.0.1:8000/api/products/?page=2',
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-1',
            title: 'Alpha Product',
            description: 'Page 1 product',
            price: '10.00',
            in_stock: true,
            store_name: 'Store A',
          },
        ],
      },
    }).as('productsPage1')

    cy.intercept('GET', '**/api/products/?page=2', {
      statusCode: 200,
      body: {
        count: 3,
        next: null,
        previous: 'http://127.0.0.1:8000/api/products/?page=1',
        results: [
          {
            id: 'product-2',
            reference: 'SKU-2',
            title: 'Beta Product',
            description: 'Page 2 product',
            price: '15.00',
            in_stock: false,
            store_name: 'Store B',
          },
        ],
      },
    }).as('productsPage2')

    cy.visit('/products')
    cy.wait('@productsPage1')

    cy.contains('h1', 'Products').should('be.visible')
    cy.contains('Alpha Product').should('be.visible')
    cy.contains('Total products: 3').should('be.visible')

    cy.contains('button', 'Next').click()
    cy.url().should('include', '/products?page=2')
    cy.wait('@productsPage2')
    cy.contains('Beta Product').should('be.visible')
  })

  it('filters products using search input', () => {
    cy.intercept('GET', '**/api/products/?page=1', {
      statusCode: 200,
      body: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-1',
            title: 'Alpha Coffee',
            description: 'Coffee beans',
            price: '10.00',
            in_stock: true,
            store_name: 'Store A',
          },
          {
            id: 'product-2',
            reference: 'SKU-2',
            title: 'Beta Tea',
            description: 'Tea leaves',
            price: '15.00',
            in_stock: true,
            store_name: 'Store B',
          },
        ],
      },
    }).as('productsPage1')

    cy.visit('/products')
    cy.wait('@productsPage1')

    cy.get('input[placeholder="Title, reference, or store..."]').type('coffee')

    cy.contains('Alpha Coffee').should('be.visible')
    cy.contains('Beta Tea').should('not.exist')
  })

  it('navigates stores pagination backwards', () => {
    cy.intercept('GET', '**/api/stores/?page=2', {
      statusCode: 200,
      body: {
        count: 2,
        next: null,
        previous: 'http://127.0.0.1:8000/api/stores/?page=1',
        results: [
          {
            id: 'store-2',
            name: 'Store Two',
            city: 'Lyon',
            country: 'France',
          },
        ],
      },
    }).as('storesPage2')

    cy.intercept('GET', '**/api/stores/?page=1', {
      statusCode: 200,
      body: {
        count: 2,
        next: 'http://127.0.0.1:8000/api/stores/?page=2',
        previous: null,
        results: [
          {
            id: 'store-1',
            name: 'Store One',
            city: 'Paris',
            country: 'France',
          },
        ],
      },
    }).as('storesPage1')

    cy.visit('/stores?page=2')
    cy.wait('@storesPage2')

    cy.contains('Store Two').should('be.visible')
    cy.contains('button', 'Previous').click()
    cy.wait('@storesPage1')
    cy.url().should('include', '/stores?page=1')
    cy.contains('Store One').should('be.visible')
  })
})
