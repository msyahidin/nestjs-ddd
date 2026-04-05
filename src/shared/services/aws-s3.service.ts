import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';

import { ConfigService } from './config.service';
import { GeneratorService } from './generator.service';
import { IFile } from '../../interfaces/IFile';

@Injectable()
export class AwsS3Service {
    private readonly _s3: S3Client;

    constructor(
        public configService: ConfigService,
        public generatorService: GeneratorService,
    ) {
        const awsS3Config = configService.awsS3Config;
        this._s3 = new S3Client({
            region: 'eu-central-1', // TODO: update those configs
            ...(awsS3Config.accessKeyId &&
                awsS3Config.secretAccessKey && {
                    credentials: {
                        accessKeyId: awsS3Config.accessKeyId,
                        secretAccessKey: awsS3Config.secretAccessKey,
                    },
                }),
        });
    }

    async uploadImage(file: IFile) {
        const fileName = this.generatorService.fileName(
            mime.extension(file.mimetype) as string,
        );
        const key = 'images/' + fileName;
        await this._s3.send(
            new PutObjectCommand({
                Bucket: this.configService.awsS3Config.bucketName,
                Body: file.buffer,
                ACL: 'public-read',
                Key: key,
            }),
        );

        return key;
    }
}
