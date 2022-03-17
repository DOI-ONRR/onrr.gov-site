import slugify from 'slugify'

export const formatToDollarInt = (value) => {
 const fVal = new Intl.NumberFormat('en-US', 
    { style: 'currency', currency: 'USD' }
  ).format(value)

  return fVal
}

export const resolveByStringPath = (path, obj) => {
  return path.split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj)
}

export const groupBy = (data, group) => {
  const groups = {}

  data.map((item) => {
    let itemGroup = ''

    if (Array.isArray(group)) {
      group.forEach((entry) => {
        itemGroup += resolveByStringPath(entry, item) + '_'
      })
      itemGroup = itemGroup.slice(0, -1)
    }
    else {
      itemGroup = resolveByStringPath(group, item)
    }

    const list = groups[itemGroup]

    if (list) {
      list.push(item)
    }
    else {
      groups[itemGroup] = [item]
    }
  })

  return groups
}

export const titleCase = (str) => {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const convertToSlug = (text) => {
  return text 
    .toLowerCase()
    .replace(/ /g, '-') // replaces spaces with underscore 
    .replace(/[^\w-]+/g, '') // removes anything not alphanumeric, underscore, or hypin
}

export const getDay = (date, type) => {
    if(date.length == 10) {
       date+='T00:00:00'
    }
  const d = new Date(date)
  return d.toLocaleString('en-us', { day: type })
}

export const getMonth = (date, type) => {
    console.log('date.length -------> ', date)
    if(date.length == 10) {
       date+='T00:00:00'
    }
  const d = new Date(date)
    return d.toLocaleString('en-us', { month: type , timeZone: 'America/New_York'})
}

export const getFullDate = (date) => {
    if(date.length == 10) {
       date+='T00:00:00'
    }
  const d = new Date(date)
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return d.toLocaleString('en-US', options)
}

export const getYear = (date) => {
    if(date.length == 10) {
       date+='T00:00:00'
    }
  const d = new Date(date)
  return d.toLocaleString('en-us', { year: 'numeric' })
}

export const addParamsToLocation = (params, route) => {
  history.pushState(
    {},
    null,
    route +
      '?' +
      Object.keys(params)
        .map(key => {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
          )
        })
        .join('&')
  )
}

export const formatToSlug = name => {
  return slugify(name, {
    lower: true,
    // eslint-disable-next-line no-useless-escape
    remove: /[$*_+~.()'"!\:@,?]/g
  }).replace('-and-', '-')
}
