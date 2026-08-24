export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  accessExpiresIn: '15m' as const,
};
