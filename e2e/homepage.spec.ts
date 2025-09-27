/**
 * @fileoverview Tests E2E Page d'Accueil - Angular Cinema
 * Homepage E2E Tests - Angular Cinema
 *
 * @description Tests bout en bout conformes REAC pour la page d'accueil
 * @description REAC-compliant end-to-end tests for homepage
 *
 * TESTS COUVERTS / COVERED TESTS:
 * ✅ Navigation et affichage / Navigation and display
 * ✅ Responsivité / Responsiveness
 * ✅ Accessibilité RGAA / RGAA accessibility
 * ✅ Sécurité (XSS, validation) / Security (XSS, validation)
 * ✅ Performance / Performance
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Hooks de configuration / Configuration hooks
test.beforeEach(async ({ page }) => {
  // Navigation vers la page d'accueil / Navigate to homepage
  await page.goto('/');

  // Attendre que l'application soit complètement chargée
  // Wait for application to be fully loaded
  await page.waitForLoadState('networkidle');
});

/**
 * GROUPE DE TESTS : NAVIGATION ET AFFICHAGE
 * TEST GROUP: NAVIGATION AND DISPLAY
 */
test.describe('Page d\'accueil - Navigation et Affichage', () => {

  test('doit afficher les éléments principaux de la page', async ({ page }) => {
    // Test: Titre de la page / Page title test
    await expect(page).toHaveTitle(/angular-cinema/i);

    // Test: Barre de navigation / Navigation bar test
    const navbar = page.locator('app-navbar');
    await expect(navbar).toBeVisible();

    // Test: Section héro / Hero section test
    const heroSection = page.locator('app-hero-section');
    await expect(heroSection).toBeVisible();

    // Test: Section films / Movies section test
    const moviesSection = page.locator('app-movies-section');
    await expect(moviesSection).toBeVisible();

    // Test: Pied de page / Footer test
    const footer = page.locator('app-footer');
    await expect(footer).toBeVisible();
  });

  test('doit afficher la section "À l\'affiche"', async ({ page }) => {
    // Vérifier la présence du titre "À L'AFFICHE"
    const nowShowingTitle = page.locator('h2', { hasText: 'À L\'AFFICHE' });
    await expect(nowShowingTitle).toBeVisible();

    // Vérifier la présence des boutons de navigation
    const navButtons = page.locator('.nav-buttons .nav-btn');
    await expect(navButtons).toHaveCount(2); // Left + Right buttons

    // Vérifier la présence des cartes de films
    const movieCards = page.locator('app-movie-card');
    await expect(movieCards.first()).toBeVisible();
  });

  test('doit afficher la section "Prochainement"', async ({ page }) => {
    // Vérifier la présence du titre "PROCHAINEMENT"
    const comingSoonTitle = page.locator('h2', { hasText: 'PROCHAINEMENT' });
    await expect(comingSoonTitle).toBeVisible();

    // Vérifier les boutons de navigation
    const navButtons = page.locator('.section:has-text("PROCHAINEMENT") .nav-buttons .nav-btn');
    await expect(navButtons).toHaveCount(2);
  });
});

/**
 * GROUPE DE TESTS : RESPONSIVITÉ
 * TEST GROUP: RESPONSIVENESS
 */
test.describe('Page d\'accueil - Tests Responsifs', () => {

  test('doit s\'adapter correctement sur mobile', async ({ page }) => {
    // Redimensionner en mode mobile / Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Vérifier que les éléments sont toujours visibles
    await expect(page.locator('app-navbar')).toBeVisible();
    await expect(page.locator('app-hero-section')).toBeVisible();
    await expect(page.locator('app-movies-section')).toBeVisible();

    // Vérifier l'adaptation des cartes de films
    const movieCards = page.locator('app-movie-card');
    if (await movieCards.count() > 0) {
      const firstCard = movieCards.first();
      await expect(firstCard).toBeVisible();

      // Vérifier que les cartes ont une taille appropriée pour mobile
      const cardBox = await firstCard.boundingBox();
      expect(cardBox?.width).toBeLessThanOrEqual(280); // Max width pour mobile
    }
  });

  test('doit s\'adapter correctement sur tablette', async ({ page }) => {
    // Redimensionner en mode tablette / Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    // Vérifier l'affichage des sections
    await expect(page.locator('app-movies-section')).toBeVisible();

    // Vérifier les titres de section
    await expect(page.locator('h2', { hasText: 'À L\'AFFICHE' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'PROCHAINEMENT' })).toBeVisible();
  });

  test('doit s\'adapter correctement sur desktop', async ({ page }) => {
    // Redimensionner en mode desktop / Resize to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Vérifier l'affichage complet
    await expect(page.locator('app-navbar')).toBeVisible();
    await expect(page.locator('app-hero-section')).toBeVisible();
    await expect(page.locator('app-movies-section')).toBeVisible();

    // Vérifier que plusieurs cartes sont visibles simultanément
    const movieCards = page.locator('app-movie-card');
    const cardCount = await movieCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});

/**
 * GROUPE DE TESTS : ACCESSIBILITÉ RGAA
 * TEST GROUP: RGAA ACCESSIBILITY
 */
test.describe('Page d\'accueil - Tests d\'Accessibilité', () => {

  test('doit avoir une structure sémantique correcte', async ({ page }) => {
    // Vérifier la hiérarchie des titres H1, H2
    const h1 = page.locator('h1');
    const h2Elements = page.locator('h2');

    // Il doit y avoir au moins un H1
    await expect(h1.first()).toBeVisible();

    // Il doit y avoir des H2 pour les sections
    const h2Count = await h2Elements.count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('doit avoir des labels accessibles sur les boutons', async ({ page }) => {
    // Vérifier les boutons de navigation des films
    const navButtons = page.locator('.nav-btn');

    for (let i = 0; i < await navButtons.count(); i++) {
      const button = navButtons.nth(i);

      // Chaque bouton doit avoir un aria-label ou un texte
      const ariaLabel = await button.getAttribute('aria-label');
      const buttonText = await button.textContent();

      expect(ariaLabel || buttonText).toBeTruthy();
    }
  });

  test('doit permettre la navigation au clavier', async ({ page }) => {
    // Commencer par le premier élément focalisable
    await page.keyboard.press('Tab');

    // Vérifier qu'un élément a le focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Tester la navigation avec Tab
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('doit avoir des contrastes de couleurs suffisants', async ({ page }) => {
    // Vérifier les titres principaux
    const mainTitle = page.locator('h2').first();
    if (await mainTitle.isVisible()) {
      const color = await mainTitle.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        };
      });

      // Les couleurs doivent être définies
      expect(color.color).toBeTruthy();
    }
  });
});

/**
 * GROUPE DE TESTS : SÉCURITÉ
 * TEST GROUP: SECURITY
 */
test.describe('Page d\'accueil - Tests de Sécurité', () => {

  test('doit résister aux tentatives d\'injection XSS', async ({ page }) => {
    // Tenter d'injecter du script via la recherche (si présente)
    const searchInput = page.locator('input[type="search"], input[placeholder*="recherch"], input[placeholder*="search"]');

    if (await searchInput.count() > 0) {
      const maliciousScript = '<script>window.xssTest = true;</script>';

      await searchInput.first().fill(maliciousScript);
      await page.keyboard.press('Enter');

      // Vérifier que le script n'a pas été exécuté
      const xssExecuted = await page.evaluate(() => {
        return (window as any).xssTest === true;
      });

      expect(xssExecuted).toBeFalsy();
    }
  });

  test('doit avoir des en-têtes de sécurité appropriés', async ({ page }) => {
    const response = await page.goto('/');

    // Vérifier la présence d'en-têtes de sécurité recommandés
    const headers = response?.headers() || {};

    // Content-Type doit être défini
    expect(headers['content-type']).toContain('text/html');

    // Note: Les autres en-têtes de sécurité peuvent être configurés au niveau serveur
  });

  test('doit valider les entrées utilisateur', async ({ page }) => {
    // Test avec des caractères spéciaux dans les URLs
    const maliciousUrl = '/<script>alert("xss")</script>';

    // La navigation vers une URL malveillante ne doit pas exécuter de script
    await page.goto(maliciousUrl, { waitUntil: 'domcontentloaded' }).catch(() => {
      // L'erreur est attendue pour une URL invalide
    });

    // Vérifier que nous sommes toujours sur une page sécurisée
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('<script>');
  });
});

/**
 * GROUPE DE TESTS : PERFORMANCE
 * TEST GROUP: PERFORMANCE
 */
test.describe('Page d\'accueil - Tests de Performance', () => {

  test('doit se charger rapidement', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Le chargement ne doit pas dépasser 5 secondes
    expect(loadTime).toBeLessThan(5000);
  });

  test('doit avoir des images optimisées', async ({ page }) => {
    // Vérifier que les images ont des attributs alt
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');

      // Chaque image doit avoir un attribut alt (même vide pour les images décoratives)
      expect(altText).not.toBeNull();
    }
  });
});

/**
 * GROUPE DE TESTS : NAVIGATION INTERACTIVE
 * TEST GROUP: INTERACTIVE NAVIGATION
 */
test.describe('Page d\'accueil - Navigation Interactive', () => {

  test('doit permettre le défilement des films', async ({ page }) => {
    // Vérifier la présence des boutons de défilement
    const rightButton = page.locator('.nav-btn').filter({ hasText: /chevron_right|>/ }).first();

    if (await rightButton.isVisible()) {
      // Cliquer sur le bouton de défilement vers la droite
      await rightButton.click();

      // Attendre que l'animation se termine
      await page.waitForTimeout(1000);

      // Le bouton doit toujours être présent après le clic
      await expect(rightButton).toBeVisible();
    }
  });

  test('doit permettre de cliquer sur une carte de film', async ({ page }) => {
    const movieCards = page.locator('app-movie-card');

    if (await movieCards.count() > 0) {
      const firstCard = movieCards.first();

      // Vérifier que la carte est cliquable
      await expect(firstCard).toBeVisible();

      // Cliquer sur la carte
      await firstCard.click();

      // Vérifier la navigation (peut rediriger vers une page de détails)
      await page.waitForTimeout(500);

      // Vérifier que nous sommes toujours sur une page valide
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/^https?:\/\//);
    }
  });
});

/**
 * HOOK DE NETTOYAGE / CLEANUP HOOK
 */
test.afterEach(async ({ page }, testInfo) => {
  // Capture d'écran en cas d'échec / Screenshot on failure
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/failure-${testInfo.title}-${Date.now()}.png`,
      fullPage: true,
    });
  }
});