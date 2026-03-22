import { z } from 'zod'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  const valid = { email: 'user@example.com', password: 'secret123' }

  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a missing email', () => {
    const result = loginSchema.safeParse({ ...valid, email: '' })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.email).toBeDefined()
  })

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.email).toContain(
      'Invalid email address'
    )
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ ...valid, password: '' })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.password).toContain(
      'Password is required'
    )
  })

  it('accepts any non-empty password (no length requirement on login)', () => {
    expect(loginSchema.safeParse({ ...valid, password: 'x' }).success).toBe(
      true
    )
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securepass',
    confirmPassword: 'securepass',
  }

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'J' })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.name).toContain(
      'Name must be at least 2 characters'
    )
  })

  it('accepts a name with exactly 2 characters', () => {
    expect(
      registerSchema.safeParse({ ...valid, name: 'Jo' }).success
    ).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad-email' })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.email).toContain(
      'Invalid email address'
    )
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.password).toContain(
      'Password must be at least 8 characters'
    )
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'differentpass',
    })
    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.confirmPassword).toContain(
      'Passwords do not match'
    )
  })

  it('accepts passwords that are exactly 8 characters', () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: '12345678',
        confirmPassword: '12345678',
      }).success
    ).toBe(true)
  })
})
