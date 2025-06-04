const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://mohamedalshwadfy24:rbzIt6plx9KBI3cy@namastenode.hciz9mt.mongodb.net/";

const client = new MongoClient(url);

const dbName = "NamasteNode";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("users");

  // the following code examples can be pasted here...

  const data = [
    { name: "Mohamed", age: 24, city: "Cairo" },
    { name: "Ahmed", age: 30, city: "Alexandria" },
    { name: "Sara", age: 22, city: "Giza" },
  ];
  const insertResults = await collection.insertMany([...data]);
  const findResults = await collection.find({}).toArray();
  console.log("collections: ", findResults);

  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
