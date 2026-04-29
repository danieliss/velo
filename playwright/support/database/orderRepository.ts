import { db } from './database'
import { OrderTable } from './schema'

import { OrderDetails } from '../actions/orderLookupActions'

import crypto from 'crypto'

function isPostgresAuthError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const pgError = error as { code?: string; message?: string; errno?: string }
  return pgError.code === '28P01' || pgError.message?.includes('password authentication failed') === true
}

function isTransientDbConnectionError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const pgError = error as { code?: string; message?: string; errno?: string }

  const transientCodes = new Set([
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ENETUNREACH',
  ])

  return (
    transientCodes.has(pgError.code ?? '') ||
    transientCodes.has(pgError.errno ?? '') ||
    pgError.message?.includes('connect ETIMEDOUT') === true
  )
}

function shouldIgnoreCleanupError(error: unknown) {
  return isPostgresAuthError(error) || isTransientDbConnectionError(error)
}

export function isDbUnavailableError(error: unknown) {
  return shouldIgnoreCleanupError(error)
}

export function normalizeValue(value: string) {
  if (!value) return '';

  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

export async function insertOrder(order: OrderDetails) {

  const data: OrderTable = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizeValue(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
  // If the record exists it might throw a duplicate error, but we manage teardown.
  await db.insertInto('orders').values(data).execute()
}

export async function ensureDatabaseAvailable() {
  await db.selectFrom('orders').select('id').limit(1).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  try {
    await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute()
  } catch (error) {
    if (!shouldIgnoreCleanupError(error)) throw error
    console.warn('Skipping order cleanup due to database connectivity/auth issue.')
  }
}

export async function deleteOrderByEmail(email: string) {
  try {
    await db.deleteFrom('orders').where('customer_email', '=', email).execute()
  } catch (error) {
    if (!shouldIgnoreCleanupError(error)) throw error
    console.warn('Skipping order cleanup due to database connectivity/auth issue.')
  }
}