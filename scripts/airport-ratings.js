import { readFileSync } from 'fs';

const audit = JSON.parse(readFileSync(new URL('../data/ratings.json', import.meta.url), 'utf8'));
export const ratingReviewDate = audit.reviewedAt;

export function recommendationRating(airport) {
  const review = audit.airports[airport.name];
  if (!review) return '待评（新收录）';
  if (!Number.isInteger(review.stars) || review.stars < 1 || review.stars > 5
    || !review.reason || !review.sources?.length) {
    throw new Error(`Invalid rating review: ${airport.name}`);
  }
  const stars = airport.isUnderMaintenance ? Math.min(review.stars, 2) : review.stars;
  return `${'⭐'.repeat(stars)} · ${airport.isUnderMaintenance ? '维护观察' : review.status}`;
}
