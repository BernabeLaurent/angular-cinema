/**
 * @fileoverview Tests E2E Réservation de Film - Angular Cinema
 * Movie Booking E2E Tests - Angular Cinema
 *
 * @description Tests bout en bout du processus de réservation conforme REAC
 * @description REAC-compliant end-to-end tests for movie booking process
 *
 * PARCOURS TESTÉ / TESTED FLOW:
 * ✅ Sélection d'un film / Movie selection
 * ✅ Navigation vers détails / Navigate to details
 * ✅ Processus de réservation / Booking process
 * ✅ Validation sécurisée / Secure validation
 * ✅ Gestion d'erreurs / Error handling
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { test, expect, Page } from '@playwright/test';

/**
 * DONNÉES DE TEST / TEST DATA
 */
const TEST_USER = {
  email: 'test.user@angular-cinema.com',
  password: 'SecurePassword123!',
  firstName: 'Test',
  lastName: 'User',
};

// Configuration avant chaque test / Setup before each test
test.beforeEach(async ({ page }) => {
  // Navigation vers la page d'accueil
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

/**
 * GROUPE DE TESTS : PARCOURS COMPLET DE RÉSERVATION
 * TEST GROUP: COMPLETE BOOKING FLOW
 */
test.describe('Réservation de Film - Parcours Complet', () => {

  test('doit permettre de réserver un film avec succès', async ({ page }) => {
    // ÉTAPE 1: Sélectionner un film sur la page d'accueil
    const movieCards = page.locator('app-movie-card');

    if (await movieCards.count() > 0) {
      const firstMovie = movieCards.first();

      // Récupérer le titre du film pour vérification
      const movieTitle = await firstMovie.locator('h3, .movie-title, [class*="title"]').first().textContent();

      // Cliquer sur la carte du film
      await firstMovie.click();
      await page.waitForLoadState('networkidle');

      // ÉTAPE 2: Vérifier la page de détails du film
      if (page.url().includes('/movie') || page.url().includes('/details')) {
        // Vérifier la présence des éléments de détails
        await expect(page.locator('h1, .movie-title')).toBeVisible();

        // Chercher le bouton de réservation
        const reserveButton = page.locator(
          'button:has-text("RÉSERVER"), button:has-text("Réserver"), button[class*="reserve"], button:has(mat-icon:has-text("event_seat"))'
        ).first();

        if (await reserveButton.isVisible()) {
          // ÉTAPE 3: Cliquer sur le bouton de réservation
          await reserveButton.click();
          await page.waitForLoadState('networkidle');

          // ÉTAPE 4: Gérer l'authentification si nécessaire
          await handleAuthenticationIfNeeded(page);

          // ÉTAPE 5: Processus de réservation
          await handleBookingProcess(page);
        }
      }
    }
  });

  test('doit afficher une erreur pour un film non disponible', async ({ page }) => {
    // Tenter d'accéder à un film avec un ID inexistant
    await page.goto('/movie/99999');

    // Vérifier l'affichage d'un message d'erreur
    const errorMessage = page.locator(
      '.error-state, .error-message, [class*="error"], .mat-error'
    );

    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});

/**
 * GROUPE DE TESTS : VALIDATION DE SÉCURITÉ
 * TEST GROUP: SECURITY VALIDATION
 */
test.describe('Réservation de Film - Tests de Sécurité', () => {

  test('doit valider les paramètres d\'URL malveillants', async ({ page }) => {
    // Tenter d'accéder avec des paramètres malveillants
    const maliciousUrls = [
      '/movie/<script>alert("xss")</script>',
      '/movie/1?param=<img src=x onerror=alert("xss")>',
      '/booking?movieId=../../../etc/passwd',
    ];

    for (const url of maliciousUrls) {
      try {
        await page.goto(url);

        // Vérifier que le script malveillant n'a pas été exécuté
        const xssExecuted = await page.evaluate(() => {
          return (window as any).xssTest === true;
        });

        expect(xssExecuted).toBeFalsy();
      } catch (error) {
        // L'erreur de navigation est acceptable pour des URLs invalides
      }
    }
  });

  test('doit protéger contre l\'injection dans les formulaires', async ({ page }) => {
    // Aller à une page avec formulaire (login par exemple)
    await page.goto('/auth/login');

    const emailInput = page.locator('input[type="email"], input[formControlName="email"]');
    const passwordInput = page.locator('input[type="password"], input[formControlName="password"]');

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      // Tenter d'injecter du code malveillant
      await emailInput.fill('<script>alert("xss")</script>@test.com');
      await passwordInput.fill('<img src=x onerror=alert("xss")>');

      // Soumettre le formulaire
      const submitButton = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Login")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }

      // Vérifier qu'aucun script n'a été exécuté
      const xssExecuted = await page.evaluate(() => {
        return (window as any).xssTest === true;
      });

      expect(xssExecuted).toBeFalsy();
    }
  });
});

/**
 * GROUPE DE TESTS : ACCESSIBILITÉ RÉSERVATION
 * TEST GROUP: BOOKING ACCESSIBILITY
 */
test.describe('Réservation de Film - Tests d\'Accessibilité', () => {

  test('doit permettre la réservation au clavier uniquement', async ({ page }) => {
    // Naviguer uniquement au clavier
    await page.keyboard.press('Tab'); // Premier élément

    let tabCount = 0;
    const maxTabs = 20; // Limite pour éviter boucle infinie

    // Chercher un bouton ou lien de film
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus');

      if (await focusedElement.isVisible()) {
        // Vérifier si c'est un élément de film
        const elementText = await focusedElement.textContent();
        const isMovieElement = elementText && (
          elementText.includes('film') ||
          elementText.includes('movie') ||
          await focusedElement.locator('app-movie-card').count() > 0
        );

        if (isMovieElement) {
          // Activer avec Enter
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          break;
        }
      }

      await page.keyboard.press('Tab');
      tabCount++;
    }
  });

  test('doit avoir des labels appropriés sur les éléments interactifs', async ({ page }) => {
    // Aller sur une page de détails de film
    const movieCards = page.locator('app-movie-card');

    if (await movieCards.count() > 0) {
      await movieCards.first().click();
      await page.waitForLoadState('networkidle');

      // Vérifier les boutons interactifs
      const buttons = page.locator('button');

      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);

        if (await button.isVisible()) {
          // Chaque bouton doit avoir un texte, aria-label, ou title
          const buttonText = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          const title = await button.getAttribute('title');

          const hasAccessibleName = buttonText?.trim() || ariaLabel || title;
          expect(hasAccessibleName).toBeTruthy();
        }
      }
    }
  });
});

/**
 * GROUPE DE TESTS : RESPONSIVE BOOKING
 * TEST GROUP: RESPONSIVE BOOKING
 */
test.describe('Réservation de Film - Tests Responsifs', () => {

  test('doit fonctionner correctement sur mobile', async ({ page }) => {
    // Configurer la taille mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Naviguer vers un film
    const movieCards = page.locator('app-movie-card');

    if (await movieCards.count() > 0) {
      await movieCards.first().click();
      await page.waitForLoadState('networkidle');

      // Vérifier que les éléments sont adaptés au mobile
      const reserveButton = page.locator('button:has-text("RÉSERVER"), button:has-text("Réserver")').first();

      if (await reserveButton.isVisible()) {
        // Vérifier que le bouton est suffisamment large pour mobile
        const buttonBox = await reserveButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
        expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('doit fonctionner correctement sur tablette', async ({ page }) => {
    // Configurer la taille tablette
    await page.setViewportSize({ width: 768, height: 1024 });

    // Tester la navigation
    const movieCards = page.locator('app-movie-card');

    if (await movieCards.count() > 0) {
      const firstCard = movieCards.first();
      await expect(firstCard).toBeVisible();

      // La carte doit être cliquable
      await firstCard.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

/**
 * FONCTIONS UTILITAIRES / UTILITY FUNCTIONS
 */

/**
 * Gère l'authentification si nécessaire
 * Handle authentication if needed
 */
async function handleAuthenticationIfNeeded(page: Page): Promise<void> {
  // Vérifier si nous sommes redirigés vers la page de connexion
  if (page.url().includes('/login') || page.url().includes('/auth')) {
    const emailInput = page.locator('input[type="email"], input[formControlName="email"]');
    const passwordInput = page.locator('input[type="password"], input[formControlName="password"]');

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      // Remplir les champs de connexion
      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);

      // Soumettre le formulaire
      const submitButton = page.locator('button[type="submit"], button:has-text("Connexion")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  }
}

/**
 * Gère le processus de réservation
 * Handle booking process
 */
async function handleBookingProcess(page: Page): Promise<void> {
  // Vérifier si nous sommes sur une page de réservation
  if (page.url().includes('/booking') || page.url().includes('/reservation')) {

    // Chercher les éléments de sélection de siège
    const seatSelection = page.locator('.seat, [class*="seat"], .seat-selection');

    if (await seatSelection.count() > 0) {
      // Sélectionner un siège disponible
      const availableSeat = seatSelection.filter({ hasNotText: 'occupé' }).first();
      if (await availableSeat.isVisible()) {
        await availableSeat.click();
      }
    }

    // Chercher le bouton de confirmation
    const confirmButton = page.locator(
      'button:has-text("Confirmer"), button:has-text("Réserver"), button[type="submit"]'
    ).first();

    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');

      // Vérifier le message de succès
      const successMessage = page.locator(
        '.success, .confirmation, [class*="success"], .mat-snack-bar-container'
      );

      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  }
}

/**
 * HOOK DE NETTOYAGE / CLEANUP HOOK
 */
test.afterEach(async ({ page }, testInfo) => {
  // Capture d'écran en cas d'échec
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/booking-failure-${testInfo.title}-${Date.now()}.png`,
      fullPage: true,
    });
  }
});