import { z } from 'zod';

const nullablePollutant = z.number().min(0).max(50000).nullable();

export const assistantRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, 'Please enter a question of at least 3 characters.')
    .max(500, 'Question must be 500 characters or fewer.'),
  profile: z.object({
    familySize: z.number().int().min(1).max(20),
    ageCategories: z
      .array(z.enum(['children', 'adults', 'elderly', 'sensitive']))
      .min(1, 'Select at least one household age/sensitivity group.')
      .max(4),
    outdoorActivities: z.string().trim().max(200),
    commuteType: z.enum(['car', 'public_transit', 'walking_cycling', 'mixed', 'remote']),
    hasHepaPurifier: z.boolean(),
    hasOutdoorJob: z.boolean(),
    preferredLanguage: z.string().trim().min(2).max(40),
  }),
  airQuality: z.object({
    locationName: z.string().trim().min(1).max(120),
    aqi: z.number().min(0).max(500).nullable(),
    category: z.enum([
      'Good',
      'Moderate',
      'Unhealthy for Sensitive Groups',
      'Unhealthy',
      'Very Unhealthy',
      'Hazardous',
      'Unavailable',
    ]),
    pollutants: z.object({
      pm25: nullablePollutant,
      pm10: nullablePollutant,
      ozone: nullablePollutant,
      no2: nullablePollutant,
      co: nullablePollutant,
    }),
    isDemoData: z.boolean(),
  }),
});

export type ValidatedAssistantRequest = z.infer<typeof assistantRequestSchema>;
