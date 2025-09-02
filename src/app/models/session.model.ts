export interface Cast {
  id: number;
  character?: string;
  name: string;
  originalName: string;
  profilePath?: string;
  order: number;
  adult: boolean;
  gender: number;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  description?: string;
  originalDescription?: string;
  tagline?: string;
  originalTagline?: string;
  minimumAge?: number;
  runtime?: number;
  averageRating?: number;
  averageRatingExterne?: number;
  isFavorite?: boolean;
  movieExterneId: number;
  releaseDate?: string;
  isAdult?: boolean;
  startDate?: string;
  endDate?: string;
  originalLanguage: string;
  backdropPath?: string;
  posterPath?: string;
  cast?: Cast[];
  reviews?: any[];
  // Pour compatibilité avec l'ancien modèle
  duration?: number;
  genre?: string;
  rating?: number;
  poster?: string;
  trailer?: string;
}

export interface Theater {
  id: number;
  name: string;
  zipCode: number;
  city: string;
  address: string;
  codeCountry: string;
  openingTime: string;
  closingTime: string;
  phoneNumber: string;
  createDate: string;
  updateDate: string;
}

export interface MovieTheater {
  id: number;
  theaterId: number;
  numberSeats: number;
  numberSeatsDisabled?: number;
  roomNumber: number;
  theater?: Theater;
}

export enum TheaterQuality {
  SD = 'SD',
  HD = 'HD',
  FULL_HD = 'FULL_HD',
  UHD_4K = 'UHD_4K',
  IMAX = 'IMAX',
  DOLBY_CINEMA = 'DOLBY_CINEMA',
  THREE_D = '3D'
}

export enum Languages {
  FRENCH = 'FRENCH',
  ENGLISH = 'ENGLISH',
  SPANISH = 'SPANISH',
  GERMAN = 'GERMAN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  CANCELLED = 'CANCELLED'
}

export interface SessionCinema {
  id: number;
  startTime: string;
  endTime: string;
  quality: TheaterQuality;
  codeLanguage: Languages;
  movieTheaterId: number;
  movieId: number;
  movieTheater?: MovieTheater;
  movie?: Movie;
  availableSeats?: number;
  price?: number;
}

export interface BookingDetail {
  id: number;
  seatNumber: number;
  isValidated: boolean;
  createDate: string;
  updateDate: string;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  userId: number;
  sessionCinemaId: number;
  numberSeats: number;
  numberSeatsDisabled: number;
  totalPrice: number;
  createDate: string;
  sessionCinema?: SessionCinema;
  reservedSeats: BookingDetail[];
}

export interface CreateBookingDto {
  userId: number;
  sessionCinemaId: number;
  numberSeats: number;
  numberSeatsDisabled: number;
  totalPrice: number;
  reservedSeats: CreateBookingDetailDto[];
}

export interface CreateBookingDetailDto {
  seatNumber: number;
  isValidated?: boolean;
}

export interface MovieWithSessions {
  movie: Movie;
  theaters: TheaterWithSessions[];
}

export interface TheaterWithSessions {
  theater: Theater;
  sessions: SessionsByDate[];
}

export interface SessionsByDate {
  date: string;
  sessions: SessionCinema[];
}

export interface SeatMap {
  seatNumber: number;
  isOccupied: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isAvailable?: boolean;
  row: string;
  column: number;
}

export interface SessionBookingInfo {
  sessionCinema: SessionCinema;
  occupiedSeats: number[];
  totalSeats: number;
  availableSeats: number[];
  pricePerSeat: number;
}