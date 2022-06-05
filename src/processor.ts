import { S3Event, S3Handler } from "aws-lambda";
import { Container } from "typedi";
import { CsvRecordImportService } from "../src/services/csv-record-import-service";

import S3 from "aws-sdk/clients/s3";
import winston from "winston";

const processor: S3Handler = async (event: S3Event) => {
  winston.info(`Received Event on' + ${JSON.stringify(event)}`);

  const csvImportService = Container.get(CsvRecordImportService);

  for (const record of event.Records) {
    const key: string = record.s3.object.key;
    winston.info(`Processing S3 object with key: ${key}`);
    winston.info(record);

    const s3: S3 = new S3({
      apiVersion: "2022-06-04",
      region: process.env.AWS_REGION,
    });

    await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .promise()
      .then((data) => {
        winston.info(`Data: ${data.Body.toString()}`);
      });

    const stream = await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .createReadStream();
    await csvImportService.import(stream);
  }
};

export default processor;
