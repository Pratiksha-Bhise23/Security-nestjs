import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './api/user/user.module';
import { AdminModule } from './api/admin/admin.module';
import { SecurityTestModule } from './api/security-test/security-test.module';
import { CsrfModule } from './csrf/csrf.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    AdminModule,
    SecurityTestModule,
    CsrfModule,
  ],
})
export class AppModule {}
