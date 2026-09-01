// Fixture for the Renewable energy payments page — a `topic` template page whose
// page_blocks interleave content_blocks with pay_gov_forms + contact_boxes block
// references. Exercises TopicView's block dispatch + the auto "On this page" rail
// (built from the <h2>s in the content).

const content = (id, html) => ({ id, item: { __typename: 'content_blocks', id: `cb-${id}`, block_content_html: html } })
const payForm = (id, title, description, form_number, pay_gov_url) => ({
  id,
  item: { __typename: 'pay_gov_forms', id: `pgf-${id}`, title, description, form_number, pay_gov_url },
})
const contactBox = (id, heading, body) => ({ id, item: { __typename: 'contact_boxes', id: `cbx-${id}`, heading, body } })

export const renewableEnergyPage = {
  __typename: 'pages',
  id: 're-page',
  title: 'Renewable energy payments',
  slug: 'renewable-energy',
  url: '/paying/payment-options/renewable-energy',
  hero_image: null,
  hero_title: null,
  template: 'topic',
  topic_variant: 'sections',
  parent: { title: 'Payment Options', url: '/paying/payment-options' },
  related_content: null,
  meta_title: null,
  meta_description: null,
  sidebar_blocks: [],
  page_blocks: [
    content('intro', '<p>How to make electronic payments for OCS renewable energy leases.</p>'),
    content('bid', '<h2>Bid deposits</h2><p>Before submitting a bid deposit via Pay.gov, give your bank the Agency ID <span class="agency-id">1417000106</span>.</p>'),
    payForm('bid', 'ONRR Renewable Energy Bid Deposit', 'Use this form to submit your renewable energy bid deposit.', 'ONRR Renewable Energy Bid Deposit', 'https://pay.gov/re-bid-deposit'),
    content('bonus', '<h2>Bonus bid balance payments</h2><p>Bonus bid balances are paid via Fedwire.</p><table class="usa-table usa-table--compact usa-table--striped"><tbody><tr><th scope="row">Receiver FI</th><td>021030004</td></tr></tbody></table>'),
    content('first', '<h2>First year&rsquo;s rental payments</h2><p>Give your bank the Agency Identification Number <span class="agency-id">1417000104</span>.</p>'),
    payForm('acq', 'ONRR Acquisition Fees and Renewable Energy Payments', 'Pay BOEM acquisition fees for renewable energy noncompetitive leasing activities.', 'ONRRRenewable Energy', 'https://pay.gov/re-acquisition'),
    payForm('rental', 'ONRR Renewable Energy Initial Rental Payments', "Remit payment for the first year's rental on an OCS renewable energy lease.", 'ONRRRenewEnergyInitialRental', 'https://pay.gov/re-initial-rental'),
    content('contact', '<h2>Contact</h2>'),
    contactBox(
      're',
      'Questions about a renewable energy payment?',
      '<p>Email <a class="usa-link" href="mailto:ONRR-RFMASGL@onrr.gov">ONRR-RFMASGL@onrr.gov</a>, or call:</p><p>Gary Brunette — <a href="tel:3032313420">(303) 231-3420</a></p><p>Tanvir Mojumder — <a href="tel:3032313668">(303) 231-3668</a></p>',
    ),
  ],
}
