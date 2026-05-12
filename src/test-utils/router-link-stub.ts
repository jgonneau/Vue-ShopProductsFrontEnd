/**
 * Minimal RouterLink for unit tests: avoids vue-router injection / useLink
 * when components mount without createRouter().
 */
export const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a><slot /></a>',
}
