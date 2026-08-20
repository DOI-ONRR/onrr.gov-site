// Fixtures for the events page (pages/events.vue), served by the GetEvents mock.
// GetEvents returns a single `events` list; the page groups it client-side by
// event_category (reporter_training / indian_outreach / other).

function futureDate(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

function formatLongDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Outreach event 1: single day, 30 days out. Event 2: multi-day (60–61 days out).
const outreach1Date = futureDate(30)
const outreach2StartDate = futureDate(60)
const outreach2EndDate = futureDate(61)

export const outreach2StartFormatted = formatLongDate(outreach2StartDate)
export const outreach2EndFormatted = formatLongDate(outreach2EndDate)

const typename = { __typename: 'events' }

const training = {
  ...typename,
  id: 't1',
  title: 'In-Person Reporter Training, Denver',
  description: '<p>ONRR is bringing back in-person Reporter Training sessions in Denver.</p>',
  location: 'Sheraton Denver West Hotel, Lakewood, CO 80228',
  other_information: null,
  contact: 'Please address any questions to Reporter.Training@onrr.gov.',
  event_start_date: toDateString(futureDate(20)),
  event_end_date: toDateString(futureDate(23)),
  time: null,
  who_should_attend: null,
  email: 'Reporter.Training@onrr.gov',
  is_training: true,
  event_category: 'reporter_training',
  registration: [
    { label: 'Oil and Gas Registration', href: 'https://forms.example.gov/oil-gas', note: 'Oil and gas sessions' },
    { label: 'Solid Minerals Registration', href: 'https://forms.example.gov/solid-minerals', note: 'Solid minerals sessions' },
  ],
}

const outreach1 = {
  ...typename,
  id: 'o1',
  title: 'Indian Hills Pow Wow',
  description: '<p>The ONRR OKC outreach office will have a booth for Indian trust mineral owners.</p>',
  location: 'Oklahoma City, OK 73151',
  other_information: '<p>More at <a href="https://example.com/booklet">the outreach booklet</a>.</p>',
  contact: 'ONRR OKC Outreach Office, Toll Free (800) 354-7015.',
  event_start_date: toDateString(outreach1Date),
  event_end_date: toDateString(outreach1Date),
  time: 'Friday 6:00 pm – 8:00 pm CT',
  who_should_attend: 'Indian trust mineral owners in Oklahoma or surrounding states.',
  email: 'onrroutreachokc@onrr.gov',
  is_training: false,
  event_category: 'indian_outreach',
  registration: null,
}

const outreach2 = {
  ...typename,
  id: 'o2',
  title: 'Eastern Navajo Fair',
  description: '<p>The Farmington ONRR office will attend a booth to answer questions.</p>',
  location: 'Crownpoint, NM 87313',
  other_information: null,
  contact: 'Jennifer Benally, (505) 350-2983',
  event_start_date: toDateString(outreach2StartDate),
  event_end_date: toDateString(outreach2EndDate),
  time: '10:30 am – 3:30 pm MT daily',
  who_should_attend: 'IIM account holders and Indian mineral owners in the Navajo Agency area.',
  email: 'jennifer.benally@onrr.gov',
  is_training: false,
  event_category: 'indian_outreach',
  registration: null,
}

const other1 = {
  ...typename,
  id: 'x1',
  title: 'ONRR Public Comment Session',
  description: '<p>An open session on proposed reporting updates.</p>',
  location: 'Virtual (Microsoft Teams)',
  other_information: null,
  contact: 'ONRR Public Affairs',
  event_start_date: toDateString(futureDate(45)),
  event_end_date: toDateString(futureDate(45)),
  time: '2:00 pm – 4:00 pm ET',
  who_should_attend: 'All interested members of the public.',
  email: 'publicaffairs@onrr.gov',
  is_training: false,
  event_category: 'other',
  registration: null,
}

// Full set: one training, two outreach, one other.
export const withEvents = {
  events: [training, outreach1, outreach2, other1],
}

// No events at all.
export const noEvents = {
  events: [],
}

// Outreach only — no training (rail hides the training entry) and no "other"
// (that section shows its empty state).
export const outreachOnly = {
  events: [outreach1, outreach2],
}
