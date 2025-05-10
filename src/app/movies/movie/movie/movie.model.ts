import {Languages} from '../../../common/enums/languages.enum';

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  description: string;
  originalDescription: string;
  minimumAge?: number;
  runtime: number;
  averageRating?: number;
  isFavorite: boolean;
  isAdult: boolean;
  averageRatingExterne?: number;
  originalLanguage: Languages,
  startDate: Date,
  endDate: Date,
}
