import { describe, expect, it } from "vitest";

import { formatCnpj, isValidCnpj, onlyDigits } from "./cnpj";

describe("isValidCnpj", () => {
  it("aceita CNPJs válidos", () => {
    expect(isValidCnpj("19131243000197")).toBe(true);
    expect(isValidCnpj("00.000.000/0001-91")).toBe(true);
  });

  it("rejeita CNPJ com dígito verificador errado", () => {
    expect(isValidCnpj("19131243000198")).toBe(false);
  });

  it("rejeita CNPJ com menos de 14 dígitos", () => {
    expect(isValidCnpj("1913124300019")).toBe(false);
  });

  it("rejeita CNPJ com todos os dígitos iguais", () => {
    expect(isValidCnpj("11111111111111")).toBe(false);
  });
});

describe("formatCnpj", () => {
  it("aplica a máscara 00.000.000/0000-00", () => {
    expect(formatCnpj("19131243000197")).toBe("19.131.243/0001-97");
  });

  it("formata enquanto o usuário digita", () => {
    expect(formatCnpj("191312")).toBe("19.131.2");
    expect(formatCnpj("191312430001")).toBe("19.131.243/0001");
  });
});

describe("onlyDigits", () => {
  it("remove pontuação", () => {
    expect(onlyDigits("19.131.243/0001-97")).toBe("19131243000197");
  });
});
