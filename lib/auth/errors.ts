const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed:
    "Confirme seu e-mail antes de entrar. Procure o link na sua caixa de entrada.",
  user_already_exists: "Já existe uma conta com este e-mail. Tente entrar.",
  email_exists: "Já existe uma conta com este e-mail. Tente entrar.",
  weak_password: "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.",
  email_address_invalid: "Este e-mail não é válido.",
  signup_disabled: "Novos cadastros estão desativados no momento.",
  over_request_rate_limit: "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.",
  over_email_send_rate_limit:
    "Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos e tente de novo.",
  mfa_verification_failed: "Código incorreto. Confira o app autenticador e tente de novo.",
  mfa_challenge_expired: "O código expirou. Digite o código que aparece agora no app.",
  mfa_factor_not_found: "Autenticador não encontrado. Configure o 2FA novamente.",
  session_not_found: "Sua sessão expirou. Entre novamente.",
};

const FALLBACK = "Algo deu errado. Tente de novo em instantes.";

export function authErrorMessage(error: { code?: string } | null | undefined) {
  if (!error?.code) return FALLBACK;
  return MESSAGES[error.code] ?? FALLBACK;
}
