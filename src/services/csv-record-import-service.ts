import { Service } from "typedi";
import * as stream from "stream";
import * as csv from "@fast-csv/parse";
import { DataRepository } from "../repository/data.repository";
import winston from "winston";

@Service()
export class CsvRecordImportService {
  constructor(private dataRepository: DataRepository) {}

  /**
   * Process stream of csv file.
   *
   * @param csvStream
   */

  async import(csvStream: stream.Readable) {
    return new Promise((resolve, reject) => {
      const parsedData = [];
      csvStream
        .pipe(
          csv
            .parse({ headers: true, delimiter: ";" })
            .on("error", function (data) {
              winston.error(`Got an error: ${data}`);
              reject("Error parsing \n" + data);
            })
            .on("data", (data) => {
              parsedData.push(data);
            })
        )
        .on("end", async () => {
          if (parsedData.length > 0) {
            await this.dataRepository.upload(parsedData);
          } else {
            winston.info("No parsed data to upload");
          }
          resolve("done importing");
        });
    });
  }
}
