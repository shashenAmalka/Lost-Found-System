const FLOOR_LABELS = {
    1: '1st Floor',
    2: '2nd Floor',
    3: '3rd Floor',
}

const buildFloorList = (start, end) => {
    const floors = []
    for (let floor = start; floor <= end; floor += 1) {
        floors.push(FLOOR_LABELS[floor] || `${floor}th Floor`)
    }
    return floors
}

export const REPORT_LOCATIONS = [
    'New Building',
    'Main Building',
    'Business Faculty Building',
    'Engineering Faculty Building',
    'Bird Nest',
    'Ground',
    'Other',
]

export const LOCATION_SUB_LOCATIONS = {
    'New Building': [
        'Canteen',
        'Library',
        ...buildFloorList(1, 14),
        'Study Area',
    ],
    'Main Building': [
        'PnS',
        ...buildFloorList(1, 9),
        'Study Area',
    ],
    'Business Faculty Building': [
        'Juice Bar',
        ...buildFloorList(1, 6),
        'Study Area',
    ],
    'Engineering Faculty Building': buildFloorList(1, 6),
}

export const composeReportLocation = ({ location, subLocation, otherLocation }) => {
    if (!location) return ''

    if (location === 'Other') {
        return String(otherLocation || '').trim()
    }

    if (subLocation) {
        return `${location} - ${subLocation}`
    }

    return location
}