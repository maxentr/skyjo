import { expect, test } from "@playwright/test"

test("check if the language settings are working", async ({ page }) => {
  await page.goto("http://localhost:3000/")
  const languageSettingsButton = page.getByTestId("language-settings-button")
  await languageSettingsButton.click()

  const enButton = page.getByTestId("language-settings-en")
  expect(await enButton.getAttribute("data-state")).toBe("checked")

  const frButton = page.getByTestId("language-settings-fr")
  await frButton.click()

  await page.waitForURL("http://localhost:3000/fr")
  expect(page.url()).toBe("http://localhost:3000/fr")

  languageSettingsButton.click()
  expect(await frButton.getAttribute("data-state")).toBe("checked")
})
