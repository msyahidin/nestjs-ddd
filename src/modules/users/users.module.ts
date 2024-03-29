// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from './commands/handlers';
import { UsersController } from './controllers/users.controller';
import { EventHandlers } from './events/handlers';
// import { UsersResolver } from './graphql/users.resolver';
import { QueryHandlers } from './queries/handlers';
import { UserRepository } from './repository/user.repository';
import { UsersSagas } from './sagas/users.sagas';
import { UsersService } from './services/users.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
        CqrsModule,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        ...CommandHandlers,
        ...EventHandlers,
        ...QueryHandlers,
        UsersSagas,
        // UsersResolver, // GraphQL resolver
    ],
})
export class UsersModule {}
