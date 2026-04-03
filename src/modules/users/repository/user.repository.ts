import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindManyOptions,
    FindOneOptions,
    Repository,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { UserRegisterDto } from '../dtos/user-register.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) {}

    async createUser(userRegisterDto: UserRegisterDto) {
        const id = uuidv4();
        const user = await this.repo.save(
            this.repo.create({ ...{ id }, ...userRegisterDto }),
        );
        user.create();
        return user;
    }

    async updateUser(userDto) {
        await this.repo.update({ id: userDto.id }, userDto);
        const updatedUser = await this.repo.findOne({
            where: { id: userDto.id },
        });
        updatedUser.update();
        return updatedUser;
    }

    async deleteUser(_userDto) {
        // Todo
        const user = new User();
        user.delete();
        return user;
    }

    async welcomeUser(userDto) {
        // Todo
        const user = await this.repo.findOne({ where: { id: userDto.id } });
        user.welcome();
        return user;
    }

    async findOne(options: FindOneOptions<User>) {
        return this.repo.findOne(options);
    }

    async find(options?: FindManyOptions<User>) {
        return this.repo.find(options);
    }
}
