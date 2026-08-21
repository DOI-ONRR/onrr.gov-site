// Fixture for the Payment options hub (full-width template built from page_bands):
// an intro content band + two cards bands using the link-title variant (card_variant: 'link').

const band = (over) => ({
  id: over.id,
  heading: null,
  body: null,
  aside: null,
  cta_label: null,
  cta_url: null,
  body_columns: 12,
  background: 'default',
  card_variant: null,
  chart: null,
  steps: [],
  cards: [],
  ...over,
})

const card = (id, title, body, url) => ({ id, title, body, cta_label: null, cta_url: url })

export const paymentOptionsPage = {
  __typename: 'pages',
  id: 'pay-opts-page',
  title: 'Payment options',
  slug: 'payment-options',
  url: '/paying/payment-options',
  hero_image: null,
  hero_title: null,
  template: 'full-width',
  parent: null,
  meta_title: null,
  meta_description: null,
  sidebar_blocks: [],
  page_blocks: [],
  page_bands: [
    band({
      id: 'b-intro',
      body: '<p>Choose how you need to pay. Each option has its own page with the exact steps.</p>',
    }),
    band({
      id: 'b-ways',
      heading: 'Ways to pay',
      body: '<p>The channel your money moves through. Most payors use Pay.gov.</p>',
      card_variant: 'link',
      cards: [
        card('c1', 'Pay.gov', "<p>The U.S. Treasury's free payment portal.</p>", '/paying/payment-options/pay-gov'),
        card('c2', 'Automated Clearing House (ACH)', '<p>Bank-initiated payments in CCD+ format.</p>', '/paying/payment-options/ach'),
      ],
    }),
    band({
      id: 'b-back',
      heading: 'Getting money back',
      card_variant: 'link',
      cards: [
        card('c3', 'Refunds', "<p>Request a refund for an overpayment you can't recoup.</p>", '/paying/payment-options/refunds'),
      ],
    }),
  ],
}
