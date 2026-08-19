import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/service';
import { DatabaseError, QueryResultRow } from 'pg';
import { UserDTO } from '../dto/dtoModels';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

interface UserModel extends QueryResultRow {
  id: string;
  email: string;
  passwordHash: string;
}

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async registration(dto: UserDTO): Promise<UserModel> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      const result = await this.dbService.query<UserModel>(
        `INSERT INTO users (email, password_hash)
                VALUES ($1, $2)
                RETURNING id, email
                `,
        [dto.email, passwordHash],
      );

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505')
        throw new ConflictException(`User with this email already exists`);
      throw error;
    }
  }

  async login(dto: UserDTO) {
    const result = await this.dbService.query<UserModel>(
      `SELECT id, email, password_hash AS "passwordHash"
            FROM users
            WHERE lower(email) = lower($1)
            `,
      [dto.email],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundException(`Invalid email or password`);

    const passwordEqual = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordEqual)
      throw new UnauthorizedException(`Invalid email or password`);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
