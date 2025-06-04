// Em: src/admin-panel/auth/auth.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Permitir que requisições OPTIONS passem diretamente para o CORS preflight
    if (req.method === 'OPTIONS') {
      return next();
    }

    // 2. Definir rotas públicas
    const publicRoutes = [
      { path: '/job-application', method: 'POST' },
      { path: '/jobs/get-job-positions', method: 'GET' },
      // Para rotas com parâmetros como /jobs/get-job/:id, precisamos de uma correspondência mais flexível.
      // Esta regex corresponderá a /jobs/get-job/ seguido por um ou mais dígitos.
      { pathPattern: /^\/jobs\/get-job\/\d+$/, method: 'GET' },
      // Adicione aqui outras rotas que devam ser públicas.
      // Ex: Se a rota raiz do AppController @Get('cu') também devesse ser pública:
      // { path: '/cu', method: 'GET' } 
    ];

    // Verifica se a requisição atual corresponde a alguma rota pública
    for (const route of publicRoutes) {
      if (route.path && req.path === route.path && req.method === route.method) {
        return next(); // Pula a autenticação para esta rota
      }
      if (route.pathPattern && route.pathPattern.test(req.path) && req.method === route.method) {
        return next(); // Pula a autenticação para esta rota que corresponde ao padrão
      }
    }

    // 3. Lógica de autenticação para todas as outras rotas (protegidas)
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header for protected route');
    }

    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic' || !credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const decoded = Buffer.from(credentials, 'base64').toString();
      const [username, password] = decoded.split(':');

      // ATENÇÃO: Use variáveis de ambiente para estas credenciais em produção!
      // Ex: if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD)
      if (username === 'admin' && password === 'senha123') {
        return next();
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials format');
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}