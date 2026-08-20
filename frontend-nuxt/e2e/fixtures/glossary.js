// Fixture for the glossary page (pages/glossary.vue), served by the GetGlossaryTerms mock.
// Spans several letters and categories (incl. a "#" entry) to exercise grouping, the A-Z
// rail, filtering, and the category select.

export const glossaryTerms = [
  { id: 'g1', term: '1099 Form', definition: 'A tax form reporting certain payments.', categories: ['Reporting'] },
  { id: 'g2', term: 'Abandoned Mine Land (AML) Fee', definition: 'A fee for current-day coal production that funds reclamation of pre-1977 mines.', categories: ['Revenue'] },
  { id: 'g3', term: 'Bonus', definition: 'A one-time payment for the right to explore and develop a lease.', categories: ['Payments'] },
  { id: 'g4', term: 'Kilowatt Hour (kWh)', definition: 'A measure of electrical energy equal to 1,000 watts for one hour.', categories: ['Units and Measurements'] },
  { id: 'g5', term: 'Royalty', definition: 'A share of production value paid to the resource owner.', categories: ['Revenue', 'Payments'] },
]
