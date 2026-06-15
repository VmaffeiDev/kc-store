import { expect, test } from "@playwright/test";

test("home presents the selected K&C STORE direction", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Estilo para todos os momentos/ })).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
  }
  await expect(page.getByRole("link", { name: "Masculino", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Destaques/ })).toBeVisible();
});

test("customer can add a product and open the cart", async ({ page }) => {
  await page.goto("/produto/camisa-linho-manga-longa");
  await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
  await page.getByRole("link", { name: /Carrinho com 1 itens/ }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(page.getByRole("link", { name: "Camisa Linho Manga Longa" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Finalizar compra" })).toBeVisible();
});

test("admin dashboard requires credentials", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/entrar\?callbackUrl=\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
