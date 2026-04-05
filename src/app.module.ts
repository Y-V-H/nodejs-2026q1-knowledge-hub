import { Module } from '@nestjs/common';
import { UserModule } from './users/user.modules';

@Module({
  imports: [UserModule],
})
export class AppModule {}
