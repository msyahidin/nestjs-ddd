
import { UserDto } from '../../dtos/user.dto';

export class UserAbstractEvent {
    constructor(public readonly userDto: UserDto) {}
    get streamName() {
        return `users-${this.userDto.id}`;
    }
}
