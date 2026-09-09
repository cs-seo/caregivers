export function profileMoreNotice(pluralName: string, cityName: string) {
  return `Need a different carer? Browse verified ${pluralName.toLowerCase()} in ${cityName}.`;
}

export function profileMoreLink(args: {
  specialty: string;
  state: string;
  city: string;
  specialtyPlural: string;
  cityName: string;
}) {
  return {
    href: `/caregivers/${args.specialty}/${args.state}/${args.city}`,
    label: `Browse ${args.specialtyPlural.toLowerCase()} in ${args.cityName}`,
  };
}
