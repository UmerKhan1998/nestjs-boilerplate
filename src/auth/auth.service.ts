import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { generateTokens } from 'utils/token';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(createAuthDto: CreateAuthDto, res) {
    const { username, email, password } = createAuthDto;

    // 🔍 Check for existing user
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧑‍💻 Create new user
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      refreshToken: '',
    });

    const { accessToken, refreshToken } = generateTokens(
      newUser?._id?.toString(),
    );

    newUser['refreshToken'] = refreshToken;

    await newUser.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Return safe response (without password)
    return {
      success: true,
      message: 'User registered successfully',
      accessToken,
    };
  }

  async login(createAuthDto: CreateAuthDto, res, req) {
    // const refreshToken = req.cookies?.refreshToken;
    // console.log('refreshToken', refreshToken);

    const { email, password } = createAuthDto;

    const newUser = await this.userModel.findOne({ email });
    if (!newUser) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, newUser.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = generateTokens(
      newUser?._id?.toString(),
    );

    newUser['refreshToken'] = refreshToken;

    // 🧾 Generate JWT
    // const payload = user; // Simplified for this example
    // const token = await this.jwtService.signAsync(user);
    // console.log('User logged in successfully:', token);

    // send refresh token as secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      success: true,
      message: 'Login successful',
      user: accessToken,
    };
  }

  async validateUser(payload: any) {
    return this.userModel.findById(payload._id).select('-password');
  }
}
