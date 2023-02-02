import mongoose from "mongoose";

const schema = new mongoose.Schema({
  id: { type: String, unique: true, dropDups: true },
  is_perpetual: Boolean,
  distribute_to: {
    lock_query_type: String,
    denom: String,
    duration: String,
    timestamp: Date,
  },
  coins: [
    {
      denom: String,
      amount: String,
    },
  ],
  start_time: Date,
  num_epochs_paid_over: String,
  filled_epochs: String,
  distributed_coins: [
    {
      denom: String,
      amount: String,
    },
  ],
});

export default mongoose.model("ExternalIncentive", schema);

/*
{
    "id": "30246",
    "is_perpetual": false,
    "distribute_to": {
      "lock_query_type": "ByDuration",
      "denom": "gamm/pool/856",
      "duration": "604800s",
      "timestamp": "1970-01-01T00:00:00Z"
    },
    "coins": [
      {
        "denom": "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        "amount": "3500000000000"
      }
    ],
    "start_time": "2022-12-23T12:00:00Z",
    "num_epochs_paid_over": "350",
    "filled_epochs": "33",
    "distributed_coins": [
      {
        "denom": "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        "amount": "329999999188"
      }
    ]
  }

  {
      "id": String,
      "is_perpetual": true,
      "distribute_to": {
        "lock_query_type": "ByDuration",
        "denom": String,
        "duration": String,
        "timestamp": "2023-01-25T00:15:03.505Z"
      },
      "coins": [
        {
          "denom": String,
          "amount": String
        }
      ],
      "start_time": "2023-01-25T00:15:03.505Z",
      "num_epochs_paid_over": String,
      "filled_epochs": String,
      "distributed_coins": [
        {
          "denom": String,
          "amount": String
        }
      ]
    }

  */
