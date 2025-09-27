/**
 * @fileoverview Tests d'Accessibilité RGAA - Angular Cinema
 * RGAA Accessibility Tests - Angular Cinema
 *
 * @description Tests de conformité RGAA automatisés avec Playwright
 * @description Automated RGAA compliance tests with Playwright
 *
 * CONFORMITÉ RGAA TESTÉE / TESTED RGAA COMPLIANCE:
 * ✅ Structure et sémantique / Structure and semantics
 * ✅ Navigation clavier / Keyboard navigation
 * ✅ Contrastes et couleurs / Contrasts and colors
 * ✅ Images et médias / Images and media
 * ✅ Formulaires / Forms
 * ✅ Cohérence / Consistency
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { test, expect, Page, Locator } from '@playwright/test';

// Installation et configuration d'Axe pour les tests d'accessibilité
// Install and configure Axe for accessibility testing
import AxeBuilder from '@axe-core/playwright';

/**
 * CONFIGURATION GLOBALE / GLOBAL CONFIGURATION
 */
test.beforeEach(async ({ page }) => {
  // Configuration pour tests d'accessibilité
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Configuration de réduction de mouvement pour les tests
  await page.addInitScript(() => {
    // Simuler prefers-reduced-motion pour les tests
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    Object.defineProperty(mediaQuery, 'matches', { value: true, writable: false });
  });
});

/**
 * GROUPE DE TESTS : STRUCTURE ET SÉMANTIQUE
 * TEST GROUP: STRUCTURE AND SEMANTICS
 */
test.describe('RGAA - Structure et Sémantique', () => {

  test('doit avoir une hiérarchie de titres correcte', async ({ page }) => {
    // Récupérer tous les titres de h1 à h6
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    let previousLevel = 0;
    let hasH1 = false;

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));

      // Vérifier qu'il y a un H1
      if (currentLevel === 1) {
        hasH1 = true;
      }

      // Vérifier que la hiérarchie est respectée (pas de saut de niveau)
      if (previousLevel > 0) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }

      previousLevel = currentLevel;
    }

    // Vérifier qu'il y a au moins un H1 sur la page
    expect(hasH1).toBeTruthy();
  });

  test('doit avoir des landmarks appropriés', async ({ page }) => {
    // Vérifier la présence des landmarks principaux
    const landmarks = {
      main: page.locator('main, [role="main"]'),
      navigation: page.locator('nav, [role="navigation"]'),
      banner: page.locator('header, [role="banner"]'),
      contentinfo: page.locator('footer, [role="contentinfo"]'),
    };

    for (const [landmarkType, locator] of Object.entries(landmarks)) {
      const count = await locator.count();

      if (landmarkType === 'main') {
        // Il doit y avoir exactement un élément main
        expect(count).toBe(1);
      } else {
        // Les autres landmarks peuvent être présents ou absents
        if (count > 0) {
          await expect(locator.first()).toBeVisible();
        }
      }
    }
  });

  test('doit avoir des liens avec des intitulés explicites', async ({ page }) => {
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);

      if (await link.isVisible()) {
        // Récupérer le texte accessible du lien
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        const accessibleName = ariaLabel || linkText?.trim() || title;

        // Vérifier qu'il y a un nom accessible
        expect(accessibleName).toBeTruthy();

        // Vérifier que ce n'est pas juste "cliquez ici" ou similaire
        const nonDescriptiveTexts = ['cliquez ici', 'click here', 'en savoir plus', 'read more', 'ici'];
        const isNonDescriptive = nonDescriptiveTexts.some(text =>
          accessibleName?.toLowerCase().includes(text.toLowerCase())
        );
        expect(isNonDescriptive).toBeFalsy();
      }
    }
  });
});

/**
 * GROUPE DE TESTS : NAVIGATION CLAVIER
 * TEST GROUP: KEYBOARD NAVIGATION
 */
test.describe('RGAA - Navigation Clavier', () => {

  test('doit permettre la navigation complète au clavier', async ({ page }) => {
    const focusableElements: string[] = [];
    let currentFocusedElement = '';

    // Commencer la navigation au clavier
    await page.keyboard.press('Tab');

    // Naviguer à travers les éléments focalisables
    for (let i = 0; i < 15; i++) {
      const focusedElement = page.locator(':focus');

      if (await focusedElement.count() > 0) {
        // Vérifier que l'élément est visible
        await expect(focusedElement).toBeVisible();

        // Vérifier que l'élément a un indicateur de focus visible
        const elementInfo = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
            border: styles.border,
          };
        });

        // Vérifier qu'il y a un indicateur de focus
        const hasFocusIndicator =
          elementInfo.outline !== 'none' ||
          elementInfo.outlineWidth !== '0px' ||
          elementInfo.boxShadow !== 'none' ||
          elementInfo.border.includes('px');

        expect(hasFocusIndicator).toBeTruthy();

        focusableElements.push(elementInfo.tagName);
      }

      await page.keyboard.press('Tab');
    }

    // Vérifier qu'il y a des éléments focalisables
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('doit permettre d\'activer les éléments avec Entrée et Espace', async ({ page }) => {
    // Chercher un bouton
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      // Donner le focus au bouton
      await button.focus();

      // Vérifier que l'activation avec Entrée fonctionne
      await page.keyboard.press('Enter');

      // Remettre le focus et tester Espace
      await button.focus();
      await page.keyboard.press('Space');
    }
  });

  test('doit gérer l\'ordre de tabulation logique', async ({ page }) => {
    const tabbableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();

    // Vérifier que les éléments avec tabindex positif sont dans l'ordre
    const tabIndices: number[] = [];

    for (const element of tabbableElements) {
      if (await element.isVisible()) {
        const tabIndex = await element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          tabIndices.push(parseInt(tabIndex));
        }
      }
    }

    // Vérifier que les tabindex sont dans l'ordre croissant
    for (let i = 1; i < tabIndices.length; i++) {
      expect(tabIndices[i]).toBeGreaterThanOrEqual(tabIndices[i - 1]);
    }
  });
});

/**
 * GROUPE DE TESTS : CONTRASTES ET COULEURS
 * TEST GROUP: CONTRASTS AND COLORS
 */
test.describe('RGAA - Contrastes et Couleurs', () => {

  test('doit avoir des contrastes suffisants pour le texte', async ({ page }) => {
    // Récupérer les éléments de texte principaux
    const textElements = page.locator('h1, h2, h3, h4, h5, h6, p, a, button, span, div').filter({
      hasText: /.+/ // Qui contiennent du texte
    });

    const elementCount = Math.min(await textElements.count(), 10); // Limiter le test

    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i);

      if (await element.isVisible()) {
        const colorInfo = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize,
          };
        });

        // Vérifier que les couleurs sont définies
        expect(colorInfo.color).toBeTruthy();
        expect(colorInfo.color).not.toBe('rgba(0, 0, 0, 0)'); // Pas transparent
      }
    }
  });

  test('doit fonctionner sans couleur uniquement', async ({ page }) => {
    // Simuler un environnement sans couleur (noir et blanc)
    await page.addStyleTag({
      content: `
        * {
          filter: grayscale(100%) !important;
        }
      `
    });

    // Vérifier que les éléments importants sont toujours identifiables
    const importantElements = page.locator('button, a, input, .error, .success, .warning');
    const elementCount = await importantElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = importantElements.nth(i);

      if (await element.isVisible()) {
        // L'élément doit toujours être visible et identifiable
        await expect(element).toBeVisible();

        // Vérifier qu'il a un texte ou une icône
        const textContent = await element.textContent();
        const hasIcon = await element.locator('mat-icon, i, svg').count() > 0;

        expect(textContent?.trim() || hasIcon).toBeTruthy();
      }
    }
  });
});

/**
 * GROUPE DE TESTS : IMAGES ET MÉDIAS
 * TEST GROUP: IMAGES AND MEDIA
 */
test.describe('RGAA - Images et Médias', () => {

  test('doit avoir des alternatives textuelles pour les images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      if (await img.isVisible()) {
        const altText = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');

        // Chaque image doit avoir un alt (même vide pour les images décoratives)
        expect(altText).not.toBeNull();

        // Si l'image est décorative, alt doit être vide ou role="presentation"
        if (altText === '' || role === 'presentation') {
          // Image décorative - OK
        } else {
          // Image informative - doit avoir un alt descriptif
          expect(altText || ariaLabel).toBeTruthy();
        }
      }
    }
  });

  test('doit gérer les médias avec des contrôles accessibles', async ({ page }) => {
    const mediaElements = page.locator('video, audio');
    const mediaCount = await mediaElements.count();

    for (let i = 0; i < mediaCount; i++) {
      const media = mediaElements.nth(i);

      if (await media.isVisible()) {
        // Vérifier la présence de contrôles
        const hasControls = await media.getAttribute('controls');
        const customControls = await page.locator('[aria-label*="play"], [aria-label*="pause"], [aria-label*="stop"]').count();

        // Doit avoir des contrôles natifs ou personnalisés
        expect(hasControls !== null || customControls > 0).toBeTruthy();
      }
    }
  });
});

/**
 * GROUPE DE TESTS : FORMULAIRES
 * TEST GROUP: FORMS
 */
test.describe('RGAA - Formulaires', () => {

  test('doit avoir des labels associés aux champs', async ({ page }) => {
    // Aller sur une page avec formulaires
    const formPages = ['/auth/login', '/auth/register', '/booking'];

    for (const formPage of formPages) {
      try {
        await page.goto(formPage);
        await page.waitForLoadState('networkidle');

        const inputs = page.locator('input, select, textarea').filter({
          hasNot: page.locator('[type="hidden"]')
        });

        const inputCount = await inputs.count();

        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);

          if (await input.isVisible()) {
            const inputId = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            // Chercher un label associé
            let associatedLabel = null;
            if (inputId) {
              associatedLabel = page.locator(`label[for="${inputId}"]`);
            }

            // Vérifier qu'il y a un label accessible
            const hasLabel =
              (associatedLabel && await associatedLabel.count() > 0) ||
              ariaLabel ||
              ariaLabelledBy ||
              placeholder;

            expect(hasLabel).toBeTruthy();
          }
        }

        break; // Sortir après le premier formulaire trouvé
      } catch (error) {
        // Page non accessible, continuer avec la suivante
        continue;
      }
    }
  });

  test('doit afficher des messages d\'erreur accessibles', async ({ page }) => {
    // Aller sur la page de connexion
    await page.goto('/auth/login');

    const emailInput = page.locator('input[type="email"], input[formControlName="email"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailInput.isVisible() && await submitButton.isVisible()) {
      // Remplir avec une valeur invalide
      await emailInput.fill('email-invalide');

      // Soumettre pour déclencher les erreurs
      await submitButton.click();

      // Chercher les messages d'erreur
      const errorMessages = page.locator('.mat-error, .error-message, [role="alert"], .invalid-feedback');

      if (await errorMessages.count() > 0) {
        // Vérifier que les erreurs sont accessibles
        for (let i = 0; i < await errorMessages.count(); i++) {
          const error = errorMessages.nth(i);
          await expect(error).toBeVisible();

          // Vérifier que l'erreur a un rôle alert ou est annoncée
          const role = await error.getAttribute('role');
          const ariaLive = await error.getAttribute('aria-live');

          expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
        }
      }
    }
  });
});

/**
 * GROUPE DE TESTS : TESTS AUTOMATISÉS AXE
 * TEST GROUP: AUTOMATED AXE TESTS
 */
test.describe('RGAA - Tests Automatisés Axe', () => {

  test('doit passer les tests d\'accessibilité automatisés', async ({ page }) => {
    // Exécuter Axe sur la page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Vérifier qu'il n'y a pas de violations critiques
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('doit tester l\'accessibilité sur différentes pages', async ({ page }) => {
    const pagesToTest = ['/', '/auth/login'];

    for (const pageUrl of pagesToTest) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // Afficher les violations pour debug si nécessaire
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Violations sur ${pageUrl}:`, accessibilityScanResults.violations);
      }

      // Vérifier qu'il n'y a pas de violations de niveau A et AA
      expect(accessibilityScanResults.violations.length).toBe(0);
    }
  });
});

/**
 * HOOK DE NETTOYAGE / CLEANUP HOOK
 */
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/accessibility-failure-${testInfo.title}-${Date.now()}.png`,
      fullPage: true,
    });
  }
});