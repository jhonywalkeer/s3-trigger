import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

winston.add(
  new WinstonCloudWatch({
    cloudWatchLogs: new AWS.CloudWatchLogs(),
    logGroupName: process.env.AWS_CLOUDWATCH_GROUP,
    logStreamName: process.env.AWS_CLOUDWATCH_STREAM,
  })
);
