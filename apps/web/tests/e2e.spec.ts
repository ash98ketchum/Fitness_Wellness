import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Fitness & Wellness E2E Verification', () => {
  // Increase timeout as we are simulating human interactions
  test.setTimeout(60000);

  test('should navigate through the entire flow and capture screenshots', async ({ page }) => {
    // Navigate to the Splash Screen / Landing Page
    await page.goto('http://localhost:5173/');
    
    // Give time for animations to run
    await page.waitForTimeout(2000);
    
    // Screenshot: Landing Page
    await page.screenshot({ path: 'tests/screenshots/1-landing-page.png', fullPage: true });

    // Navigate to Signup
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    await page.waitForURL('**/signup');
    await page.waitForTimeout(1000);
    
    // Screenshot: Signup Page
    await page.screenshot({ path: 'tests/screenshots/2-signup-page.png', fullPage: true });

    // Fill out Signup Form
    await page.fill('input[placeholder="John Doe"]', 'Jane Smith');
    await page.fill('input[type="email"]', 'jane.test@example.com');
    
    // There are two password fields, one for password, one for confirm
    const passInputs = await page.locator('input[type="password"]');
    await passInputs.nth(0).fill('Password123!');
    await passInputs.nth(1).fill('Password123!');
    
    // Screenshot: Filled Signup
    await page.screenshot({ path: 'tests/screenshots/3-signup-filled.png' });
    
    // Submit Signup -> goes to Onboarding
    await page.getByRole('button', { name: /Create Account/i }).click();
    await page.waitForURL('**/onboarding');
    await page.waitForTimeout(1000);

    // Screenshot: Onboarding Step 1
    await page.screenshot({ path: 'tests/screenshots/4-onboarding-step1.png', fullPage: true });

    // Fill out Onboarding Step 1
    const ageInputs = await page.locator('input[type="number"]');
    await ageInputs.nth(0).fill('28'); // Age
    await ageInputs.nth(1).fill('165'); // Weight
    await ageInputs.nth(2).fill('170'); // Height
    
    await page.screenshot({ path: 'tests/screenshots/5-onboarding-step1-filled.png' });
    
    // Next Step
    await page.getByRole('button', { name: /Continue/i }).first().click();
    await page.waitForTimeout(500);

    // Screenshot: Onboarding Step 2
    await page.screenshot({ path: 'tests/screenshots/6-onboarding-step2.png', fullPage: true });

    // Assuming we can click a card for goal. 
    // The onboarding step 2 in web might be Cards for Muscle Gain, Fat Loss, etc.
    const goalCard = page.locator('text=Fat Loss').first();
    if (await goalCard.isVisible()) {
      await goalCard.click();
    }
    
    // Submit Onboarding Step 2
    await page.getByRole('button', { name: /Continue/i }).first().click();
    await page.waitForTimeout(500);

    // Submit Step 3
    await page.getByRole('button', { name: /Continue/i }).first().click();
    await page.waitForTimeout(500);
    
    // Submit Step 4
    await page.getByRole('button', { name: /Continue/i }).first().click();
    await page.waitForTimeout(500);
    
    // Submit Step 5
    await page.getByRole('button', { name: /Generate Plan/i }).first().click();
    
    // Wait for Generating Screen to pass and land on Dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Screenshot: Dashboard
    await page.screenshot({ path: 'tests/screenshots/7-dashboard.png', fullPage: true });

    // Go to Planner
    await page.getByText('Meals').click();
    await page.waitForURL('**/planner');
    await page.waitForTimeout(1000);

    // Screenshot: Planner
    await page.screenshot({ path: 'tests/screenshots/8-planner.png', fullPage: true });
    
    // Wait slightly to ensure all network requests finish rendering
    await page.waitForTimeout(1000);
  });
});
