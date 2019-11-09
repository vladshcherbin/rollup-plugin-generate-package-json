import { BigQuery } from '@google-cloud/bigquery'

async function createDataset(datasetName) {
  const bigqueryClient = new BigQuery()
  const [dataset] = await bigqueryClient.createDataset(datasetName)

  return dataset
}

createDataset('test')
