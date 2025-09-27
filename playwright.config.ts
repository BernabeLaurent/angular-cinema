/**
 * Configuration Playwright pour Tests E2E - Angular Cinema
 * Playwright E2E Tests Configuration - Angular Cinema
 *
 * @description Configuration sécurisée pour tests bout en bout conformes REAC
 * @description Secure configuration for REAC-compliant end-to-end tests
 *
 * @security Tests de sécurité intégrés (XSS, CSRF, validation)
 * @accessibility Tests d'accessibilité RGAA automatisés
 * @responsive Tests multi-navigateurs et multi-écrans
 *
 * @author Generated with Claude Code
 * @date 2025-09-27
 * @version 1.0.0
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour conformité REAC
 * Playwright configuration for REAC compliance
 */
export default defineConfig({
  // Dossier des tests E2E / E2E tests folder
  testDir: './e2e',

  // Timeout global des tests / Global test timeout
  timeout: 30000,

  // Configuration des assertions / Assertions configuration
  expect: {
    // Timeout pour les assertions / Assertion timeout
    timeout: 10000,
  },

  // Exécution des tests / Test execution
  fullyParallel: true, // Tests en parallèle pour performance
  forbidOnly: !!process.env.CI, // Interdire .only en CI
  retries: process.env.CI ? 2 : 0, // Retry automatique en CI
  workers: process.env.CI ? 1 : undefined, // Workers limités en CI

  // Rapports de tests / Test reports
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['line'], // Affichage console
  ],

  // Configuration globale / Global configuration
  use: {
    // URL de base de l'application / Application base URL
    baseURL: 'http://localhost:4200',

    // Navigation et timeouts / Navigation and timeouts
    actionTimeout: 15000,
    navigationTimeout: 15000,

    // Captures d'écran et vidéos / Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Configuration navigateur / Browser configuration
    locale: 'fr-FR', // Tests en français
    timezoneId: 'Europe/Paris',

    // Sécurité et permissions / Security and permissions
    permissions: [], // Aucune permission par défaut
    bypassCSP: false, // Respecter la CSP

    // Headers HTTP pour tests sécurisés / HTTP headers for secure tests
    extraHTTPHeaders: {
      'X-Test-Environment': 'e2e',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  },

  // Projets de tests multi-navigateurs / Multi-browser test projects
  projects: [
    /**
     * TESTS DESKTOP / DESKTOP TESTS
     */
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Tests d'accessibilité activés / Accessibility tests enabled
        contextOptions: {
          reducedMotion: 'reduce', // Test avec animation réduite
        },
      },
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    /**
     * TESTS MOBILE / MOBILE TESTS
     */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // Tests responsifs / Responsive tests
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        isMobile: true,
        hasTouch: true,
      },
    },

    /**
     * TESTS TABLETTE / TABLET TESTS
     */
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },

    /**
     * TESTS ACCESSIBILITÉ / ACCESSIBILITY TESTS
     */
    {
      name: 'accessibility-test',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Configuration spéciale pour accessibilité
        contextOptions: {
          forcedColors: 'active', // Test contraste élevé
          reducedMotion: 'reduce', // Animation réduite
        },
      },
      testMatch: '**/accessibility/**/*.spec.ts',
    },
  ],

  // Configuration du serveur de développement / Dev server configuration
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes pour démarrage Angular

    // Variables d'environnement pour tests / Environment variables for tests
    env: {
      NODE_ENV: 'test',
      NG_TEST_MODE: 'e2e',
    },
  },

  // Configuration des dossiers / Folder configuration
  outputDir: 'test-results/',
  snapshotDir: './e2e/snapshots/',
});