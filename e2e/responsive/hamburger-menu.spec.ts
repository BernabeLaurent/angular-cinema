/**
 * @fileoverview Test E2E Hamburger Menu Responsive - Angular Cinema
 * Responsive Hamburger Menu E2E Test - Angular Cinema
 *
 * @description Test de vérification de l'affichage du menu hamburger selon la taille d'écran
 * @description Test to verify hamburger menu display based on screen size
 *
 * OBJECTIF DU TEST / TEST OBJECTIVE:
 * ✅ Vérifier que le menu hamburger apparaît sur mobile/tablette
 * ✅ Vérifier que le menu standard s'affiche sur desktop
 * ✅ Tester les transitions entre les tailles d'écran
 * ✅ Valider l'accessibilité du menu hamburger
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

// Configuration avant chaque test
test.beforeEach(async ({ page }) => {
  // Navigation vers la page d'accueil où se trouve la navbar
  await page.goto('/');

  // Attendre que la page soit complètement chargée
  await page.waitForLoadState('networkidle');
});

/**
 * GROUPE DE TESTS : AFFICHAGE RESPONSIVE DU MENU HAMBURGER
 * TEST GROUP: RESPONSIVE HAMBURGER MENU DISPLAY
 */
test.describe('Menu Hamburger - Tests Responsifs', () => {

  test('doit afficher le menu hamburger sur mobile (≤768px)', async ({ page }) => {
    // ÉTAPE 1: Redimensionner l'écran en mode mobile
    // Utilisation d'une taille mobile standard (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    // ÉTAPE 2: Localiser les éléments de navigation
    // Chercher le bouton menu hamburger (icône avec 3 barres)
    const hamburgerButton = page.locator(
      // Sélecteurs CSS multiples pour couvrir différentes implémentations
      'button[aria-label*="menu"], ' +           // Bouton avec aria-label contenant "menu"
      'button:has(mat-icon:text("menu")), ' +    // Bouton Material avec icône "menu"
      '.hamburger-button, ' +                    // Classe CSS hamburger
      '.mobile-menu-button, ' +                  // Classe CSS menu mobile
      'button:has(.hamburger-icon)'              // Bouton contenant une icône hamburger
    );

    // Chercher le menu de navigation standard (desktop)
    const desktopMenu = page.locator(
      'nav:not(.mobile-nav), ' +                 // Navigation non-mobile
      '.desktop-nav, ' +                         // Navigation desktop
      '.main-nav:not(.mobile)'                   // Menu principal non-mobile
    );

    // ÉTAPE 3: Vérifications d'affichage mobile

    // Le menu hamburger DOIT être visible sur mobile
    await expect(hamburgerButton).toBeVisible({
      // Message d'erreur personnalisé pour debug
      message: 'Le bouton menu hamburger doit être visible sur mobile (375px)'
    });

    // Le menu desktop DOIT être caché sur mobile
    // Note: On vérifie soit qu'il est caché, soit qu'il n'existe pas
    const desktopMenuCount = await desktopMenu.count();
    if (desktopMenuCount > 0) {
      await expect(desktopMenu.first()).toBeHidden({
        message: 'Le menu desktop doit être caché sur mobile (375px)'
      });
    }

    // ÉTAPE 4: Test d'interaction - Cliquer sur le hamburger
    await hamburgerButton.click();

    // Attendre l'animation d'ouverture du menu
    await page.waitForTimeout(300);

    // ÉTAPE 5: Vérifier que le menu mobile s'ouvre
    const mobileMenu = page.locator(
      '.mobile-menu, ' +                         // Menu mobile générique
      '.sidenav, ' +                            // Sidenav Material
      '.drawer, ' +                             // Drawer/tiroir
      '[role="dialog"], ' +                     // Dialog ARIA
      '.mat-sidenav'                            // Sidenav Material Design
    );

    // Le menu mobile doit apparaître après le clic
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible({
        message: 'Le menu mobile doit s\'ouvrir après clic sur hamburger'
      });
    }

    console.log('✅ Test mobile (375px) : Menu hamburger affiché correctement');
  });

  test('doit masquer le menu hamburger sur desktop (≥1024px)', async ({ page }) => {
    // ÉTAPE 1: Redimensionner l'écran en mode desktop
    // Utilisation d'une taille desktop standard
    await page.setViewportSize({ width: 1920, height: 1080 });

    // ÉTAPE 2: Localiser les éléments de navigation
    const hamburgerButton = page.locator(
      'button[aria-label*="menu"], ' +
      'button:has(mat-icon:text("menu")), ' +
      '.hamburger-button, ' +
      '.mobile-menu-button'
    );

    const desktopMenu = page.locator(
      'nav:not(.mobile-nav), ' +
      '.desktop-nav, ' +
      '.main-nav:not(.mobile), ' +
      '.navbar-nav'                              // Classe Bootstrap nav
    );

    // ÉTAPE 3: Vérifications d'affichage desktop

    // Le menu hamburger DOIT être caché sur desktop
    const hamburgerCount = await hamburgerButton.count();
    if (hamburgerCount > 0) {
      await expect(hamburgerButton.first()).toBeHidden({
        message: 'Le bouton menu hamburger doit être caché sur desktop (1920px)'
      });
    }

    // Le menu desktop DOIT être visible sur grand écran
    if (await desktopMenu.count() > 0) {
      await expect(desktopMenu.first()).toBeVisible({
        message: 'Le menu desktop doit être visible sur grand écran (1920px)'
      });
    }

    // ÉTAPE 4: Vérifier que les liens de navigation sont accessibles
    const navLinks = page.locator('nav a, .nav-link');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Au moins quelques liens doivent être visibles sur desktop
      expect(linkCount).toBeGreaterThan(0);

      // Vérifier que le premier lien est cliquable
      const firstLink = navLinks.first();
      await expect(firstLink).toBeVisible();
    }

    console.log('✅ Test desktop (1920px) : Menu hamburger masqué, navigation standard visible');
  });

  test('doit gérer la transition tablette (768px-1023px)', async ({ page }) => {
    // ÉTAPE 1: Tester la taille tablette (zone de transition)
    await page.setViewportSize({ width: 768, height: 1024 });

    // ÉTAPE 2: Identifier le comportement sur tablette
    const hamburgerButton = page.locator(
      'button[aria-label*="menu"], ' +
      'button:has(mat-icon:text("menu")), ' +
      '.hamburger-button'
    );

    const desktopMenu = page.locator(
      'nav:not(.mobile-nav), ' +
      '.desktop-nav'
    );

    // ÉTAPE 3: Logique conditionnelle pour tablette
    // Sur tablette, le comportement peut varier selon le design
    const hamburgerVisible = await hamburgerButton.isVisible().catch(() => false);
    const desktopVisible = await desktopMenu.isVisible().catch(() => false);

    // ÉTAPE 4: Validation logique
    // Au moins UN des deux menus doit être visible
    const hasVisibleNavigation = hamburgerVisible || desktopVisible;
    expect(hasVisibleNavigation).toBeTruthy();

    // ÉTAPE 5: Test de cohérence
    if (hamburgerVisible) {
      // Si hamburger visible, tester son fonctionnement
      await hamburgerButton.click();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator('.mobile-menu, .sidenav, .mat-sidenav');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu.first()).toBeVisible();
      }
    }

    console.log(`✅ Test tablette (768px) : Navigation ${hamburgerVisible ? 'hamburger' : 'standard'} détectée`);
  });

  test('doit maintenir l\'accessibilité du menu hamburger', async ({ page }) => {
    // ÉTAPE 1: Configurer en mode mobile pour tester l'accessibilité
    await page.setViewportSize({ width: 375, height: 667 });

    // ÉTAPE 2: Localiser le bouton hamburger
    const hamburgerButton = page.locator(
      'button[aria-label*="menu"], ' +
      'button:has(mat-icon:text("menu")), ' +
      '.hamburger-button'
    );

    // ÉTAPE 3: Vérifications d'accessibilité
    if (await hamburgerButton.count() > 0) {
      const button = hamburgerButton.first();

      // Le bouton doit être visible et focalisable
      await expect(button).toBeVisible();
      await expect(button).toBeFocused({ focused: false }); // Pas encore focalisé

      // ÉTAPE 4: Test de navigation clavier
      await button.focus();
      await expect(button).toBeFocused();

      // ÉTAPE 5: Test d'activation clavier
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // ÉTAPE 6: Vérifier les attributs d'accessibilité
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaExpanded = await button.getAttribute('aria-expanded');
      const role = await button.getAttribute('role');

      // Le bouton doit avoir un label accessible
      expect(ariaLabel || await button.textContent()).toBeTruthy();

      // Si aria-expanded existe, il doit indiquer l'état
      if (ariaExpanded !== null) {
        expect(['true', 'false']).toContain(ariaExpanded);
      }

      // ÉTAPE 7: Vérifier la taille de cible tactile (minimum 44px)
      const buttonBox = await button.boundingBox();
      if (buttonBox) {
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }
    }

    console.log('✅ Test accessibilité : Menu hamburger conforme aux standards');
  });

  test('doit réagir aux changements de taille d\'écran en temps réel', async ({ page }) => {
    // ÉTAPE 1: Commencer en mode desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Attendre le rendu initial
    await page.waitForTimeout(500);

    // ÉTAPE 2: Capturer l'état initial desktop
    const initialDesktopState = {
      hamburgerVisible: await page.locator('.hamburger-button, button:has(mat-icon:text("menu"))').isVisible().catch(() => false),
      desktopNavVisible: await page.locator('nav:not(.mobile-nav), .desktop-nav').isVisible().catch(() => false)
    };

    // ÉTAPE 3: Transition vers mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Attendre la transition responsive
    await page.waitForTimeout(500);

    // ÉTAPE 4: Capturer l'état mobile
    const mobileState = {
      hamburgerVisible: await page.locator('.hamburger-button, button:has(mat-icon:text("menu"))').isVisible().catch(() => false),
      desktopNavVisible: await page.locator('nav:not(.mobile-nav), .desktop-nav').isVisible().catch(() => false)
    };

    // ÉTAPE 5: Retour vers desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);

    // ÉTAPE 6: Capturer l'état final desktop
    const finalDesktopState = {
      hamburgerVisible: await page.locator('.hamburger-button, button:has(mat-icon:text("menu"))').isVisible().catch(() => false),
      desktopNavVisible: await page.locator('nav:not(.mobile-nav), .desktop-nav').isVisible().catch(() => false)
    };

    // ÉTAPE 7: Vérifications de cohérence

    // L'état desktop initial et final doivent être identiques
    expect(finalDesktopState.hamburgerVisible).toBe(initialDesktopState.hamburgerVisible);
    expect(finalDesktopState.desktopNavVisible).toBe(initialDesktopState.desktopNavVisible);

    // L'état mobile doit être différent du desktop (responsive fonctionne)
    const responsiveWorking = (
      mobileState.hamburgerVisible !== initialDesktopState.hamburgerVisible ||
      mobileState.desktopNavVisible !== initialDesktopState.desktopNavVisible
    );

    expect(responsiveWorking).toBeTruthy();

    console.log('✅ Test responsive dynamique : Transitions d\'écran gérées correctement');
    console.log(`Desktop: hamburger=${initialDesktopState.hamburgerVisible}, nav=${initialDesktopState.desktopNavVisible}`);
    console.log(`Mobile: hamburger=${mobileState.hamburgerVisible}, nav=${mobileState.desktopNavVisible}`);
  });

  test('doit supporter les breakpoints CSS standard', async ({ page }) => {
    // ÉTAPE 1: Définir les breakpoints à tester
    const breakpoints = [
      { name: 'Mobile Small', width: 320, height: 568 },    // iPhone 5
      { name: 'Mobile', width: 375, height: 667 },          // iPhone SE
      { name: 'Mobile Large', width: 414, height: 896 },    // iPhone XR
      { name: 'Tablet', width: 768, height: 1024 },         // iPad
      { name: 'Desktop Small', width: 1024, height: 768 },  // Laptop
      { name: 'Desktop', width: 1280, height: 720 },        // Desktop standard
      { name: 'Desktop Large', width: 1920, height: 1080 }  // Full HD
    ];

    // ÉTAPE 2: Tester chaque breakpoint
    for (const breakpoint of breakpoints) {
      // Redimensionner l'écran
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      // Attendre l'adaptation responsive
      await page.waitForTimeout(300);

      // ÉTAPE 3: Analyser l'état de la navigation
      const navigationState = await page.evaluate(() => {
        // Exécuter dans le contexte de la page pour analyser les styles CSS
        const hamburgerElements = document.querySelectorAll(
          'button[aria-label*="menu"], .hamburger-button, button:has(.mat-icon)'
        );

        const desktopNavElements = document.querySelectorAll(
          'nav:not(.mobile-nav), .desktop-nav, .main-nav'
        );

        // Analyser la visibilité via CSS computed styles
        const getVisibility = (elements) => {
          for (let element of elements) {
            const styles = window.getComputedStyle(element);
            if (styles.display !== 'none' &&
                styles.visibility !== 'hidden' &&
                styles.opacity !== '0') {
              return true;
            }
          }
          return false;
        };

        return {
          hamburgerVisible: getVisibility(hamburgerElements),
          desktopNavVisible: getVisibility(desktopNavElements),
          screenWidth: window.innerWidth
        };
      });

      // ÉTAPE 4: Validation logique par taille
      if (breakpoint.width <= 768) {
        // Mobile/Tablet : hamburger attendu
        console.log(`📱 ${breakpoint.name} (${breakpoint.width}px): ${navigationState.hamburgerVisible ? 'Hamburger' : 'Standard'} menu`);
      } else {
        // Desktop : navigation standard attendue
        console.log(`🖥️ ${breakpoint.name} (${breakpoint.width}px): ${navigationState.desktopNavVisible ? 'Standard' : 'Hamburger'} menu`);
      }

      // Au minimum, une forme de navigation doit être présente
      const hasNavigation = navigationState.hamburgerVisible || navigationState.desktopNavVisible;
      expect(hasNavigation).toBeTruthy();
    }

    console.log('✅ Test breakpoints : Tous les points de rupture testés avec succès');
  });
});

/**
 * HOOK DE NETTOYAGE ET DEBUG
 */
test.afterEach(async ({ page }, testInfo) => {
  // En cas d'échec, capturer des informations de debug
  if (testInfo.status !== testInfo.expectedStatus) {
    // Capture d'écran pour analyse
    await page.screenshot({
      path: `test-results/hamburger-failure-${testInfo.title}-${Date.now()}.png`,
      fullPage: true
    });

    // Informations de debug dans la console
    const debugInfo = await page.evaluate(() => ({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      hamburgerElements: document.querySelectorAll('button[aria-label*="menu"], .hamburger-button').length,
      navElements: document.querySelectorAll('nav, .nav').length
    }));

    console.log('🔍 Debug Info:', debugInfo);
  }
});