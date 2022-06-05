import { Service } from "typedi";
import { Category } from "../models/category.models";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import * as AWS from "aws-sdk";
import winston from "winston";

@Service()
export class DataRepository {
  protected tableName: string;
  protected dynamoDb: DocumentClient;

  constructor() {
    this.tableName = process.env.DYNAMODB_TABLE;
    this.dynamoDb = new AWS.DynamoDB.DocumentClient();
  }

  async upload(parsedData: Category[]) {
    winston.info(`Uploading ${parsedData.length} records to DynamoDB`);

    for (const item of parsedData) {
      if (item.PK.includes("CAT#")) {
        await this.handleCategoryItem(item);
      }
    }
  }

  async handleCategoryItem(item: Category) {
    let category = await this.getCategory(item);
    try {
      await this.dynamoDb
        .put(
          {
            TableName: this.tableName,
            Item: category,
            ConditionExpression: "attribute_not_exists(#code)",
            ExpressionAttributeNames: {
              "#code": "code",
            },
          },
          function (err, data) {
            if (err) {
              winston.error("Error adding item to database: ", err);
            } else {
              winston.info(data);
            }
          }
        )
        .promise();
    } catch (err) {
      if (err.code === "ConditionalCheckFailedException") {
        winston.info("Insert cancelled for category with code: " + item.code);
      }
    }
  }

  getCategory(item: Category) {
    let category = new Category();
    category.PK = item.PK;
    category.SK = item.SK;
    category.code = item.code;
    category.name = item.name;

    winston.info(category);
    return category;
  }
}
