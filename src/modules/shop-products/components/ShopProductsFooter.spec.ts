import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ShopProductsFooter from './ShopProductsFooter.vue'

describe('ShopProductsFooter', () => {
  it('renders footer with current year', () => {
    render(ShopProductsFooter)

    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeVisible()
  })
})
