import { IsString } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  firebaseToken: string;
}
