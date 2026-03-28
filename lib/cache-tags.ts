export const CacheTag = {
  events: "events",
  event: (id: string) => `event-${id}`,
  eventAttendees: (id: string) => `event-attendees-${id}`,

  churches: "churches",
  church: (id: string) => `church-${id}`,
  churchOrganisers: (id: string) => `church-organisers-${id}`,
  churchSeries: (id: string) => `church-series-${id}`,

  series: "series",
  seriesItem: (id: string) => `series-${id}`,

  userChurches: (id: string) => `user-churches-${id}`,
  userEvents: (id: string) => `user-events-${id}`,
  userSeries: (id: string) => `user-series-${id}`,
} as const;
