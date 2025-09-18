import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MoviesSectionComponent } from './movies-section.component';
import { SessionsService } from '../../services/sessions.service';
import { AdminService, Theater } from '../../services/admin.service';
import { MoviesService } from '../../services/movies.service';
import { Movie } from '../movie-card/movie-card.component';

describe('MoviesSectionComponent', () => {
  let component: MoviesSectionComponent;
  let fixture: ComponentFixture<MoviesSectionComponent>;
  let mockSessionsService: jasmine.SpyObj<SessionsService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockMoviesService: jasmine.SpyObj<MoviesService>;

  const mockTheaters = [
    {
      id: 1,
      name: 'Cinéma Test 1',
      zipCode: 75001,
      city: 'Paris',
      address: '1 rue de Test',
      codeCountry: 'FR',
      openingTime: '09:00',
      closingTime: '23:00',
      phoneNumber: '0123456789',
      createDate: '2024-01-01',
      updateDate: '2024-01-01',
      moviesTheaters: []
    },
    {
      id: 2,
      name: 'Cinéma Test 2',
      zipCode: 75002,
      city: 'Paris',
      address: '2 rue de Test',
      codeCountry: 'FR',
      openingTime: '09:00',
      closingTime: '23:00',
      phoneNumber: '0123456790',
      createDate: '2024-01-01',
      updateDate: '2024-01-01',
      moviesTheaters: []
    }
  ];

  const mockSessions = [
    {
      id: 1,
      startTime: new Date(Date.now() + 86400000).toISOString(), // Demain
      movie: {
        id: 1,
        title: 'Film Test 1',
        posterPath: '/test-poster1.jpg',
        runtime: 120,
        releaseDate: '2024-01-01',
        averageRating: 4.5
      }
    },
    {
      id: 2,
      startTime: new Date(Date.now() - 86400000).toISOString(), // Hier
      movie: {
        id: 2,
        title: 'Film Test 2',
        posterPath: '/test-poster2.jpg',
        runtime: 90,
        releaseDate: '2024-02-01',
        averageRating: 3.8
      }
    }
  ];

  const mockMovies = [
    {
      id: 3,
      title: 'Film à venir 1',
      posterPath: '/upcoming1.jpg',
      runtime: 150,
      releaseDate: '2024-06-01',
      availableSessions: 0
    },
    {
      id: 4,
      title: 'Film à venir 2',
      posterPath: '/upcoming2.jpg',
      runtime: 110,
      releaseDate: '2024-07-01',
      availableSessions: 0
    }
  ];

  beforeEach(async () => {
    const sessionsServiceSpy = jasmine.createSpyObj('SessionsService', ['getSessions']);
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getTheaters', 'getAllSessions', 'getAllMovies']);
    const moviesServiceSpy = jasmine.createSpyObj('MoviesService', ['getPosterUrl']);

    await TestBed.configureTestingModule({
      imports: [MoviesSectionComponent],
      providers: [
        { provide: SessionsService, useValue: sessionsServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: MoviesService, useValue: moviesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesSectionComponent);
    component = fixture.componentInstance;
    mockSessionsService = TestBed.inject(SessionsService) as jasmine.SpyObj<SessionsService>;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockMoviesService = TestBed.inject(MoviesService) as jasmine.SpyObj<MoviesService>;

    mockAdminService.getTheaters.and.returnValue(of(mockTheaters));
    mockAdminService.getAllSessions.and.returnValue(of(mockSessions));
    mockAdminService.getAllMovies.and.returnValue(of(mockMovies));
    mockMoviesService.getPosterUrl.and.returnValue('https://test-poster-url.com');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.nowShowingMovies).toEqual([]);
    expect(component.comingSoonMovies).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.loadingMoreMovies).toBeFalse();
    expect(component.upcomingMoviesPage).toBe(1);
  });

  it('should load movies on init', () => {
    spyOn(component, 'loadMovies');
    component.ngOnInit();
    expect(component.loadMovies).toHaveBeenCalled();
  });

  it('should load now showing and upcoming movies successfully', () => {
    component.loadMovies();

    expect(mockAdminService.getTheaters).toHaveBeenCalled();
    expect(mockAdminService.getAllSessions).toHaveBeenCalled();
    expect(mockAdminService.getAllMovies).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.nowShowingMovies.length).toBe(2);
    expect(component.comingSoonMovies.length).toBe(2);
  });

  it('should handle error during movie loading and fallback to default data', () => {
    mockAdminService.getTheaters.and.returnValue(throwError('Test error'));
    mockAdminService.getAllSessions.and.returnValue(throwError('Test error'));

    component.loadMovies();

    expect(component.loading).toBeFalse();
    expect(component.nowShowingMovies.length).toBe(1);
    expect(component.nowShowingMovies[0].title).toBe('Dune: Deuxième Partie');
  });

  it('should filter movies with current sessions correctly', () => {
    const result = (component as any).getMoviesWithCurrentSessions(mockSessions);
    expect(result.length).toBe(2);
    expect(result[0].title).toBe('Film Test 1');
    expect(result[1].title).toBe('Film Test 2');
  });

  it('should convert movies to movie card format correctly', () => {
    const testMovies = [
      {
        id: 1,
        title: 'Test Movie',
        posterPath: '/test.jpg',
        runtime: 120,
        releaseDate: '2024-01-01',
        averageRating: 4.0
      }
    ];

    const result = (component as any).convertToMovieCardFormat(testMovies);

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Test Movie');
    expect(result[0].duration).toBe('120min');
    expect(result[0].rating).toBe(4.0);
    expect(mockMoviesService.getPosterUrl).toHaveBeenCalledWith('/test.jpg');
  });

  it('should handle movie conversion with missing data', () => {
    const testMovies = [
      {
        id: 1,
        originalTitle: 'Original Title'
      }
    ];

    const result = (component as any).convertToMovieCardFormat(testMovies);

    expect(result[0].title).toBe('Original Title');
    expect(result[0].genre).toBe('Genre non spécifié');
    expect(result[0].duration).toBe('Durée non spécifiée');
    expect(result[0].rating).toBe(0);
  });

  it('should generate placeholder poster URL when no poster path', () => {
    const result = (component as any).getMoviePosterUrl('');
    expect(result).toContain('data:image/svg+xml');
    expect(result).toContain('IMAGE NON TROUVÉE');
  });

  it('should format release date correctly', () => {
    const result = (component as any).formatReleaseDate('2024-01-15');
    expect(result).toContain('2024');
  });

  it('should handle missing release date', () => {
    const result = (component as any).formatReleaseDate('');
    expect(result).toBe('Date non disponible');
  });

  it('should load more upcoming movies', () => {
    component.loadMoreUpcomingMovies();

    expect(component.loadingMoreMovies).toBeFalse();
    expect(component.upcomingMoviesPage).toBe(2);
    expect(mockAdminService.getAllMovies).toHaveBeenCalled();
  });

  it('should not load more movies if already loading', () => {
    component.loadingMoreMovies = true;
    const initialPage = component.upcomingMoviesPage;

    component.loadMoreUpcomingMovies();

    expect(component.upcomingMoviesPage).toBe(initialPage);
  });

  it('should handle error when loading more movies', () => {
    mockAdminService.getAllMovies.and.returnValue(throwError('Load more error'));

    component.loadMoreUpcomingMovies();

    expect(component.loadingMoreMovies).toBeFalse();
  });

  it('should scroll movies container', () => {
    const mockContainer = {
      scrollLeft: 0,
      scrollTo: jasmine.createSpy('scrollTo')
    };
    spyOn(document, 'getElementById').and.returnValue(mockContainer as any);

    component.scrollMovies('test-container', 'right');

    expect(mockContainer.scrollTo).toHaveBeenCalledWith({
      left: 300,
      behavior: 'smooth'
    });
  });

  it('should scroll movies container to the left', () => {
    const mockContainer = {
      scrollLeft: 600,
      scrollTo: jasmine.createSpy('scrollTo')
    };
    spyOn(document, 'getElementById').and.returnValue(mockContainer as any);

    component.scrollMovies('test-container', 'left');

    expect(mockContainer.scrollTo).toHaveBeenCalledWith({
      left: 300,
      behavior: 'smooth'
    });
  });

  it('should handle scroll when container not found', () => {
    spyOn(document, 'getElementById').and.returnValue(null);

    expect(() => {
      component.scrollMovies('non-existent', 'right');
    }).not.toThrow();
  });

  it('should scroll to new movies after loading more', () => {
    const mockContainer = {
      scrollLeft: 0,
      scrollTo: jasmine.createSpy('scrollTo')
    };
    spyOn(document, 'getElementById').and.returnValue(mockContainer as any);

    (component as any).scrollToNewMovies('coming-soon');

    expect(mockContainer.scrollTo).toHaveBeenCalledWith({
      left: 600, // 300 * 2
      behavior: 'smooth'
    });
  });
});
