import * as fs from 'fs';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ISwaggerConfigInterface } from '../../interfaces/swagger-config.interface';
import { ConfigService } from '../services/config.service';

export function setupSwagger(
    app: INestApplication,
    config: ISwaggerConfigInterface,
) {
    const configService = new ConfigService();
    const options = new DocumentBuilder()
        .setTitle(config.title)
        .setDescription(config.description)
        .setVersion(config.version)
        .addServer(configService.app.url)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);

    fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

    SwaggerModule.setup(config.path, app, document);
}
