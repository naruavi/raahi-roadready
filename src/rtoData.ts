export type RtoCentre = {
  name: string
  address: string
  distance: string
  hours: string
  nextSlot: string
  crowd: string
  accessible: boolean
  services: string[]
  mapUrl: string
  directionsUrl: string
}

const createMapUrls = (latitude: number, longitude: number) => ({
  mapUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.008}%2C${longitude + 0.01}%2C${latitude + 0.008}&layer=mapnik&marker=${latitude}%2C${longitude}`,
  directionsUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`,
})

export const rtoCentres: RtoCentre[] = [
  {
    name: 'RTO Dwarka, Sector 10',
    address: 'Sector 10, Dwarka, New Delhi 110075',
    distance: '2.4 km away',
    hours: '8:30 AM – 4:30 PM',
    nextSlot: '14 Sep · 09:30 AM',
    crowd: 'Usually quieter before 11 AM',
    accessible: true,
    services: ['Driving licence renewal', 'Driving test', 'Address change'],
    ...createMapUrls(28.5818, 77.0576),
  },
  {
    name: 'RTO Janakpuri, District Centre',
    address: 'District Centre, Janakpuri, New Delhi 110058',
    distance: '5.8 km away',
    hours: '9:00 AM – 5:00 PM',
    nextSlot: '15 Sep · 11:00 AM',
    crowd: 'Moderate wait expected',
    accessible: true,
    services: ['Driving licence renewal', 'Duplicate licence', 'Driving test'],
    ...createMapUrls(28.6219, 77.0878),
  },
  {
    name: 'RTO Vasant Vihar',
    address: 'Vasant Vihar, New Delhi 110057',
    distance: '8.1 km away',
    hours: '8:30 AM – 4:30 PM',
    nextSlot: '16 Sep · 10:15 AM',
    crowd: 'Usually quieter after 2 PM',
    accessible: false,
    services: ['Driving licence renewal', 'Vehicle transfer', 'Address change'],
    ...createMapUrls(28.5603, 77.16),
  },
]

export const getRtoCentre = (name: string) =>
  rtoCentres.find((centre) => centre.name === name) ?? rtoCentres[0]
