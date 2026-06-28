/**
 * Cliente AbacatePay (server-only). Docs: https://docs.abacatepay.com
 *
 * Não importar em Client Components — usa `ABACATEPAY_API_KEY` (segredo).
 */
const API_BASE = 'https://api.abacatepay.com'

function apiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY
  if (!key) throw new Error('ABACATEPAY_API_KEY ausente')
  return key
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    const msg = json?.error || `AbacatePay ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : 'Falha no AbacatePay')
  }
  return json.data as T
}

interface AbacateCheckout {
  id: string
  url: string
  status: string
}

/** Cria/garante um cliente no AbacatePay e retorna o id (cust_...). */
export async function createCustomer(input: {
  name: string
  email: string
}): Promise<{ id: string }> {
  return post<{ id: string }>('/v2/customers/create', input)
}

/** Checkout avulso (PIX e/ou cartão) — pagamento único. */
export async function createCheckout(input: {
  productId: string
  customerId?: string
  externalId: string
  userId: string
  methods?: ('PIX' | 'CARD')[]
  returnUrl: string
  completionUrl: string
}): Promise<AbacateCheckout> {
  return post<AbacateCheckout>('/v2/checkouts/create', {
    items: [{ id: input.productId, quantity: 1 }],
    customerId: input.customerId,
    externalId: input.externalId,
    methods: input.methods ?? ['PIX', 'CARD'],
    returnUrl: input.returnUrl,
    completionUrl: input.completionUrl,
    metadata: { userId: input.userId, kind: 'pro_onetime' },
  })
}

interface AbacatePixCharge {
  id: string
  amount: number
  status: string
  brCode: string
  brCodeBase64: string
  expiresAt?: string
}

/**
 * Cobrança PIX de valor customizado (endpoint "transparent"). Único caminho do
 * AbacatePay para um valor arbitrário (não atrelado a produto), usado no Plano
 * Turma. Retorna o copia-e-cola (`brCode`) e o QR em base64. A confirmação vem
 * pelo webhook; a duração/vagas viajam em `externalId`/`metadata`.
 */
export async function createPixCharge(input: {
  amountCents: number
  description: string
  externalId: string
  userId: string
  kind: string
  expiresInSeconds?: number
  customer?: { name: string; email: string }
}): Promise<AbacatePixCharge> {
  return post<AbacatePixCharge>('/v2/transparents/create', {
    method: 'PIX',
    data: {
      amount: input.amountCents,
      expiresIn: input.expiresInSeconds ?? 60 * 60 * 24, // 24h
      description: input.description,
      externalId: input.externalId,
      ...(input.customer ? { customer: input.customer } : {}),
      metadata: { userId: input.userId, kind: input.kind, externalId: input.externalId },
    },
  })
}

/** Assinatura recorrente (somente cartão). O produto deve ter ciclo mensal. */
export async function createSubscription(input: {
  productId: string
  customerId?: string
  externalId: string
  userId: string
  returnUrl: string
  completionUrl: string
}): Promise<AbacateCheckout> {
  return post<AbacateCheckout>('/v2/subscriptions/create', {
    items: [{ id: input.productId, quantity: 1 }],
    customerId: input.customerId,
    externalId: input.externalId,
    methods: ['CARD'],
    returnUrl: input.returnUrl,
    completionUrl: input.completionUrl,
    metadata: { userId: input.userId, kind: 'pro_subscription' },
  })
}
