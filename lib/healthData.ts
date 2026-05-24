import { HealthMilestone, HabitType } from '../types';

export const HEALTH_DISCLAIMER =
  "These milestones are general wellness guides, not medical advice, and everyone's timeline is different. If you feel unwell or are in crisis, use Emergency Help in Settings or speak with a healthcare professional.";

export function formatThresholdLabel(hours: number): string {
  if (hours < 24) return `${hours} hours`;
  if (hours === 24) return '1 day';
  if (hours === 168) return '1 week';
  if (hours === 720) return '1 month';
  if (hours === 2160) return '3 months';
  if (hours === 8760) return '1 year';
  if (hours % 24 === 0) return `${hours / 24} days`;
  return `${hours} hours`;
}

export const GENERAL_HEALTH_TIMELINE: HealthMilestone[] = [
  {
    id: '24h',
    thresholdHours: 24,
    title: 'First day complete',
    description: 'Your body and routine are starting to adjust.',
    icon: 'clock',
  },
  {
    id: '72h',
    thresholdHours: 72,
    title: 'Early momentum',
    description: 'Many people notice small shifts in mood and focus.',
    icon: 'brain',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week in',
    description: 'Your new habits may feel a little more familiar.',
    icon: 'sparkles',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month of progress',
    description: 'Consistency can help reinforce the changes you are making.',
    icon: 'heart',
  },
  {
    id: '3m',
    thresholdHours: 2160,
    title: 'Three months',
    description: 'Your routine may feel more natural day to day.',
    icon: 'trending-up',
  },
  {
    id: '1y',
    thresholdHours: 8760,
    title: 'One year',
    description: 'A meaningful stretch of commitment and growth.',
    icon: 'award',
  },
];

export const ALCOHOL_TIMELINE: HealthMilestone[] = [
  {
    id: '24h',
    thresholdHours: 24,
    title: 'First day complete',
    description: 'Your body and routine are starting to adjust.',
    icon: 'clock',
  },
  {
    id: '72h',
    thresholdHours: 72,
    title: 'Early clarity',
    description: 'Some people notice improved rest and mental clarity.',
    icon: 'brain',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week in',
    description: 'Hydration and sleep patterns may feel more balanced.',
    icon: 'sparkles',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month',
    description: 'Your system may continue adapting to life without alcohol.',
    icon: 'heart',
  },
  {
    id: '3m',
    thresholdHours: 2160,
    title: 'Three months',
    description: 'Many people report feeling more stable and energised.',
    icon: 'trending-up',
  },
  {
    id: '1y',
    thresholdHours: 8760,
    title: 'One year',
    description: 'A full year of dedication to your wellbeing.',
    icon: 'award',
  },
];

export const SMOKING_TIMELINE: HealthMilestone[] = [
  {
    id: '12h',
    thresholdHours: 12,
    title: 'Half a day in',
    description: 'Your body may begin adjusting as nicotine levels change.',
    icon: 'wind',
  },
  {
    id: '48h',
    thresholdHours: 48,
    title: 'Two days',
    description: 'Some people notice changes in taste and smell.',
    icon: 'sparkles',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week',
    description: 'Breathing may feel a little easier for some people.',
    icon: 'activity',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month',
    description: 'Circulation and stamina may continue improving.',
    icon: 'heart',
  },
  {
    id: '3m',
    thresholdHours: 2160,
    title: 'Three months',
    description: 'Coughing and shortness of breath may ease for some.',
    icon: 'trending-up',
  },
  {
    id: '1y',
    thresholdHours: 8760,
    title: 'One year smoke-free',
    description: 'A major milestone for your lungs and overall health.',
    icon: 'award',
  },
];

export const VAPING_TIMELINE: HealthMilestone[] = [
  {
    id: '24h',
    thresholdHours: 24,
    title: 'First day',
    description: 'Nicotine levels may begin dropping in your system.',
    icon: 'droplet',
  },
  {
    id: '72h',
    thresholdHours: 72,
    title: 'Early days',
    description: 'Cravings can feel strong — many people find this phase passes.',
    icon: 'brain',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week',
    description: 'Airway irritation may start to ease for some people.',
    icon: 'wind',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month',
    description: 'Energy and focus may feel more consistent.',
    icon: 'zap',
  },
  {
    id: '3m',
    thresholdHours: 2160,
    title: 'Three months',
    description: 'Triggers may feel less automatic as routines shift.',
    icon: 'trending-up',
  },
];

export const SUGAR_TIMELINE: HealthMilestone[] = [
  {
    id: '24h',
    thresholdHours: 24,
    title: 'First day',
    description: 'Blood sugar swings may start to settle for some people.',
    icon: 'activity',
  },
  {
    id: '72h',
    thresholdHours: 72,
    title: 'Early adjustment',
    description: 'Cravings can peak — this often eases with time.',
    icon: 'brain',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week',
    description: 'Energy may feel more steady without sugar highs.',
    icon: 'zap',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month',
    description: 'Natural foods may taste sweeter to some people.',
    icon: 'sparkles',
  },
];

export const SOCIAL_MEDIA_TIMELINE: HealthMilestone[] = [
  {
    id: '24h',
    thresholdHours: 24,
    title: 'First day offline',
    description: 'More time may open up for rest and real-world connection.',
    icon: 'sun',
  },
  {
    id: '72h',
    thresholdHours: 72,
    title: 'Three days',
    description: 'Focus and calm may improve with fewer interruptions.',
    icon: 'brain',
  },
  {
    id: '1w',
    thresholdHours: 168,
    title: 'One week',
    description: 'Evening screen time may support better sleep for some.',
    icon: 'moon',
  },
  {
    id: '1m',
    thresholdHours: 720,
    title: 'One month',
    description: 'Intentional use can replace autopilot scrolling.',
    icon: 'trending-up',
  },
];

export function getHealthTimelineForHabit(type: HabitType): HealthMilestone[] {
  switch (type) {
    case 'alcohol':
      return ALCOHOL_TIMELINE;
    case 'smoking':
      return SMOKING_TIMELINE;
    case 'vaping':
      return VAPING_TIMELINE;
    case 'sugar':
      return SUGAR_TIMELINE;
    case 'social_media':
      return SOCIAL_MEDIA_TIMELINE;
    default:
      return GENERAL_HEALTH_TIMELINE;
  }
}
