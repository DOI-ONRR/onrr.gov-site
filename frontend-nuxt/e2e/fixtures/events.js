function futureDate(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

function formatLongDate(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// Event 1: 7 days from now (single day)
const event1Date = futureDate(7)
// Event 2: 30 days from now (multi-day, 2 days)
const event2StartDate = futureDate(30)
const event2EndDate = futureDate(31)
// Event 3: 60 days from now (single day)
const event3Date = futureDate(60)

export const event1DateFormatted = formatLongDate(event1Date)
export const event2StartDateFormatted = formatLongDate(event2StartDate)
export const event2EndDateFormatted = formatLongDate(event2EndDate)

const eventTypename = { __typename: 'events' }

export const withEvents = {
  data: {
    outreach_events: [
      {
        ...eventTypename,
        id: '1',
        title: 'Indian Minerals Training',
        description: '<p>Training session on Indian mineral lease management and reporting requirements.</p>',
        location: 'Tulsa, OK',
        other_information: '<p>Lunch will be provided. Please bring your laptop.</p>',
        contact: 'John Smith',
        event_start_date: toDateString(event1Date),
        event_end_date: toDateString(event1Date),
        time: '1:00 p.m. - 5:00 p.m. CT',
        who_should_attend: 'Tribal representatives and Indian mineral owners',
        email: 'john.smith@onrr.gov',
        is_training: false,
      },
      {
        ...eventTypename,
        id: '2',
        title: 'Outreach Meeting - Navajo Nation',
        description: 'Quarterly outreach meeting with Navajo Nation representatives.',
        location: 'Window Rock, AZ',
        other_information: null,
        contact: 'Jane Doe',
        event_start_date: toDateString(event2StartDate),
        event_end_date: toDateString(event2EndDate),
        time: '9:00 a.m. - 4:00 p.m. MT daily',
        who_should_attend: 'Navajo Nation officials and ONRR staff',
        email: 'jane.doe@onrr.gov',
        is_training: false,
      },
    ],
    other_events: [
      {
        ...eventTypename,
        id: '3',
        title: 'ONRR Reporter Training',
        description: '<p>Annual reporter training covering valuation and reporting updates.</p>',
        location: 'Virtual (Microsoft Teams)',
        other_information: '<p>Registration required. Visit <a href="https://example.com/register">the registration page</a> for details.</p>',
        contact: 'Bob Johnson',
        event_start_date: toDateString(event3Date),
        event_end_date: toDateString(event3Date),
        time: '2:00 p.m. - 4:00 p.m. ET',
        who_should_attend: 'All reporters',
        email: 'bob.johnson@onrr.gov',
        is_training: true,
      },
    ],
  },
}

export const noEvents = {
  data: {
    outreach_events: [],
    other_events: [],
  },
}

export const outreachOnly = {
  data: {
    outreach_events: [
      {
        ...eventTypename,
        id: '1',
        title: 'Indian Minerals Training',
        description: '<p>Training session on Indian mineral lease management.</p>',
        location: 'Tulsa, OK',
        other_information: null,
        contact: 'John Smith',
        event_start_date: toDateString(event1Date),
        event_end_date: toDateString(event1Date),
        time: '1:00 p.m. - 5:00 p.m. CT',
        who_should_attend: 'Tribal representatives',
        email: 'john.smith@onrr.gov',
        is_training: false,
      },
    ],
    other_events: [],
  },
}
