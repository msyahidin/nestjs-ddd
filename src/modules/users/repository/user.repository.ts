import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { UserRegisterDto } from '../dtos/user-register.dto';
import { User } from '../entities/user.entity';

export class UserRepository extends Repository<User> {
    async createUser(userRegisterDto: UserRegisterDto) {
        const id = uuidv4();
        const user = await this.save(
            super.create({ ...{ id }, ...userRegisterDto }),
        );
        user.create();
        return user;
    }

    async updateUser(userDto) {
        const updateResult = await super.update({ id: userDto.id }, userDto);
        const updatedUser = await super.findOne(userDto);
        updatedUser.update();
        return updatedUser;
    }

    async deleteUser(userDto) {
        // Todo
        const user = new User();
        user.delete();
        return user;
    }

    async welcomeUser(userDto) {
        // Todo
        const user = await super.findOne(userDto);
        user.welcome();
        return user;
    }
}
