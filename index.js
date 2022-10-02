import express from "express";
const app = express();
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// const { By, Builder } = require("selenium-webdriver");
import cron from "node-cron";
import { By, Builder } from "selenium-webdriver";

// import reward.json
import data from './reward.json' assert { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = 3001;
app.use(express.static(__dirname + "/public"));

// ejs
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.send(`success`);
});

// let arr2 = [
//   { G8: "75" },
//   { G7: "479" },
//   { G6: "5774 6135 5729" },
//   { G5: "6857" },
//   { G4: "55052 86443 49540\n52465 14637 62708 82350" },
//   { 5: "0, 2, 7" },
//   { G3: "37139 60175" },
//   { G2: "74461" },
//   { G1: "36078" },
//   { ĐB: "087007" },
// ];

//write file
async function writeFileSystem(value) {
  try {
    let file = "reward.json";
    let content = value;
    let option = "utf8";
    await fs.writeFileSync(file, content, option);
    console.log("saving successs !!!");
  } catch (error) {
    console.log("fail");
  }
}

// selenium
async function getSelenium() {
  let driver;
  let arr = [];
  let rewardGroup = [];
  let start = 2;
  let end = 12;

  let url = "https://xskt.com.vn/xshcm-xstp";
  driver = await new Builder().forBrowser("chrome").build();
  await driver.get(url);

  let title = await driver.getTitle();
  await driver.manage().setTimeouts({ implicit: 500 });

  for (let i = start; i < end; i++) {
    let arr = [];
    let xpathContent = `//*[@id='HCM1']/tbody/tr[${i}]/td`;
    let elements = await driver.findElements(By.xpath(xpathContent));
    for (let e of elements) {
      let value = await e.getText();
      console.log(value);
      arr.push(value);
    }

    //slice arr
    let newArray = arr.slice(0, 2);

    //convert Arr to Object
    let rv = {};
    rv[newArray[0]] = newArray[1];

    rewardGroup.push(rv);
    console.log(rv);
    // console.log(newArray)
  }

  //convert array to json
  let newRewardGroup = JSON.stringify(rewardGroup);
  // write json to json file
  await writeFileSystem(newRewardGroup);

  // console.log(title)
  // console.log(rewardGroup)
  await driver.quit();

  return arr;
}
//cron
// cron.schedule(
//   "*/20 * * * * *",
//   async () => {
//     // console.log('running a task every minute');
//     let value = await getSelenium();
//     await writeFileSystem(value);
//   },
//   {
//     scheduled: true,
//     timezone: "Asia/Ho_Chi_Minh",
//   }
// );

function convertArrtoObject(arr) {
  let result = {};
  for (let i = 0; i < arr.length; i++) {
    result[Object.keys(arr[i])] = Object.values(arr[i]);
  }
  return result;
}
let ejsData = convertArrtoObject(data);

app.get("/index", (req, res) => {
  res.render("index", {
    keys: Object.keys(ejsData),
    values: Object.values(ejsData),
  });
});

app.listen(port, () => console.log(`listen on ${port} !!!`));
