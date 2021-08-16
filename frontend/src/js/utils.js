// Opting to go with Internationalization API
// import currencyFormatter from 'currency-formatter'

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