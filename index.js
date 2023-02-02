import fetch from "node-fetch";
import fs from "fs";
import { ConsoleLogColors } from "js-console-log-colors";
import mongoose from "mongoose";
import config from "./config/config.js";
import ExternalIncentive from "./models/external-gauges.js";
const out = new ConsoleLogColors();
out.command(
  "Fetch external incentive gauges from Osmosis API and update mongoDB..."
);

(async () => {
  // 1. Connect DB
  const response = await connectDB();
  if (!response) {
    return;
  }
  // 2. Fetch Externals...
  const data = await fetchExternals(config.SAVE_API_RESPONSE_TO_FILE);
  if (!!!data) {
    out.error("Data is empty");
    return;
  }

  // 3. Save to Database
  updateDB(data)
    .then((result) => {
      out.success("DB Response:");
      console.log(result);
      if (config.DEBUG) {
         if (result?.result?.upserted) {
          out.debug("upserted:");
          result.result.upserted.forEach((item) => {
            console.log(item);
          });
        } 
      }
    })
    .catch((error) => {
      out.error("Error updating DB:");
      console.log(error);
    })
    .finally(() => cleanUp());
})();

/**
 * Connect to database
 * @returns Promise - Database Connection
 */
async function connectDB() {
  const uri = `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_CLUSTER}/${config.DB_DATABASE}?retryWrites=true&w=majority`;

  // 1. connect application with database
  mongoose.set("strictQuery", false);
  return await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => true)
    .catch((err) => {
      out.error(err);
      return false;
    });
}

async function fetchExternals(boolSaveToFile) {
  try {
    out.info("Fetch external incentive gauges from Osmosis API...");
    const json = await fetch(`${config.API_QUERY_URL}`).then((res) =>
      res.json()
    );
    out.info("Data fetched from API!");
    if (boolSaveToFile) {
      try {
        fs.writeFileSync("externals.json", JSON.stringify(json));
        out.info("Saved to local file...");
      } catch (save_to_file_error) {
        out.error(save_to_file_error.message);
      }
    }

    // we are only interested in the data array from the response object:
    if (json.data) {
      return json.data;
    }
    // return undefined if there's an issue... (the calling code will handle this)
    return;
  } catch (general_error) {
    out.error(general_error.message);
    return;
  }
}

async function updateDB(data) {
  try {
    out.info("Preparing mongodb operations...");
    var operations = data.map((gauge) => {
      return {
        updateOne: {
          filter: { id: gauge.id },
          update: { $set: gauge },
          upsert: true,
        },
      };
    });

    out.command("Do MongoDB bulkWrite...");
    return ExternalIncentive.bulkWrite(operations);
  } catch (error) {
    return Promise.reject(error);
  }
}

function cleanUp(eventType) {
  out.warn(eventType);
  if (mongoose.connection.readyState) {
    out.command("Performing cleanup...");
    mongoose.connection.close(() => {
      process.exit(0);
    });
  }
}

/**
 * Mongoose connection handlers
 */

mongoose.connection.on("connected", () => {
  out.success("Mongoose connection is open.");
});

mongoose.connection.on("disconnected", () => {
  out.info("Mongoose connection is closed.");
});

/**
 * Process handlers
 */
[
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`,
].forEach((eventType) => {
  process.on(eventType, cleanUp.bind(null, eventType));
});
