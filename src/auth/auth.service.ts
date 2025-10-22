import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existing = await this.db.candidate.findUnique({ where: { email } });
    console.log('existing', existing);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const candidate = await this.db.candidate.findUnique({ where: { email } });
    if (!candidate) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(candidate.id, candidate.email);
    return { candidate, token };
  }

  async socialLogin(firebaseToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const { email, name, uid } = decodedToken;

      const [firstName, lastName] = name?.split(' ') ?? ['Social', 'User'];

      let candidate = await this.db.candidate.findUnique({ where: { email } });

      if (!candidate) {
        candidate = await this.db.candidate.create({
          data: {
            email,
            password: uid, // You may store Firebase UID as a reference
            firstName,
            lastName,
          },
        });
      }

      const token = this.generateToken(candidate.id, candidate.email);
      return { candidate, token };
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid social token');
    }
  }

  private generateToken(id: string, email: string) {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async logout(token: string) {
    // For stateless JWT, just log it or implement blacklist here
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // match your sign secret
      console.log(`Candidate ${decoded['email']} logged out.`);
    } catch (err) {
      console.log('Invalid token on logout.');
    }

    return { message: 'Logged out' };
  }
}
