import { IQuery } from '@nestjs/cqrs';
import { FindOptionsWhere } from 'typeorm';

import { User } from '../../entities/user.entity';

export class GetUserQuery implements IQuery {
    constructor(public readonly findData: FindOptionsWhere<User>) {}
}
