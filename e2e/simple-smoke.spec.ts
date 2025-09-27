/**
 * @fileoverview Test E2E Simple - Smoke Test
 * Simple E2E Test - Smoke Test
 *
 * @description Test de base pour vérifier que Playwright fonctionne
 * @description Basic test to verify Playwright is working
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('Tests de Base - Smoke Tests', () => {

  test('doit charger la page d\'accueil avec succès', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');

    // Vérifier que la page se charge (titre réel de l'app)
    await expect(page).toHaveTitle(/Pathé - Cinéma|angular-cinema/i);

    // Vérifier qu'il y a du contenu
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ Test de base réussi - La page se charge correctement');
  });

  test('doit afficher au moins un élément Angular', async ({ page }) => {
    await page.goto('/');

    // Chercher des composants Angular
    const angularComponents = page.locator('[ng-version], app-root, app-navbar, app-hero-section');

    // Au moins un composant Angular doit être présent
    const componentCount = await angularComponents.count();
    expect(componentCount).toBeGreaterThan(0);

    console.log(`✅ ${componentCount} composant(s) Angular détecté(s)`);
  });

});