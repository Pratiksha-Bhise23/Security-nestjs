import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';  // ADD THIS
import type { Response } from 'express';

@Controller('security-test')
export class SecurityTestController {

  @Public()   // 👈 MAKE THIS ROUTE PUBLIC
  @Get('xss')
  xssDemo(@Res() res: Response) {
    res.send(`
      <h1>XSS Attack Test</h1>
      <p>If Helmet is OFF → You should see an alert box.</p>
      <p>If Helmet is ON → Script will NOT execute.</p>

      <script>
        alert("🔥 XSS Attack Executed! You are vulnerable.");
      </script>
    `);
  }

  @Public()   // 👈 MAKE THIS ROUTE PUBLIC
  @Get('clickjacking')
  clickjackingDemo(@Res() res: Response) {
    res.send(`
      <h1>Clickjacking Test</h1>
      <p>This page should NOT load in an iframe when Helmet is enabled.</p>
    `);
  }

  @Public()   // 👈 MAKE THIS ROUTE PUBLIC
  @Get('mime-sniff')
  mimeDemo(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain');
    res.send('GIF89a');
  }

  @Public()   // 👈 MAKE THIS ROUTE PUBLIC
  @Get('csp')
  cspDemo(@Res() res: Response) {
    res.send(`
      <h1>CSP Test</h1>
      <script>alert("CSP FAILED — Inline script executed!")</script>
    `);
  }
}
